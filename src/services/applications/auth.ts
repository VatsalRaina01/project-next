import { Require } from '@/auth/authorizer/Require'

const userIdOrApplicationAdmin = Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.userId())

export const applicationAuth = {
    readForUser: userIdOrApplicationAdmin,
    create: userIdOrApplicationAdmin,
    update: userIdOrApplicationAdmin,
    destroy: userIdOrApplicationAdmin,
}
