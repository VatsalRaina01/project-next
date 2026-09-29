import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionAndUserId } from '@/auth/authorizer/RequirePermissionAndUserId'


export const bullshitAuth = {
    create: RequirePermissionAndUserId.staticFields({ permission: 'BULLSHIT_WRITE' }),
    readPage: RequirePermission.staticFields({ permission: 'BULLSHIT_READ' })
} as const
