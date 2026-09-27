import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { requireReadGroupMembers } from '@/services/groups/auth'

export const omegaMembershipGroupAuth = {
    read: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_USE' }),
    readMany: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_USE' }),
    readExpanded: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_USE' }),
    readMembers: requireReadGroupMembers('OMEGA_MEMBERSHIP_GROUP_USE'),
    readUserLevel: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_USE' }),
    inferUserLevel: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_USE' }),
    updateUserLevel: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_ADMIN' }),
    updateUserOrder: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_ADMIN' }),
    migrateGroups: RequirePermission.staticFields({ permission: 'OMEGA_MEMBERSHIP_GROUP_ADMIN' }),
} as const
