import { AuthResult } from './AuthResult'
import { checkVisibility } from '@/auth/visibility/checkVisibility'
import { visibilityFilter as buildVisibilityFilter } from '@/auth/visibility/visibilityFilter'
import type { SessionMaybeUser } from '@/auth/session/Session'
import type { VisibilityFilter } from '@/auth/visibility/visibilityFilter'
import type { Permission } from '@/prisma-generated-pn-types'
import type { DoubleLevelVisibilityMatrix } from '@/services/visibility/types'

/** Marks a builder as needing no further data. `Record<string, never>` would be an index
 * signature forcing *every* property to `never`, collapsing `Data & Record<string, never>` to
 * `never` - this mapped type over zero keys leaves `Data` untouched instead. */
type NoData = Record<never, never>

type RequireCheckResult<PrismaWhereFilter extends object | undefined = undefined> =
    | { success: true, prismaWhereFilter?: PrismaWhereFilter }
    | { success: false, errorMessage?: string }
type RequireCheck<Data extends object = NoData, PrismaWhereFilter extends object | undefined = undefined> =
    (args: { session: SessionMaybeUser } & Data) => RequireCheckResult<PrismaWhereFilter>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRequireCheck = RequireCheck<any, any>

// `Data` is contravariant here, so `RequireBuilder<object>` would only accept builders needing
// *no* data. `any` escapes that, letting `anyOf`/`allOf` accept builders with heterogeneous `Data`.
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

/** ANDs every check in `group`, short-circuiting on the first failure. Returns the last check's
 * own result on success, so a trailing `.visibilityFilter()` still gets its `prismaWhereFilter`
 * through. */
function evaluateGroup<PrismaWhereFilter extends object | undefined>(
    group: readonly RequireCheck<object, PrismaWhereFilter>[],
    args: { session: SessionMaybeUser }
): RequireCheckResult<PrismaWhereFilter> {
    if (group.length === 0) return { success: false, errorMessage: defaultMessages.noRulesConfigured }
    let result: RequireCheckResult<PrismaWhereFilter> = { success: true }
    for (const check of group) {
        result = check(args)
        if (!result.success) return result
    }
    return result
}

/**
 * A chain of authorization rules, built once and reusable across calls. Static conditions (e.g.
 * `.permission()`) take their value immediately; conditions that depend on the request (e.g.
 * `.userId()`) instead register what they'll need in `Data`, supplied later via `.data()` - so
 * `Require.permission('X').userId()` can be defined once at module scope, with `userId` filled in
 * per call via `.data({ userId })`. `.auth()` only exists once `Data` is fully supplied.
 *
 * Internally, a chain is `groups`: AND-groups OR'd together. Condition methods append to the last
 * group; `.or()` starts a new, empty one. An empty group always fails - including the whole
 * chain, not just that branch - so a dangling `.or()` breaks loudly instead of quietly doing less.
 */
export class RequireBuilder<Data extends object = NoData, PrismaWhereFilter extends object | undefined = undefined> {
    private constructor(private readonly groups: readonly (readonly AnyRequireCheck[])[]) {}

    static readonly identity = new RequireBuilder<NoData>([[]])

    /** ANDs `otherGroups` onto the last group only, distributing if there's more than one.
     * The one primitive behind every condition method, `anyOf` and `allOf` alike. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private appendToLastGroup(otherGroups: readonly (readonly AnyRequireCheck[])[]): RequireBuilder<any, any> {
        const precedingGroups = this.groups.slice(0, -1)
        const lastGroup = this.groups[this.groups.length - 1]
        const newGroups = otherGroups.map(otherGroup => [...lastGroup, ...otherGroup])
        return new RequireBuilder([...precedingGroups, ...newGroups])
    }

    private and<NextData extends object = NoData, NextPrismaWhereFilter extends object | undefined = undefined>(
        nextCheck: RequireCheck<NextData, NextPrismaWhereFilter>
    ): RequireBuilder<Data & NextData, NextPrismaWhereFilter> {
        return this.appendToLastGroup([[nextCheck]])
    }

    /** No requirement: always authorized. For an operation with genuinely no access rule. */
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

    /** A caller-defined check. `check` reads whatever it needs off `Ownership`, supplied later via
     * `.data()`, e.g. `Require.ownership<{ ledgerAccount }>(({ ledgerAccount }) => ...)`. */
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

    /** Whether the session satisfies one level of a double-level visibility matrix. Needs
     * `{ visibility: DoubleLevelVisibilityMatrix }` via `.data()`. `level` picks which half, and
     * belongs in auth.ts - fixed per operation, or chosen from the resource's own data - never
     * left for the caller to pick by supplying "the correct half" in `.data()` instead.
     *
     * Not `.visibility()`: that name is kept for a resource with a single level, where there is no
     * half to choose. No resource has one yet, so that method does not exist. */
    levelOfDoubleVisibility(opts: { level: 'regularLevel' | 'adminLevel', errorMessage?: string }):
        RequireBuilder<Data & { visibility: DoubleLevelVisibilityMatrix }> {
        return this.and<{ visibility: DoubleLevelVisibilityMatrix }>(({ session, visibility }) => (
            checkVisibility(session.memberships, visibility[opts.level])
                ? { success: true }
                : { success: false, errorMessage: opts.errorMessage }
        ))
    }

    /** Always authorized, but attaches a Prisma `where` filter (the second positional argument
     * `defineOperation`'s `operation` receives) scoping a list query to what's visible - for
     * listing operations where filtering out invisible rows is correct, not denying the request.
     * No filter attached when the session holds `bypassPermission`. */
    visibilityFilter(opts?: { bypassPermission?: Permission | null }): RequireBuilder<Data, VisibilityFilter> {
        return this.and<NoData, VisibilityFilter>(({ session }) => (
            (opts?.bypassPermission && session.permissions.includes(opts.bypassPermission))
                ? { success: true }
                : { success: true, prismaWhereFilter: buildVisibilityFilter(session.memberships) }
        ))
    }

    /** Escape hatch for checks that don't fit the other methods. `check` must be synchronous -
     * resolve any async data (e.g. a Prisma lookup) first. Give it a `CustomData` type argument
     * like `.ownership()` if it needs data supplied later via `.data()`. */
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

    /** Starts a new group, OR'd against everything before it, e.g.
     * `Require.permission('IMAGE_ADMIN').or().levelOfDoubleVisibility({ level: 'regularLevel' })`. Takes no
     * argument - to OR in an already-built builder, follow it with `.allOf(thatBuilder)` (`allOf`
     * of one builder is just that builder). Leaving it dangling fails the whole chain; see the
     * class doc. `anyOf`/`allOf` are for three-or-more or dynamic composition instead. */
    or(): RequireBuilder<Data, PrismaWhereFilter> {
        return new RequireBuilder([...this.groups, []])
    }

    /** OR: authorized if any of `builders` passes. Every branch is evaluated, and on total
     * failure the branches' messages are joined. */
    anyOf<Builders extends readonly [AnyRequireBuilder, ...AnyRequireBuilder[]]>(
        ...builders: Builders
    ): RequireBuilder<Data & CombinedData<Builders>> {
        return this.appendToLastGroup(builders.flatMap(builder => builder.groups))
    }

    /** AND: authorized only if all of `builders` pass. Short-circuits on the first failure. */
    allOf<Builders extends readonly [AnyRequireBuilder, ...AnyRequireBuilder[]]>(
        ...builders: Builders
    ): RequireBuilder<Data & CombinedData<Builders>> {
        const andedGroups = builders.reduce<readonly (readonly AnyRequireCheck[])[]>((groups, builder) => (
            groups.flatMap(group => builder.groups.map(otherGroup => [...group, ...otherGroup]))
        ), [[]])
        return this.appendToLastGroup(andedGroups)
    }

    /** Supplies everything this chain still needs. Can be called anywhere in the chain — before or
     * after further conditions are added — as long as everything is supplied by the time
     * `.auth()` is called. */
    data(this: RequireBuilder<Data, PrismaWhereFilter>, data: Data): RequireBuilder<NoData, PrismaWhereFilter> {
        const groups = this.groups.map(group => group.map(check =>
            (args: { session: SessionMaybeUser }) => check({ ...args, ...data } as { session: SessionMaybeUser } & Data)
        ))
        return new RequireBuilder<NoData, PrismaWhereFilter>(groups)
    }

    /** Only callable once every field `Data` required has been supplied via `.data()` — a chain
     * with anything still missing is a type error here, not a runtime surprise. */
    auth(this: RequireBuilder<NoData, PrismaWhereFilter>, session: SessionMaybeUser):
        AuthResult<'HAS_USER' | 'NO_USER', true, PrismaWhereFilter> | AuthResult<'HAS_USER' | 'NO_USER', false> {
        const args = { session } as { session: SessionMaybeUser } & NoData
        // An empty group poisons the whole chain - see the class doc.
        if (this.groups.some(group => group.length === 0)) {
            return new AuthResult(session, false, undefined, defaultMessages.noRulesConfigured)
        }
        const groupResults = this.groups.map(group => evaluateGroup(group, args))
        const successResult = groupResults.find(result => result.success)
        if (successResult) {
            // Only a lone group's own prismaWhereFilter is trusted through - several groups may disagree.
            const result = this.groups.length === 1 ? successResult : { success: true as const }
            return new AuthResult(session, true, (result as { prismaWhereFilter?: PrismaWhereFilter }).prismaWhereFilter)
        }
        const errorMessage = groupResults
            .map(result => (result.success ? undefined : result.errorMessage))
            .filter((message): message is string => Boolean(message))
            .join(' eller ')
        return new AuthResult(session, false, undefined, errorMessage || undefined)
    }
}

export const Require: RequireBuilder = RequireBuilder.identity
