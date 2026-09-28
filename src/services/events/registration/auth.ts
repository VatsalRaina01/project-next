import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionAndUser } from '@/auth/authorizer/RequirePermissionAndUser'
import { RequireUser } from '@/auth/authorizer/RequireUser'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'
import { andAuthorizers } from '@/auth/authorizer/andAuthorizers'
import type { PaymentProvider } from '@/prisma-generated-pn-types'

export const eventRegistrationAuth = {
    // TODO: Fix authing
    create: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_REGISTRATION_CREATE' }),
    dotPunishmentOfUser: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_ADMIN' }),
    createGuest: RequirePermission.staticFields({ permission: 'EVENT_ADMIN' }),
    readMany: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_READ' }),
    readManyDetailed: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_READ' }),
    destroy: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_DESROY' }),

    updateRegistrationNotes: RequireUser.staticFields({}), // TODO: bypass permission

    // Same rule as ledgerMovementAuth.createDeposit: MANUAL additionally requires LEDGER_ADMIN,
    // since it marks itself SUCCEEDED immediately with a caller-supplied fee and no real
    // payment ever collected.
    createPayment: (provider: PaymentProvider | undefined, userId: number) => {
        const base = andAuthorizers(
            eventRegistrationAuth.create.dynamicFields({ userId }),
            RequirePermission.staticFields({ permission: 'LEDGER_USE' }).dynamicFields({}),
        )

        if (provider !== 'MANUAL') return base

        return andAuthorizers(
            base,
            RequirePermission.staticFields({ permission: 'LEDGER_ADMIN' }).dynamicFields({}),
        )
    },
}
