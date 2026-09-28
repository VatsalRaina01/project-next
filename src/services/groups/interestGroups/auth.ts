import { Require } from '@/auth/authorizer/Require'
import { requireReadManagedGroupMembers } from '@/services/groups/auth'

export const interestGroupAuth = {
    create: Require.permission('INTEREST_GROUP_ADMIN'),
    read: Require.permission('INTEREST_GROUP_USE'),
    readMany: Require.permission('INTEREST_GROUP_USE'),
    readExpanded: Require.permission('INTEREST_GROUP_USE'),
    readMembers: requireReadManagedGroupMembers('INTEREST_GROUP_USE'),
    addMembers: (groupId: number) =>
        Require.anyOf(Require.permission('INTEREST_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    removeMembers: (groupId: number) =>
        Require.anyOf(Require.permission('INTEREST_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    setMemberAdmin: (groupId: number) =>
        Require.anyOf(Require.permission('INTEREST_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    setMemberTitle: (groupId: number) =>
        Require.anyOf(Require.permission('INTEREST_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    migrateGroup: (groupId: number) =>
        Require.anyOf(Require.permission('INTEREST_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    update: (groupId: number) =>
        Require.anyOf(Require.permission('INTEREST_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    destroy: Require.permission('INTEREST_GROUP_ADMIN'),
    pension: Require.permission('INTEREST_GROUP_ADMIN'),
    readSpecialCmsParagraphGeneralInfo: Require.permission('INTEREST_GROUP_USE'),
    updateSpecialCmsParagraphContentGeneralInfo: Require.permission('INTEREST_GROUP_ADMIN'),
    updateArticleSection: (groupId: number) =>
        Require.anyOf(Require.permission('INTEREST_GROUP_ADMIN'), Require.groupAdmin(groupId)),
}
