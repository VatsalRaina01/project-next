import type { AuthResult } from './AuthResult'
import type { SessionMaybeUser } from '@/auth/session/Session'

export type UserRequieredOutOpt = 'USER_NOT_REQUIERED_FOR_AUTHORIZED' | 'USER_REQUIERED_FOR_AUTHORIZED'

/**
 * The contract every authorizer satisfies, regardless of how it's built — currently only the
 * `Require` builder (see `Require.ts`) — so `defineOperation`'s `authorizer:` getter, and the
 * client-side `useAuthorizer` hook, only need to know about this one shared shape.
 */
export type Authorizer<
    UserRequieredOut extends UserRequieredOutOpt = 'USER_NOT_REQUIERED_FOR_AUTHORIZED' | 'USER_REQUIERED_FOR_AUTHORIZED',
    PrismaWhereFilter extends object | undefined = undefined
> = {
    authorize: (session: SessionMaybeUser) => UserRequieredOut extends 'USER_REQUIERED_FOR_AUTHORIZED'
    ? (AuthResult<'HAS_USER', true, PrismaWhereFilter> | AuthResult<'HAS_USER' | 'NO_USER', false, undefined>)
    : (AuthResult<'HAS_USER' | 'NO_USER', true, PrismaWhereFilter> | AuthResult<'HAS_USER' | 'NO_USER', false, undefined>)
}
