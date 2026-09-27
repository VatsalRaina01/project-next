import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const notificationAuth = {
    create: RequirePermission.staticFields({ permission: 'NOTIFICATION_ADMIN' }),
    sendMail: RequirePermission.staticFields({ permission: 'MAIL_USE' }),
} as const
