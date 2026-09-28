import { Require } from '@/auth/authorizer/Require'

export const notificationSubscriptionAuth = {
    read: (userId: number) => Require.anyOf(Require.permission('NOTIFICATION_ADMIN'), Require.userId(userId)),
    update: (userId: number) => Require.anyOf(Require.permission('NOTIFICATION_ADMIN'), Require.userId(userId)),
}
