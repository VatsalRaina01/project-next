import { RequireJWT } from '@/auth/authorizer/RequireJWT'
import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequireUser } from '@/auth/authorizer/RequireUser'

export const authAuth = {
    verifyEmail: RequireJWT.staticFields({ audience: 'verifyemail' }),
    resetPassword: RequireJWT.staticFields({ audience: 'resetpassword' }),
    sendResetPasswordEmail: RequireNothing.staticFields({}),
    sendLinkFeideAccountEmail: RequireUser.staticFields({}),
    linkFeideAccount: RequireJWT.staticFields({ audience: 'linkfeideaccount' }),
    adminLinkFeideAccount: RequirePermission.staticFields({ permission: 'USERS_UPDATE' }),
}
