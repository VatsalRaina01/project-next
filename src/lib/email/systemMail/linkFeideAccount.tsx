import '@pn-server-only'
import { sendSystemMail } from '@/lib/email/send'
import { LinkFeideAccountTemplate } from '@/lib/email/templates/linkFeideAccount'
import { generateJWT } from '@/jwt/jwt'
import type { UserFiltered } from '@/services/users/types'

/**
 * Sends a mail to a migrated, unclaimed user with a link that confirms moving a
 * fresh Feide login onto them. The link carries a JWT naming both users, so the
 * confirming operation cannot be pointed at anything the sender did not intend.
 *
 * @param targetUser - The migrated user the Feide login should be moved to.
 * @param feideUserId - The freshly created user currently holding the Feide account.
 */
export async function sendLinkFeideAccountMail(targetUser: UserFiltered, feideUserId: number) {
    const jwt = generateJWT('linkfeideaccount', {
        sub: targetUser.id,
        feideUserId,
    }, 60 * 60)

    const link = `${process.env.WEBSITE_URL}/link-ow-user?token=${jwt}`

    await sendSystemMail(
        targetUser.email,
        'Koble Feide-innlogging til gammel bruker',
        <LinkFeideAccountTemplate user={targetUser} link={link} />
    )
}
