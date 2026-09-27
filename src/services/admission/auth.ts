import { RequirePermissionAndUser } from '@/auth/authorizer/RequirePermissionAndUser'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'

export const admissionAuth = {
    createTrial: RequirePermissionAndUser.staticFields({
        permission: 'ADMISSION_USE',
    }),
    readTrial: RequireUserIdOrPermission.staticFields({
        permission: 'ADMISSION_USE',
    }),
    userCompletedTrials: RequireUserIdOrPermission.staticFields({
        permission: 'ADMISSION_USE',
    }),
} as const
