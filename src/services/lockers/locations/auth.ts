import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { Require } from '@/auth/authorizer/Require'

export const lockerLocationAuth = {
    create: Require.permission('LOCKER_ADMIN'),
    readAll: RequireNothing.staticFields({}),
}
