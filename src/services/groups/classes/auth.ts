import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { requireReadGroupMembers } from '@/services/groups/auth'

export const classAuth = {
    read: RequirePermission.staticFields({ permission: 'CLASS_USE' }),
    readMany: RequirePermission.staticFields({ permission: 'CLASS_USE' }),
    readExpanded: RequirePermission.staticFields({ permission: 'CLASS_USE' }),
    readMembers: requireReadGroupMembers('CLASS_USE'),
    readClassOfUser: RequirePermission.staticFields({ permission: 'CLASS_USE' }),
    changeClassOfUser: RequirePermission.staticFields({ permission: 'CLASS_ADMIN' }),
    bumpClasses: RequirePermission.staticFields({ permission: 'CLASS_ADMIN' }),
    migrateGroups: RequirePermission.staticFields({ permission: 'CLASS_ADMIN' }),
} as const
