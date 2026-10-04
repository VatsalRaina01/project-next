import { Require } from '@/auth/authorizer/Require'
import type { Permission } from '@/prisma-generated-pn-types'

export const purchaseAuth = {
    createByStudentCard: (permissionsOfUser: Permission[]) => Require.permission('PURCHASE_ADMIN').custom(
        () => permissionsOfUser.includes('PURCHASE_USE'),
        { errorMessage: 'Brukeren har ikke lov til å handle i butikker.' }
    )
}
