import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { Require } from '@/auth/authorizer/Require'

export const cabinArticleAuth = {
    read: RequireNothing.staticFields({}),
    update: Require.permission('CABIN_ADMIN')
} as const
