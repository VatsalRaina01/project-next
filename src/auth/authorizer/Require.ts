import { AuthResult } from './AuthResult'
import { checkVisibility } from '@/auth/visibility/checkVisibility'
import { visibilityFilter as buildVisibilityFilter } from '@/auth/visibility/visibilityFilter'
import type { SessionMaybeUser } from '@/auth/session/Session'
import type { VisibilityFilter } from '@/auth/visibility/visibilityFilter'
import type { Permission } from '@/prisma-generated-pn-types'
import type { VisibilityMatrix } from '@/services/visibility/types'

/** The empty-object marker: a builder whose Data requirement is this has nothing left to supply.
 * Deliberately `Record<never, never>` (a mapped type over zero keys, i.e. structurally `{}`) and
 * not `Record<string, never>` — the latter is an index signature constraining *every* property
 * (explicit or not) to `never`, which collapses `Data & Record<string, never>` to `never` instead
 * of leaving `Data` untouched. */
type NoData = Record<never, never>

type RequireCheckResult<PrismaWhereFilter extends object | undefined = undefined> =
    | { success: true, prismaWhereFilter?: PrismaWhereFilter }
    | { success: false, errorMessage?: string }
type RequireCheck<Data extends object = NoData, PrismaWhereFilter extends object | undefined = undefined> =
    (args: { session: SessionMaybeUser } & Data) => RequireCheckResult<PrismaWhereFilter>

// `Data` sits in a contravariant (function-parameter) position on `RequireBuilder`, so a bound
// like `RequireBuilder<object>` would - counterintuitively - only accept builders needing *no*
// data, not builders needing *any* data. `any` is the deliberate escape from that variance check:
// it's what actually lets `anyOf`/`allOf` accept a tuple of builders with heterogeneous `Data`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRequireBuilder = RequireBuilder<any>

/** Extracts and intersects the `Data` every builder in a tuple still needs, for `anyOf`/`allOf`. */
type CombinedData<Builders extends readonly AnyRequireBuilder[]> =
    Builders extends readonly [RequireBuilder<infer Data>, ...infer Rest]
        ? Rest extends readonly AnyRequireBuilder[] ? Data & CombinedData<Rest> : Data
        : NoData

const defaultMessages = {
    user: 'Du må være innlogget for å få tilgang',
    generic: 'Du har ikke tilgang til denne ressursen',
    noRulesConfigured: 'Ingen regler er konfigurert for denne autorisasjonen',
    permission: (permission: Permission) => `Du trenger tillatelse '${permission}' for å få tilgang`,
    groupAdmin: (groupId: number) => `Du må være gruppeleder for gruppe ${groupId} for å få tilgang`,
}

/**
 * A chain of authorization rules, built once and reusable across calls. Static conditions (e.g.
 * `.permission()`) take their value immediately; conditions that depend on the request (e.g.
 * `.userId()`, `.ownership()`) instead register what they'll need in `Data` and read it back out
 * of the object passed to `.data()` once it's known — so a chain like
 * `Require.permission('X').userId()` can be defined once at module scope, with the actual
 * `userId` supplied per call via `.data({ userId })`. `Data` tracks, at the type level, exactly
 * what's still missing — `.authorize()` only exists once every field has been supplied.
 */
export class RequireBuilder<Data extends object = NoData, PrismaWhereFilter extends object | undefined = undefined> {
    private constructor(private readonly check: RequireCheck<Data, PrismaWhereFilter>) {}

    // The bare entry point, with no rules chained onto it yet, must never authorize anything on
    // its own — otherwise forgetting to add a condition would silently fail open. Every other
    // condition method special-cases starting from this exact instance (see `and` below) so that
    // chaining a real rule onto it isn't itself blocked by this default-deny check.
    static readonly identity = new RequireBuilder<NoData>(() => (
        { success: false, errorMessage: defaultMessages.noRulesConfigured }
    ))

    private and<NextData extends object = NoData, NextPrismaWhereFilter extends object | undefined = undefined>(
        nextCheck: RequireCheck<NextData, NextPrismaWhereFilter>
    ): RequireBuilder<Data & NextData, NextPrismaWhereFilter> {
        if ((this as unknown as RequireBuilder<NoData>) === RequireBuilder.identity) {
            // Chaining the first real condition onto the bare entry point: nothing to AND against.
            return new RequireBuilder<Data & NextData, NextPrismaWhereFilter>(
                nextCheck as RequireCheck<Data & NextData, NextPrismaWhereFilter>
            )
        }
        return new RequireBuilder<Data & NextData, NextPrismaWhereFilter>((args) => {
            const result = this.check(args)
            return result.success ? nextCheck(args) : result
        })
    }

    /**
     * No requirement: always authorized. The permissive counterpart to the bare `Require` entry
     * point (which always denies) — use this where an operation genuinely has no access rule,
     * matching what the legacy `RequireNothing` authorizer meant.
     */
    nothing(): RequireBuilder<Data> {
        return this.and(() => ({ success: true }))
    }

    user(opts?: { errorMessage?: string }): RequireBuilder<Data> {
        return this.and(({ session }) => (
            session.user
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.user }
        ))
    }

    permission(permission: Permission, opts?: { errorMessage?: string }): RequireBuilder<Data> {
        return this.and(({ session }) => (
            session.permissions.includes(permission)
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.permission(permission) }
        ))
    }

    /** Needs `{ userId: number }` supplied via `.data()` before it can be authorized. */
    userId(opts?: { errorMessage?: string }): RequireBuilder<Data & { userId: number }> {
        return this.and<{ userId: number }>(({ session, userId }) => {
            if (!session.user) {
                return { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.user }
            }
            return session.user.id === userId
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.generic }
        })
    }

    /** Needs `{ userField: { username?, id?, email? } }` supplied via `.data()`. */
    userField(opts?: { errorMessage?: string }):
        RequireBuilder<Data & { userField: { username?: string, id?: number, email?: string } }> {
        return this.and<{ userField: { username?: string, id?: number, email?: string } }>(({ session, userField }) => {
            const { user } = session
            const matches = user !== null && (
                (userField.id !== undefined && user.id === userField.id) ||
                (userField.username !== undefined && user.username === userField.username) ||
                (userField.email !== undefined && user.email === userField.email)
            )
            return matches
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.generic }
        })
    }

    /** Needs `{ groupId: number }` supplied via `.data()`. */
    groupAdmin(opts?: { errorMessage?: string }): RequireBuilder<Data & { groupId: number }> {
        return this.and<{ groupId: number }>(({ session, groupId }) => (
            session.memberships.some(membership => membership.groupId === groupId && membership.active && membership.admin)
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.groupAdmin(groupId) }
        ))
    }

    /**
     * A caller-defined ownership check. `check` reads whatever it needs off `Ownership` (supplied
     * later via `.data()`) alongside `session` — e.g.
     * `Require.ownership<{ ledgerAccount: LedgerAccount }>(({ session, ledgerAccount }) => ...)`,
     * then later `.data({ ledgerAccount })`.
     */
    ownership<Ownership extends object>(
        check: (args: { session: SessionMaybeUser } & Ownership) => boolean,
        opts?: { errorMessage?: string }
    ): RequireBuilder<Data & Ownership> {
        return this.and<Ownership>((args) => (
            check(args)
                ? { success: true }
                : { success: false, errorMessage: opts?.errorMessage ?? defaultMessages.generic }
        ))
    }

    /**
     * Whether the session's group memberships satisfy a visibility matrix (e.g. a CMS article's
     * visibility rules) — needs `{ visibility: VisibilityMatrix }` supplied via `.data()`. Mirrors
     * the legacy `RequireVisibility`/`RequireLevelFromDoubleLevelVisibility` authorizers, minus
     * their baked-in permission bypass — compose that explicitly instead:
     * `Require.anyOf(Require.permission('X'), Require.visibility())`. For a double-level matrix,
     * pass `matrix.regularLevel`/`matrix.adminLevel` as `visibility` in `.data()`, whether that
     * choice is fixed per operation or decided dynamically from the resource's own data.
     */
    visibility(opts?: { errorMessage?: string }): RequireBuilder<Data & { visibility: VisibilityMatrix }> {
        return this.and<{ visibility: VisibilityMatrix }>(({ session, visibility }) => (
            checkVisibility(session.memberships, visibility)
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
    visibilityFilter(opts?: { bypassPermission?: Permission | null }): RequireBuilder<Data, VisibilityFilter> {
        return this.and<NoData, VisibilityFilter>(({ session }) => (
            (opts?.bypassPermission && session.permissions.includes(opts.bypassPermission))
                ? { success: true }
                : { success: true, prismaWhereFilter: buildVisibilityFilter(session.memberships) }
        ))
    }

    /**
     * Escape hatch for checks that don't fit the other methods. `check` must be synchronous —
     * resolve any async data (e.g. a Prisma lookup) before calling this, same as every other
     * condition method. Give it a `CustomData` type argument the same way as `.ownership()` if it
     * needs data supplied later via `.data()`; it needs none by default.
     */
    custom<CustomData extends object = NoData>(
        check: (args: { session: SessionMaybeUser } & CustomData) => boolean | RequireCheckResult,
        opts?: { errorMessage?: string }
    ): RequireBuilder<Data & CustomData> {
        return this.and<CustomData>((args) => {
            const result = check(args)
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
    anyOf<Builders extends readonly [AnyRequireBuilder, ...AnyRequireBuilder[]]>(
        ...builders: Builders
    ): RequireBuilder<Data & CombinedData<Builders>> {
        return this.and<CombinedData<Builders>>((args) => {
            const results = builders.map(builder => builder.check(args))
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
    allOf<Builders extends readonly [AnyRequireBuilder, ...AnyRequireBuilder[]]>(
        ...builders: Builders
    ): RequireBuilder<Data & CombinedData<Builders>> {
        return this.and<CombinedData<Builders>>((args) => {
            for (const builder of builders) {
                const result = builder.check(args)
                if (!result.success) return result
            }
            return { success: true }
        })
    }

    /** Supplies everything this chain still needs. Can be called anywhere in the chain — before or
     * after further conditions are added — as long as everything is supplied by the time
     * `.authorize()` is called. */
    data(this: RequireBuilder<Data, PrismaWhereFilter>, data: Data): RequireBuilder<NoData, PrismaWhereFilter> {
        const { check } = this
        return new RequireBuilder<NoData, PrismaWhereFilter>(({ session }) => check({ session, ...data } as (
            { session: SessionMaybeUser } & Data
        )))
    }

    /** Only callable once every field `Data` required has been supplied via `.data()` — a chain
     * with anything still missing is a type error here, not a runtime surprise. */
    authorize(this: RequireBuilder<NoData, PrismaWhereFilter>, session: SessionMaybeUser):
        AuthResult<'HAS_USER' | 'NO_USER', true, PrismaWhereFilter> | AuthResult<'HAS_USER' | 'NO_USER', false> {
        const result = this.check({ session } as { session: SessionMaybeUser } & NoData)
        if (result.success) {
            return new AuthResult(session, true, result.prismaWhereFilter as PrismaWhereFilter)
        }
        return new AuthResult(session, false, undefined, result.errorMessage)
    }
}

export const Require: RequireBuilder = RequireBuilder.identity
