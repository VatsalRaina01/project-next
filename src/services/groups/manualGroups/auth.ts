import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionOrGroupAdmin } from '@/auth/authorizer/RequirePermissionOrGroupAdmin'
import { requireReadManagedGroupMembers } from '@/services/groups/auth'

export const manualGroupAuth = {
    create: RequirePermission.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    read: RequirePermission.staticFields({ permission: 'MANUAL_GROUP_USE' }),
    readMany: RequirePermission.staticFields({ permission: 'MANUAL_GROUP_USE' }),
    readExpanded: RequirePermission.staticFields({ permission: 'MANUAL_GROUP_USE' }),
    readMembers: requireReadManagedGroupMembers('MANUAL_GROUP_USE'),
    update: RequirePermission.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    pension: RequirePermission.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    addMembers: RequirePermissionOrGroupAdmin.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    removeMembers: RequirePermissionOrGroupAdmin.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    setMemberAdmin: RequirePermissionOrGroupAdmin.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    setMemberTitle: RequirePermissionOrGroupAdmin.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
    migrateGroup: RequirePermissionOrGroupAdmin.staticFields({ permission: 'MANUAL_GROUP_ADMIN' }),
} as const
