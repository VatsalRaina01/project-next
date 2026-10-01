/**
 * The Feide identity a link request wants to move onto a migrated user. Only fields
 * Feide sets are used - the requester can change their user's email, so the email
 * shown is the one on the Feide account.
 */
export type FeideIdentity = {
    userId: number,
    feideAccountId: string,
    name: string,
    email: string,
}
