import { Require } from '@/auth/authorizer/Require'

// Creating a Stripe customer, a checkout session or a setup intent all stay strictly
// self-service. None of these may be used to pay, or save a new payment method, on another
// user's behalf, not even by admins. Listing and deleting saved payment methods are exempted
// for LEDGER_ADMIN, so admins can audit or clean up cards without being able to spend them.
export const stripeCustomerAuth = {
    readOrCreate: (userId: number) => Require.userId(userId),
    createSession: (userId: number) => Require.userId(userId),
    createSetupIntent: (userId: number) => Require.userId(userId),

    readSavedPaymentMethods: (userId: number) => Require.anyOf(Require.permission('LEDGER_ADMIN'), Require.userId(userId)),
    deleteSavedPaymentMethod: (userId: number) => Require.anyOf(Require.permission('LEDGER_ADMIN'), Require.userId(userId)),
} as const
