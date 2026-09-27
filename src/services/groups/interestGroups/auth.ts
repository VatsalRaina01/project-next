import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionOrGroupAdmin } from '@/auth/authorizer/RequirePermissionOrGroupAdmin'
import { requireReadManagedGroupMembers } from '@/services/groups/auth'

export const interestGroupAuth = {
    create: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    read: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_USE' }),
    readMany: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_USE' }),
    readExpanded: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_USE' }),
    readMembers: requireReadManagedGroupMembers('INTEREST_GROUP_USE'),
    addMembers: RequirePermissionOrGroupAdmin.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    removeMembers: RequirePermissionOrGroupAdmin.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    setMemberAdmin: RequirePermissionOrGroupAdmin.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    setMemberTitle: RequirePermissionOrGroupAdmin.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    migrateGroup: RequirePermissionOrGroupAdmin.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    update: RequirePermissionOrGroupAdmin.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    pension: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    readSpecialCmsParagraphGeneralInfo: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_USE' }),
    updateSpecialCmsParagraphContentGeneralInfo: RequirePermission.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
    updateArticleSection: RequirePermissionOrGroupAdmin.staticFields({ permission: 'INTEREST_GROUP_ADMIN' }),
}
