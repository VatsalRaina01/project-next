import type { AuthorizerDynamicFieldsBound, UserRequieredOutOpt } from './Authorizer'

/**
 * Requires either bound authorizer to pass. Checks `first` first and returns its result immediately
 * if it passes, without evaluating `second`.
 */
export function orAuthorizers<UserRequieredOut extends UserRequieredOutOpt>(
    first: AuthorizerDynamicFieldsBound<UserRequieredOut>,
    second: AuthorizerDynamicFieldsBound<UserRequieredOut>,
): AuthorizerDynamicFieldsBound<UserRequieredOut> {
    return {
        authorize: (session) => {
            const firstResult = first.authorize(session)
            return firstResult.authorized ? firstResult : second.authorize(session)
        },
    }
}
