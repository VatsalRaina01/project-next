import { Require } from '@/auth/authorizer/Require'

export const dotAuth = {
    create: (userId: number) => Require.userId(userId).permission('DOTS_ADMIN'),
    update: Require.permission('DOTS_ADMIN'),
    destroy: Require.permission('DOTS_ADMIN'),
    readForUser: (userId: number) => Require.anyOf(Require.permission('DOTS_ADMIN'), Require.userId(userId)),
}
