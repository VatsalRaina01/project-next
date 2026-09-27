import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const shopAuth = {
    read: RequirePermission.staticFields({ permission: 'SHOP_USE' }),
    create: RequirePermission.staticFields({ permission: 'SHOP_ADMIN' }),
}
