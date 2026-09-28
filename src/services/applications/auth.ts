import { Require } from '@/auth/authorizer/Require'

export const applicationAuth = {
    readForUser: (userId: number) => Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.userId(userId)),
    create: (userId: number) => Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.userId(userId)),
    update: (userId: number) => Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.userId(userId)),
    destroy: (userId: number) => Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.userId(userId)),
}
