import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const cabinSettingsAuth = {
    read: RequirePermission.staticFields({ permission: 'CABIN_ADMIN' }),
    update: RequirePermission.staticFields({ permission: 'CABIN_ADMIN' }),
} as const
