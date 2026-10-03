import { RequirePermissionAndDynamicPermission } from '@/auth/authorizer/RequirePermissionAndDynamicPermission'
import { RequirePermissionAndUserId } from '@/auth/authorizer/RequirePermissionAndUserId'


export const purchaseAuth = {
    create: RequirePermissionAndUserId.staticFields({
        permission: 'PURCHASE_CREATE',
    }),
    createByStudentCard: RequirePermissionAndDynamicPermission.staticFields({
        permission: 'PURCHASE_CREATE_ONBEHALF',
        dynamicPermission: 'PURCHASE_CREATE',
        errorMessage: 'Brukeren har ikke lov til å handle i butikker.'
    })
}
