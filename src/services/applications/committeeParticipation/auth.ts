import { Require } from '@/auth/authorizer/Require'

const groupAdminOrApplicationAdmin = Require.anyOf(Require.permission('APPLICATION_ADMIN'), Require.groupAdmin())

export const committeeParticipationAuth = {
    read: groupAdminOrApplicationAdmin,
    readAll: groupAdminOrApplicationAdmin,
}
