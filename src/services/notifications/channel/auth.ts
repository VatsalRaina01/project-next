import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import '@pn-server-only'
import { Require } from '@/auth/authorizer/Require'

export const notificationChannelAuth = {
    create: Require.permission('NOTIFICATION_ADMIN'),
    readMany: RequireNothing.staticFields({}),
    readDefault: RequireNothing.staticFields({}),
    update: Require.permission('NOTIFICATION_ADMIN'),
    destroy: Require.permission('NOTIFICATION_ADMIN'),
}
