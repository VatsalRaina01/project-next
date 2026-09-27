import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'

export const notificationSubscriptionAuth = {
    read: RequireUserIdOrPermission.staticFields({ permission: 'NOTIFICATION_ADMIN' }),
    update: RequireUserIdOrPermission.staticFields({ permission: 'NOTIFICATION_ADMIN' }),
}
