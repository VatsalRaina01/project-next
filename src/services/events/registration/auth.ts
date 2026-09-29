import { RequireLevelFromDoubleLevelVisibility } from '@/auth/authorizer/RequireLevelFromDoubleLevelVisibility'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'
import { andAuthorizers } from '@/auth/authorizer/andAuthorizers'
import { orAuthorizers } from '@/auth/authorizer/orAuthorizers'
import type { DoubleLevelVisibilityMatrix } from '@/services/visibility/types'

/**
 * The regular level of an event is what it takes to register for it, and its admin level is what it
 * takes to act on the registrations of everyone else. EVENT_ADMIN bypasses both for every event.
 */
const registerLevel = RequireLevelFromDoubleLevelVisibility.staticFields({
    level: 'REGULAR', bypassPermission: 'EVENT_ADMIN'
})
const eventAdminLevel = RequireLevelFromDoubleLevelVisibility.staticFields({
    level: 'ADMIN', bypassPermission: 'EVENT_ADMIN'
})
const ownUserOrEventAdmin = RequireUserIdOrPermission.staticFields({ permission: 'EVENT_ADMIN' })

/**
 * Acting on the registration of a given user: their own, or anyone's for those who administrate the
 * event. A registration with no user behind it is a guest, and only an administrator owns those.
 */
const registrationOfUser = ({ userId, doubleLevelMatrix }: {
    userId: number | null,
    doubleLevelMatrix: DoubleLevelVisibilityMatrix,
}) => (userId === null ? eventAdminLevel.dynamicFields({ doubleLevelMatrix }) : orAuthorizers(
    ownUserOrEventAdmin.dynamicFields({ userId }),
    eventAdminLevel.dynamicFields({ doubleLevelMatrix }),
))

export const eventRegistrationAuth = {
    /**
     * Registering takes the regular level of the event, and registering anyone but yourself takes
     * its admin level on top of that.
     */
    create: {
        dynamicFields: (fields: {
            userId: number,
            doubleLevelMatrix: DoubleLevelVisibilityMatrix,
        }) => andAuthorizers(
            registerLevel.dynamicFields({ doubleLevelMatrix: fields.doubleLevelMatrix }),
            registrationOfUser(fields),
        ),
    },
    createGuest: eventAdminLevel,

    readDotPunishmentOfUser: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_ADMIN' }),
    readOfUser: { dynamicFields: registrationOfUser },
    readPage: registerLevel,
    readPageDetailed: eventAdminLevel,

    updateNotes: { dynamicFields: registrationOfUser },
    destroy: { dynamicFields: registrationOfUser },

    // Domain access only: may this session pay for *this* registration - the registrant
    // themselves, or a genuine event admin. Deliberately not eventRegistrationAuth.create
    // (EVENT_REGISTRATION_CREATE is a default permission every member has, and doesn't check
    // userId at all on that branch - fine for "register yourself or someone else", wrong for
    // "spend someone else's ledger balance"). Provider/account-ownership rules are not this
    // operation's business - paymentOperations.create and ledgerTransactionOperations.create
    // already own those.
    createPayment: ownUserOrEventAdmin,
} as const
