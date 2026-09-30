import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequireLedgerAccountAccess } from '@/auth/authorizer/RequireLedgerAccountAccess'

export const ledgerMovementAuth = {
    // A deposit credits the account rather than debiting it, so LEDGER_USE alone is enough here.
    // The MANUAL-requires-LEDGER_ADMIN rule lives once, in paymentAuth.create - createDeposit's
    // own (not bypassed) call to paymentOperations.create enforces it there.
    createDeposit: RequirePermission.staticFields({ permission: 'LEDGER_USE' }),

    // A payout debits the account, so ownership is required in addition to LEDGER_USE.
    createPayout: {
        ledgerUse: RequirePermission.staticFields({ permission: 'LEDGER_USE' }),
        accountAccess: RequireLedgerAccountAccess.staticFields({ permission: 'LEDGER_ADMIN' }),
    },
} as const
