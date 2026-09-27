import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import '@pn-server-only'

export const notificationChannelAuth = {
    create: RequirePermission.staticFields({ permission: 'NOTIFICATION_ADMIN' }),
    readMany: RequireNothing.staticFields({}),
    readDefault: RequireNothing.staticFields({}),
    update: RequirePermission.staticFields({ permission: 'NOTIFICATION_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'NOTIFICATION_ADMIN' }),
}
