import { Require } from '@/auth/authorizer/Require'

export const authAuth = {
    verifyEmail: Require.jwt('verifyemail'),
    resetPassword: Require.jwt('resetpassword'),
    sendResetPasswordEmail: Require.nothing(),
    sendLinkFeideAccountEmail: Require.user(),
    readFeideLoginMatch: Require.user(),
    verifyLinkFeideAccountToken: (token: string) => Require.jwt(token, 'linkfeideaccount'),
    linkFeideAccount: (token: string) => Require.jwt(token, 'linkfeideaccount'),
    adminLinkFeideAccount: Require.permission('USERS_ADMIN'),
}
