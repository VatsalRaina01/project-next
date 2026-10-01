import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionAndUserId } from '@/auth/authorizer/RequirePermissionAndUserId'
import { RequireBookingAccess } from '@/auth/authorizer/RequireBookingAccess'

export const cabinBookingAuth = {
    createCabinBookingUserAttached: RequirePermissionAndUserId.staticFields({
        permission: 'CABIN_BOOKING_CABIN_CREATE'
    }),

    createCabinBookingNoUser: RequirePermission.staticFields({
        permission: 'CABIN_BOOKING_CABIN_CREATE'
    }),

    createBedBookingUserAttached: RequirePermissionAndUserId.staticFields({
        permission: 'CABIN_BOOKING_BED_CREATE'
    }),

    createBedBookingNoUser: RequirePermission.staticFields({
        permission: 'CABIN_BOOKING_BED_CREATE'
    }),

    readAvailability: RequirePermission.staticFields({
        permission: 'CABIN_CALENDAR_READ'
    }),

    readMany: RequirePermission.staticFields({
        permission: 'CABIN_BOOKING_ADMIN'
    }),

    read: RequirePermission.staticFields({
        permission: 'CABIN_BOOKING_ADMIN'
    }),

    readSpecialCmsParagraphCabinContract: RequirePermission.staticFields({
        permission: 'CABIN_CALENDAR_READ'
    }),

    updateSpecialCmsParagraphContentCabinContract: RequirePermission.staticFields({
        permission: 'CABIN_BOOKING_ADMIN'
    }),

    // Domain access only: may this session pay for *this* booking - owns it (session, or the
    // matching secret for a guest booking with no session to check ownership against) or holds
    // CABIN_BOOKING_ADMIN. Provider/account-ownership rules are not this operation's business -
    // paymentOperations.create and ledgerTransactionOperations.create already own those.
    createPayment: (
        booking: { userId: number | null, secret: string },
        providedSecret: string,
    ) => RequireBookingAccess.staticFields({ permission: 'CABIN_BOOKING_ADMIN' }).dynamicFields({
        userId: booking.userId,
        secret: booking.secret,
        providedSecret,
    }),
} as const

