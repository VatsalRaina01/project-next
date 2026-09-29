import { RequirePermissionAndUser } from '@/auth/authorizer/RequirePermissionAndUser'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'

export const admissionAuth = {
    createTrial: RequirePermissionAndUser.staticFields({
        permission: 'ADMISSION_TRIAL_ADMIN',
    }),
    readTrial: RequireUserIdOrPermission.staticFields({
        permission: 'ADMISSION_TRIAL_ADMIN',
    }),
    userCompletedTrials: RequireUserIdOrPermission.staticFields({
        permission: 'ADMISSION_TRIAL_ADMIN',
    }),
} as const
