import { Require } from '@/auth/authorizer/Require'
import { requireReadManagedGroupMembers } from '@/services/groups/auth'

export const committeeLogosImagePanelAuth = Require.permission('COMMITTEE_ADMIN')

export const committeeAuth = {
    create: Require.permission('COMMITTEE_ADMIN'),
    update: Require.permission('COMMITTEE_ADMIN'),
    readAll: Require.permission('COMMITTEE_USE'),
    read: Require.permission('COMMITTEE_USE'),
    readMembers: requireReadManagedGroupMembers('COMMITTEE_USE'),
    readExpanded: Require.permission('COMMITTEE_USE'),
    addMembers: (groupId: number) => Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
    removeMembers: (groupId: number) =>
        Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
    setMemberAdmin: (groupId: number) =>
        Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
    setMemberTitle: (groupId: number) =>
        Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
    migrateGroup: (groupId: number) =>
        Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
    readArticle: Require.permission('COMMITTEE_USE'),
    readParagraph: Require.permission('COMMITTEE_USE'),
    destroy: Require.permission('COMMITTEE_ADMIN'),
    pension: Require.permission('COMMITTEE_ADMIN'),
    updateParagraphContent: (groupId: number) =>
        Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
    updateLogo: (groupId: number) =>
        Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
    updateArticle: (groupId: number) =>
        Require.anyOf(Require.permission('COMMITTEE_ADMIN'), Require.groupAdmin(groupId)),
} as const
