import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { Require } from '@/auth/authorizer/Require'

export const newStudentAuth = {
    read: RequireNothing.staticFields({}),
    update: Require.permission('NEW_STUDENT_ADMIN')
} as const
