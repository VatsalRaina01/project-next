import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionAndUserId } from '@/auth/authorizer/RequirePermissionAndUserId'
import { RequireBookingAccess } from '@/auth/authorizer/RequireBookingAccess'
import { andAuthorizers } from '@/auth/authorizer/andAuthorizers'
import type { PaymentProvider } from '@/prisma-generated-pn-types'

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

    // Authorized if the caller owns the booking (session or matching secret - guest bookings
    // have no session to check ownership against), holds CABIN_BOOKING_ADMIN, or - like
    // ledgerMovementAuth.createDeposit - additionally holds LEDGER_ADMIN when paying MANUAL.
    createPayment: (
        provider: PaymentProvider | undefined,
        booking: { userId: number | null, secret: string },
        providedSecret: string,
    ) => {
        const base = andAuthorizers(
            RequireBookingAccess.staticFields({ permission: 'CABIN_BOOKING_ADMIN' }).dynamicFields({
                userId: booking.userId,
                secret: booking.secret,
                providedSecret,
            }),
            RequirePermission.staticFields({ permission: 'LEDGER_USE' }).dynamicFields({}),
        )

        if (provider !== 'MANUAL') return base

        return andAuthorizers(
            base,
            RequirePermission.staticFields({ permission: 'LEDGER_ADMIN' }).dynamicFields({}),
        )
    },
}

