import { Require } from '@/auth/authorizer/Require'

export const dotAuth = {
    create: Require.userId().permission('DOTS_ADMIN'),
    update: Require.permission('DOTS_ADMIN'),
    destroy: Require.permission('DOTS_ADMIN'),
    readForUser: Require.anyOf(Require.permission('DOTS_ADMIN'), Require.userId()),
}
