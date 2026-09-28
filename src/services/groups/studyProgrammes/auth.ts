import { Require } from '@/auth/authorizer/Require'
import { requireReadManagedGroupMembers } from '@/services/groups/auth'

export const studyProgrammeAuth = {
    create: Require.permission('STUDY_PROGRAMME_ADMIN'),
    upsertMany: Require.permission('STUDY_PROGRAMME_ADMIN'),
    readFeideReturnedForUser: Require.permission('STUDY_PROGRAMME_ADMIN'),
    recordFeideReturnedForUser: Require.permission('STUDY_PROGRAMME_ADMIN'),
    read: Require.permission('STUDY_PROGRAMME_USE'),
    readMany: Require.permission('STUDY_PROGRAMME_USE'),
    readExpanded: Require.permission('STUDY_PROGRAMME_USE'),
    readMembers: requireReadManagedGroupMembers('STUDY_PROGRAMME_USE'),
    update: Require.permission('STUDY_PROGRAMME_ADMIN'),
    addMembers: (groupId: number) =>
        Require.anyOf(Require.permission('STUDY_PROGRAMME_ADMIN'), Require.groupAdmin(groupId)),
    removeMembers: (groupId: number) =>
        Require.anyOf(Require.permission('STUDY_PROGRAMME_ADMIN'), Require.groupAdmin(groupId)),
    setMemberAdmin: (groupId: number) =>
        Require.anyOf(Require.permission('STUDY_PROGRAMME_ADMIN'), Require.groupAdmin(groupId)),
    setMemberTitle: (groupId: number) =>
        Require.anyOf(Require.permission('STUDY_PROGRAMME_ADMIN'), Require.groupAdmin(groupId)),
    destroy: Require.permission('STUDY_PROGRAMME_ADMIN'),
    migrateGroups: Require.permission('STUDY_PROGRAMME_ADMIN'),
} as const
