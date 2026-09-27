import { RequirePermissionAndDynamicPermission } from '@/auth/authorizer/RequirePermissionAndDynamicPermission'


export const purchaseAuth = {
    createByStudentCard: RequirePermissionAndDynamicPermission.staticFields({
        permission: 'PURCHASE_ADMIN',
        dynamicPermission: 'PURCHASE_USE',
        errorMessage: 'Brukeren har ikke lov til å handle i butikker.'
    })
}
