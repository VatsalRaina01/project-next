import { ledgerAccountAccess } from '@/services/ledger/accounts/ownership'
import { Require } from '@/auth/authorizer/Require'
import type { LedgerAccountOwnership } from '@/services/ledger/accounts/ownership'

// Reads are exempt from LEDGER_USE, same as ledgerAccountAuth. Mutations require it.
export const ledgerTransactionAuth = {
    // mode: 'ANY' since being party to one side of the transaction is enough to view it.
    read: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts, { mode: 'ANY' }),

    readPage: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts),

    // A system recomputation step, not meant to be called directly by a user. Its real callers
    // (create below, and the Stripe webhook) always pass bypassAuth. LEDGER_ADMIN here is a
    // safety net for any other caller.
    advance: Require.permission('LEDGER_ADMIN'),

    // Additionally requires ownership of every account the transaction debits.
    create: {
        ledgerUse: Require.permission('LEDGER_USE'),
        accountAccess: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts),
    },

    // mode: 'ANY' since being party to one side of the transaction is enough to cancel a stale
    // attempt on it - same bar as read.
    cancel: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts, { mode: 'ANY' }),
} as const
