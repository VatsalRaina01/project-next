import { AuthResult } from './AuthResult'
import { checkVisibility } from '@/auth/visibility/checkVisibility'
import { visibilityFilter as buildVisibilityFilter } from '@/auth/visibility/visibilityFilter'
import { verifyJWT } from '@/lib/jwt/jwt'
import { ServerError } from '@/services/error'
import type { SessionMaybeUser } from '@/auth/session/Session'
import type { VisibilityFilter } from '@/auth/visibility/visibilityFilter'
import type { OmegaJWTAudience } from '@/lib/jwt/types'
import type { Permission } from '@/prisma-generated-pn-types'
import type { VisibilityMatrix } from '@/services/visibility/types'

type RequireCheckResult<PrismaWhereFilter extends object | undefined = undefined> =
    | { success: true, prismaWhereFilter?: PrismaWhereFilter }
    | { success: false, errorMessage?: string }
type RequireCheck<PrismaWhereFilter extends object | undefined = undefined> =
    (session: SessionMaybeUser) => RequireCheckResult<PrismaWhereFilter>

const defaultMessages = {
    user: 'Du må være innlogget for å få tilgang',
    generic: 'Du har ikke tilgang til denne ressursen',
    noRulesConfigured: 'Ingen regler er konfigurert for denne autorisasjonen',
    permission: (permission: Permission) => `Du trenger tillatelse '${permission}' for å få tilgang`,
    groupAdmin: (groupId: number) => `Du må være gruppeleder for gruppe ${groupId} for å få tilgang`,
}

export class RequireBuilder<PrismaWhereFilter extends object | undefined = undefined> {
    private constructor(private readonly check: RequireCheck<PrismaWhereFilter>) {}

    // The bare entry point, with no rules chained onto it yet, must never authorize anything on
    // its own — otherwise forgetting to add a condition would silently fail open. Every other
    // condition method special-cases starting from this exact instance (see `and` below) so that
    // chaining a real rule onto it isn't itself blocked by this default-deny check.
    static readonly identity = new RequireBuilder<undefined>(() => (
        { success: false, errorMessage: defaultMessages.noRulesConfigured }
    ))

    private and<NextPrismaWhereFilter extends object | undefined = undefined>(
        nextCheck: RequireCheck<NextPrismaWhereFilter>
    ): RequireBuilder<NextPrismaWhereFilter> {
        if ((this as RequireBuilder<object | undefined>) === RequireBuilder.identity) {
            return new RequireBuilder<NextPrismaWhereFilter>(nextCheck)
        }
        return new RequireBuilder<NextPrismaWhereFilter>((session) => {
            const result = this.check(session)
            return result.success ? nextCheck(session) : result
        })
    }

    /**
     * No requirement: always authorized. The permissive counterpart to the bare `Require` entry
     * point (which always denies) — use this where an operation genuinely has no access rule,
     * matching what the legacy `RequireNothing` authorizer meant.
     */
    nothing(): RequireBuilder<undefined> {
        return this.and<undefined>(() => ({ success: true }))
    }

    user(opts?: { errorMessage?: string }): RequireBuilder<undefined> {
        return this.and<undefined>((session) => (
            session.user
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.user }
        ))
    }

    permission(permission: Permission, opts?: { errorMessage?: string }): RequireBuilder<undefined> {
        return this.and<undefined>((session) => (
            session.permissions.includes(permission)
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.permission(permission) }
        ))
    }

    userId(userId: number, opts?: { errorMessage?: string }): RequireBuilder<undefined> {
        return this.and<undefined>((session) => {
            if (!session.user) {
                return { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.user }
            }
            return session.user.id === userId
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.generic }
        })
    }

    userField(
        fields: { username?: string, id?: number, email?: string },
        opts?: { errorMessage?: string }
    ): RequireBuilder<undefined> {
        return this.and<undefined>((session) => {
            const { user } = session
            const matches = user !== null && (
                (fields.id !== undefined && user.id === fields.id) ||
                (fields.username !== undefined && user.username === fields.username) ||
                (fields.email !== undefined && user.email === fields.email)
            )
            return matches
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.generic }
        })
    }

    groupAdmin(groupId: number, opts?: { errorMessage?: string }): RequireBuilder<undefined> {
        return this.and<undefined>((session) => (
            session.memberships.some(membership => membership.groupId === groupId && membership.active && membership.admin)
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.groupAdmin(groupId) }
        ))
    }

    ownership<T>(
        entity: T,
        check: (session: SessionMaybeUser, entity: T) => boolean,
        opts?: { errorMessage?: string }
    ): RequireBuilder<undefined> {
        return this.and<undefined>((session) => (
            check(session, entity)
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.generic }
        ))
    }

    /**
     * Whether the session's group memberships satisfy a visibility matrix (e.g. a CMS article's
     * visibility rules). Mirrors the legacy `RequireVisibility`/`RequireLevelFromDoubleLevelVisibility`
     * authorizers, minus their baked-in permission bypass — compose that explicitly instead:
     * `Require.anyOf(Require.permission('X'), Require.visibility(matrix))`. For a double-level
     * matrix, the caller picks `matrix.regularLevel`/`matrix.adminLevel` before calling this,
     * whether that choice is fixed per operation or decided dynamically from the resource's data.
     */
    visibility(matrix: VisibilityMatrix, opts?: { errorMessage?: string }): RequireBuilder<undefined> {
        return this.and<undefined>((session) => (
            checkVisibility(session.memberships, matrix)
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage }
        ))
    }

    /**
     * Always authorized, but attaches a Prisma `where` filter (via the second positional argument
     * `defineOperation`'s `operation` receives) scoping a list query to what the session's group
     * memberships make visible — for listing operations where filtering out invisible rows is the
     * correct response, not denying the whole request. Bypassed (no filter attached) when the
     * session holds `bypassPermission`. Mirrors the legacy `RequireVisibilityFilter` authorizer.
     */
    visibilityFilter(opts?: { bypassPermission?: Permission | null }): RequireBuilder<VisibilityFilter> {
        return this.and<VisibilityFilter>((session) => (
            (opts?.bypassPermission && session.permissions.includes(opts.bypassPermission))
                ? { success: true }
                : { success: true, prismaWhereFilter: buildVisibilityFilter(session.memberships) }
        ))
    }

    /**
     * Verifies a JWT was signed for `audience`. Mirrors the legacy `RequireJWT` authorizer: a
     * `ServerError` with any other code (e.g. missing server configuration) is rethrown rather
     * than treated as a failed authorization.
     */
    jwt(token: string, audience: OmegaJWTAudience, opts?: { errorMessage?: string }): RequireBuilder<undefined> {
        return this.and<undefined>(() => {
            try {
                verifyJWT(token, audience)
            } catch (err) {
                if (!(err instanceof ServerError) || (err.errorCode !== 'JWT INVALID' && err.errorCode !== 'JWT EXPIRED')) {
                    throw err
                }
                return { success: false, errorMessage: opts?.errorMessage }
            }
            return { success: true }
        })
    }

    /**
     * Escape hatch for checks that don't fit the other methods. `check` must be synchronous —
     * resolve any async data (e.g. a Prisma lookup) before calling this, same as every other
     * condition method.
     */
    custom(
        check: (session: SessionMaybeUser) => boolean | RequireCheckResult,
        opts?: { errorMessage?: string }
    ): RequireBuilder<undefined> {
        return this.and<undefined>((session) => {
            const result = check(session)
            if (typeof result === 'boolean') {
                return result
                    ? { success: true }
                    : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.generic }
            }
            return result
        })
    }

    /** OR: authorized if any of `builders` passes. Every branch is evaluated (an OR can't
     * short-circuit on failure), and on total failure the branches' messages are joined. */
    anyOf(first: RequireBuilder, ...rest: RequireBuilder[]): RequireBuilder<undefined> {
        const builders = [first, ...rest]
        return this.and<undefined>((session) => {
            const results = builders.map(builder => builder.check(session))
            if (results.some(result => result.success)) {
                return { success: true }
            }
            const errorMessage = results
                .map(result => (result.success ? undefined : result.errorMessage))
                .filter((message): message is string => Boolean(message))
                .join(' eller ')
            return { success: false, errorMessage: errorMessage || undefined }
        })
    }

    /** AND: authorized only if all of `builders` pass. Short-circuits on the first failure. */
    allOf(first: RequireBuilder, ...rest: RequireBuilder[]): RequireBuilder<undefined> {
        const builders = [first, ...rest]
        return this.and<undefined>((session) => {
            for (const builder of builders) {
                const result = builder.check(session)
                if (!result.success) return result
            }
            return { success: true }
        })
    }

    authorize(session: SessionMaybeUser):
        AuthResult<'HAS_USER' | 'NO_USER', true, PrismaWhereFilter> | AuthResult<'HAS_USER' | 'NO_USER', false> {
        const result = this.check(session)
        if (result.success) {
            return new AuthResult(session, true, result.prismaWhereFilter as PrismaWhereFilter)
        }
        return new AuthResult(session, false, undefined, result.errorMessage)
    }
}

export const Require: RequireBuilder<undefined> = RequireBuilder.identity
