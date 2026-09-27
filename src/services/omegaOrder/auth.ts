import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const omegaOrderAuth = {
    create: RequirePermission.staticFields({ permission: 'OMEGA_ORDER_ADMIN' }),
    readCurrent: RequirePermission.staticFields({ permission: 'OMEGA_ORDER_USE' }),
    readRequirements: RequirePermission.staticFields({ permission: 'OMEGA_ORDER_USE' }),
    readAll: RequirePermission.staticFields({ permission: 'OMEGA_ORDER_USE' })
} as const
