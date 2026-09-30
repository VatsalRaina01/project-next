// How long a PENDING transaction attempt (e.g. an abandoned Stripe checkout) is treated as
// still legitimately in flight before a new payment attempt for the same resource is allowed to
// cancel it and retry. Long enough not to race a real, slow-but-active checkout; short enough
// that an abandoned one doesn't lock a user out for good.
export const stalePendingTransactionMs = 30 * 60 * 1000
