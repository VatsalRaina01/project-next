import { Require } from '@/auth/authorizer/Require'

export const committeeParticipationAuth = {
    read: (groupId: number) => Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.groupAdmin(groupId)),
    readAll: (groupId: number) => Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.groupAdmin(groupId)),
}
