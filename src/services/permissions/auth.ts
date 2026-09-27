import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { RequirePermission } from '@/auth/authorizer/RequirePermission'


export const permissionsAuth = {
    readGroupPermissions: RequirePermission.staticFields({ permission: 'PERMISSION_USE' }),
    readPermissionMatrix: RequirePermission.staticFields({ permission: 'PERMISSION_USE' }),
    updateGroupPermission: RequirePermission.staticFields({ permission: 'PERMISSION_ADMIN' }),

    readDefaultPermissions: RequireNothing.staticFields({}),
    updateDefaultPermissions: RequirePermission.staticFields({ permission: 'PERMISSION_ADMIN' }),
}
