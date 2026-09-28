import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { Require } from '@/auth/authorizer/Require'

export const eventTagAuth = {
    create: Require.permission('EVENT_ADMIN'),
    readSpecial: RequireNothing.staticFields({}),
    read: RequireNothing.staticFields({}),
    readAll: RequireNothing.staticFields({}),
    update: Require.permission('EVENT_ADMIN'),
    destroy: Require.permission('EVENT_ADMIN'),
}
