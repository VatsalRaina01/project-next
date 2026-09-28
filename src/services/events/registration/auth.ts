import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionAndUser } from '@/auth/authorizer/RequirePermissionAndUser'
import { RequirePermissionAndUserId } from '@/auth/authorizer/RequirePermissionAndUserId'
import { RequireUser } from '@/auth/authorizer/RequireUser'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'

export const eventRegistrationAuth = {
    // TODO: Fix authing
    create: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_REGISTRATION_CREATE' }),
    dotPunishmentOfUser: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_ADMIN' }),
    createGuest: RequirePermission.staticFields({ permission: 'EVENT_ADMIN' }),
    readMany: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_READ' }),
    readManyDetailed: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_READ' }),
    destroy: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_DESROY' }),

    updateRegistrationNotes: RequireUser.staticFields({}), // TODO: bypass permission

    // Domain access only: may this session pay for *this* registration - the registrant
    // themselves, or a genuine event admin. Deliberately not eventRegistrationAuth.create
    // (EVENT_REGISTRATION_CREATE is a default permission every member has, and doesn't check
    // userId at all on that branch - fine for "register yourself or someone else", wrong for
    // "spend someone else's ledger balance"). Provider/account-ownership rules are not this
    // operation's business - paymentOperations.create and ledgerTransactionOperations.create
    // already own those.
    createPayment: RequirePermissionAndUserId.staticFields({ permission: 'EVENT_ADMIN' }),
}
