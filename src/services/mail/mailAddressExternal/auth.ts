import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const mailAddressExternalAuth = {
    create: RequirePermission.staticFields({ permission: 'MAILADDRESS_EXTERNAL_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'MAILADDRESS_EXTERNAL_ADMIN' }),
    readMany: RequirePermission.staticFields({ permission: 'MAILADDRESS_EXTERNAL_USE' }),
    read: RequirePermission.staticFields({ permission: 'MAILADDRESS_EXTERNAL_USE' }),
    update: RequirePermission.staticFields({ permission: 'MAILADDRESS_EXTERNAL_ADMIN' }),
} as const
