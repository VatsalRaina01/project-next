import '@pn-server-only'
import { emailValidationExpiration } from './constants'
import { VerifyEmailTemplate } from '@/lib/email/templates/verifyEmail'
import { sendSystemMail } from '@/lib/email/send'
import { generateJWT } from '@/jwt/jwt'
import { userSchemas } from '@/services/users/schemas'
import type { UserBasic } from '@/services/users/types'

// TODO: Fix this with new validation
export async function sendVerifyEmail(user: UserBasic, email: string) {
    const parse = userSchemas.verifyEmail.parse({ email })

    const jwt = generateJWT('verifyemail', {
        email: parse.email,
        sub: user.id,
    }, emailValidationExpiration)

    const link = `${process.env.WEBSITE_URL}/verify-email?token=${jwt}`

    await sendSystemMail(parse.email, 'Bekreft e-post', <VerifyEmailTemplate user={user} link={link} />)
}
