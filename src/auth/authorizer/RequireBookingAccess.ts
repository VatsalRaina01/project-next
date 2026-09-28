import { AuthorizerFactory } from './Authorizer'
import type { Permission } from '@/prisma-generated-pn-types'

/**
 * Authorized if the session holds `permission`, the session user owns the booking, or the
 * caller supplied the booking's secret. The secret is how a guest booking (created without a
 * session) can be resumed and paid for later without logging in.
 */
export const RequireBookingAccess = AuthorizerFactory<
    { permission: Permission },
    { userId: number | null, secret: string, providedSecret?: string },
    'USER_NOT_REQUIERED_FOR_AUTHORIZED'
>(({ session, staticFields, dynamicFields }) => {
    if (session.permissions.includes(staticFields.permission)) {
        return { success: true, session }
    }

    if (session.user !== null && session.user.id === dynamicFields.userId) {
        return { success: true, session }
    }

    if (dynamicFields.providedSecret !== undefined && dynamicFields.providedSecret === dynamicFields.secret) {
        return { success: true, session }
    }

    return {
        success: false,
        session,
        errorMessage: 'Du har ikke tilgang til denne bookingen.'
    }
})
