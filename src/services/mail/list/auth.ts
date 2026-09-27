import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const mailingListAuth = {
    create: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    readMany: RequirePermission.staticFields({ permission: 'MAILINGLIST_USE' }),
    read: RequirePermission.staticFields({ permission: 'MAILINGLIST_USE' }),
    update: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'MAILINGLIST_ADMIN' }),
} as const
