import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionAndUserId } from '@/auth/authorizer/RequirePermissionAndUserId'
import { RequireBookingAccess } from '@/auth/authorizer/RequireBookingAccess'

export const cabinBookingAuth = {
    createCabinBookingUserAttached: RequirePermissionAndUserId.staticFields({
        permission: 'CABIN_USE'
    }),

    createCabinBookingNoUser: RequirePermission.staticFields({
        permission: 'CABIN_USE'
    }),

    createBedBookingUserAttached: RequirePermissionAndUserId.staticFields({
        permission: 'CABIN_USE'
    }),

    createBedBookingNoUser: RequirePermission.staticFields({
        permission: 'CABIN_USE'
    }),

    readAvailability: RequirePermission.staticFields({
        permission: 'CABIN_USE'
    }),

    readMany: RequirePermission.staticFields({
        permission: 'CABIN_ADMIN'
    }),

    read: RequirePermission.staticFields({
        permission: 'CABIN_ADMIN'
    }),

    readSpecialCmsParagraphCabinContract: RequirePermission.staticFields({
        permission: 'CABIN_USE'
    }),

    updateSpecialCmsParagraphContentCabinContract: RequirePermission.staticFields({
        permission: 'CABIN_ADMIN'
    }),

    // Domain access only: may this session pay for *this* booking - owns it (session, or the
    // matching secret for a guest booking with no session to check ownership against) or holds
    // CABIN_ADMIN. Provider/account-ownership rules are not this operation's business -
    // paymentOperations.create and ledgerTransactionOperations.create already own those.
    createPayment: (
        booking: { userId: number | null, secret: string },
        providedSecret: string,
    ) => RequireBookingAccess.staticFields({ permission: 'CABIN_ADMIN' }).dynamicFields({
        userId: booking.userId,
        secret: booking.secret,
        providedSecret,
    }),
} as const

