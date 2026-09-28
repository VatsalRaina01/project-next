import { Require } from '@/auth/authorizer/Require'
import { requireReadManagedGroupMembers } from '@/services/groups/auth'

export const manualGroupAuth = {
    create: Require.permission('MANUAL_GROUP_ADMIN'),
    read: Require.permission('MANUAL_GROUP_USE'),
    readMany: Require.permission('MANUAL_GROUP_USE'),
    readExpanded: Require.permission('MANUAL_GROUP_USE'),
    readMembers: requireReadManagedGroupMembers('MANUAL_GROUP_USE'),
    update: Require.permission('MANUAL_GROUP_ADMIN'),
    destroy: Require.permission('MANUAL_GROUP_ADMIN'),
    pension: Require.permission('MANUAL_GROUP_ADMIN'),
    addMembers: (groupId: number) => Require.anyOf(Require.permission('MANUAL_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    removeMembers: (groupId: number) =>
        Require.anyOf(Require.permission('MANUAL_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    setMemberAdmin: (groupId: number) =>
        Require.anyOf(Require.permission('MANUAL_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    setMemberTitle: (groupId: number) =>
        Require.anyOf(Require.permission('MANUAL_GROUP_ADMIN'), Require.groupAdmin(groupId)),
    migrateGroup: (groupId: number) =>
        Require.anyOf(Require.permission('MANUAL_GROUP_ADMIN'), Require.groupAdmin(groupId)),
} as const
