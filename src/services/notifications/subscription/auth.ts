import { Require } from '@/auth/authorizer/Require'

const userIdOrNotificationAdmin = Require.anyOf(Require.permission('NOTIFICATION_ADMIN'), Require.userId())

export const notificationSubscriptionAuth = {
    read: userIdOrNotificationAdmin,
    update: userIdOrNotificationAdmin,
}
