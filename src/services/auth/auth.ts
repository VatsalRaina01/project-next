import { Require } from '@/auth/authorizer/Require'

export const authAuth = {
    // A valid JWT is the entire admission control here, not the session. It's verified directly in
    // the operation body in operations.ts.
    verifyEmail: Require.nothing(),
    resetPassword: Require.nothing(),
    sendResetPasswordEmail: Require.nothing(),
    sendLinkFeideAccountEmail: Require.user(),
    readFeideLoginMatch: Require.user(),
    verifyLinkFeideAccountToken: (token: string) => Require.jwt(token, 'linkfeideaccount'),
    linkFeideAccount: (token: string) => Require.jwt(token, 'linkfeideaccount'),
    adminLinkFeideAccount: Require.permission('USERS_ADMIN'),
}
