import { Require } from '@/auth/authorizer/Require'
import type { DoubleLevelVisibilityMatrix } from '@/services/visibility/types'

/**
 * The regular level of an event is what it takes to register for it, and its admin level is what it
 * takes to act on the registrations of everyone else. EVENT_ADMIN bypasses both for every event.
 */
const levelAuthorizer = Require.anyOf(Require.permission('EVENT_ADMIN'), Require.visibility())
const registerLevel = (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
    levelAuthorizer.data({ visibility: doubleLevelMatrix.regularLevel })
const eventAdminLevel = (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
    levelAuthorizer.data({ visibility: doubleLevelMatrix.adminLevel })
const userIdOrEventAdmin = Require.anyOf(Require.permission('EVENT_ADMIN'), Require.userId())
const ownUserOrEventAdmin = (userId: number) => userIdOrEventAdmin.data({ userId })

/**
 * Acting on the registration of a given user: their own, or anyone's for those who administrate the
 * event. A registration with no user behind it is a guest, and only an administrator owns those.
 */
const registrationOfUser = ({ userId, doubleLevelMatrix }: {
    userId: number | null,
    doubleLevelMatrix: DoubleLevelVisibilityMatrix,
}) => (userId === null ? eventAdminLevel(doubleLevelMatrix) : Require.anyOf(
    ownUserOrEventAdmin(userId),
    eventAdminLevel(doubleLevelMatrix),
))

export const eventRegistrationAuth = {
    /**
     * Registering takes the regular level of the event, and registering anyone but yourself takes
     * its admin level on top of that.
     */
    create: (fields: {
        userId: number,
        doubleLevelMatrix: DoubleLevelVisibilityMatrix,
    }) => Require.allOf(
        registerLevel(fields.doubleLevelMatrix),
        registrationOfUser(fields),
    ),
    createGuest: (doubleLevelMatrix: DoubleLevelVisibilityMatrix) => eventAdminLevel(doubleLevelMatrix),

    readDotPunishmentOfUser: (userId: number) => ownUserOrEventAdmin(userId),
    readOfUser: registrationOfUser,
    readPage: (doubleLevelMatrix: DoubleLevelVisibilityMatrix) => registerLevel(doubleLevelMatrix),
    readPageDetailed: (doubleLevelMatrix: DoubleLevelVisibilityMatrix) => eventAdminLevel(doubleLevelMatrix),

    updateNotes: registrationOfUser,
    destroy: registrationOfUser,

    // Domain access only: may this session pay for *this* registration - the registrant
    // themselves, or a genuine event admin. Deliberately not eventRegistrationAuth.create
    // (EVENT_USE is a default permission every member has, and doesn't check
    // userId at all on that branch - fine for "register yourself or someone else", wrong for
    // "spend someone else's ledger balance"). Provider/account-ownership rules are not this
    // operation's business - paymentOperations.create and ledgerTransactionOperations.create
    // already own those.
    createPayment: (userId: number) => ownUserOrEventAdmin(userId),
} as const
