import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionOrGroupAdmin } from '@/auth/authorizer/RequirePermissionOrGroupAdmin'
import { requireReadManagedGroupMembers } from '@/services/groups/auth'

export const studyProgrammeAuth = {
    create: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    upsertMany: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    readFeideReturnedForUser: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    recordFeideReturnedForUser: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    read: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_USE' }),
    readMany: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_USE' }),
    readExpanded: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_USE' }),
    readMembers: requireReadManagedGroupMembers('STUDY_PROGRAMME_USE'),
    update: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    addMembers: RequirePermissionOrGroupAdmin.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    removeMembers: RequirePermissionOrGroupAdmin.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    setMemberAdmin: RequirePermissionOrGroupAdmin.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    setMemberTitle: RequirePermissionOrGroupAdmin.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
    migrateGroups: RequirePermission.staticFields({ permission: 'STUDY_PROGRAMME_ADMIN' }),
} as const
