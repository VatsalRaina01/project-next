import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const cabinProductAuth = {
    create: RequirePermission.staticFields({ permission: 'CABIN_ADMIN' }),
    createPrice: RequirePermission.staticFields({ permission: 'CABIN_ADMIN' }),
    read: RequirePermission.staticFields({ permission: 'CABIN_USE' }),
    readActive: RequirePermission.staticFields({ permission: 'CABIN_USE' }),
    readMany: RequirePermission.staticFields({ permission: 'CABIN_USE' }),
} as const
