import '@pn-server-only'
import { EmailChangedTemplate } from '@/lib/email/templates/emailChanged'
import { sendSystemMail } from '@/lib/email/send'
import logger from '@/lib/logger'
import type { UserFiltered } from '@/services/users/types'

/**
 * Tells the old address that the email of a user was changed. A failure is only logged: the change
 * itself has already happened.
 */
export async function sendEmailChangedMail(user: UserFiltered, oldEmail: string) {
    if (oldEmail === user.email) return

    try {
        await sendSystemMail(oldEmail, 'E-posten din er endret', <EmailChangedTemplate user={user} newEmail={user.email} />)
    } catch (error) {
        logger.error(`Failed to tell the old email of user '${user.username}' about the change`, { error })
    }
}
