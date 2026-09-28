import { ledgerAccountAccess } from './ownership'
import { Require } from '@/auth/authorizer/Require'
import type { LedgerAccountOwnership } from './ownership'

// Reads are exempt from LEDGER_USE: users can always see their own accounts even if the ledger
// is otherwise disabled. Mutations require LEDGER_USE, plus ownership whenever they act on a
// specific account.
export const ledgerAccountAuth = {
    // A USER account may be self-service created by anyone with LEDGER_USE (see readOrCreate's
    // comment). A GROUP account has no owning user to fall back on, so it's LEDGER_ADMIN only.
    create: {
        ledgerUse: Require.permission('LEDGER_USE'),
        ledgerAdmin: Require.permission('LEDGER_ADMIN'),
    },

    read: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts),

    readMany: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts),

    // Its only caller, paymentOperations.initiate, already requires LEDGER_USE, so the account
    // creation this performs stays gated even though this authorizer alone doesn't check it.
    readOrCreate: (userId: number) => Require.anyOf(Require.permission('LEDGER_ADMIN'), Require.userId(userId)),

    // Browses every account with no owner filter, so this is LEDGER_ADMIN only, not exempt.
    readPage: Require.permission('LEDGER_ADMIN'),

    // Can reassign an account's owner or payout number, so ownership is required too, even
    // though updating doesn't move money.
    update: {
        ledgerUse: Require.permission('LEDGER_USE'),
        accountAccess: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts),
        // Group links decide who can access the account, so changing them is LEDGER_ADMIN only,
        // not covered by ownership like the rest of an update.
        groupAccess: Require.permission('LEDGER_ADMIN'),
    },

    calculateBalances: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts),
    calculateBalance: (accounts: LedgerAccountOwnership[]) => ledgerAccountAccess('LEDGER_ADMIN', accounts),
} as const
