import { AuthorizerFactory } from './Authorizer'
import type { Permission } from '@/prisma-generated-pn-types'

/**
 * Every one of the permissions, or an active admin membership of the group in question.
 *
 * The group admin arm is what `RequirePermissionOrGroupAdmin` offers for the mutations; this is the
 * same idea for an operation that takes more than one permission, so that administering a group and
 * reading who is in it do not come apart.
 */
export const RequireEveryPermissionOrGroupAdmin = AuthorizerFactory<
    { permissions: Permission[] },
    { groupId: number },
    'USER_NOT_REQUIERED_FOR_AUTHORIZED'
>(({ session, staticFields, dynamicFields }) => ({
    success: staticFields.permissions.every(
        permission => session.permissions.includes(permission)
    ) || session.memberships.some(
        membership => membership.groupId === dynamicFields.groupId && membership.admin && membership.active
    ),
    session,
    errorMessage: `
        Du trenger tillatelsene ${staticFields.permissions.join(', ')} for å få tilgang eller
        være gruppeleder for gruppe ${dynamicFields.groupId}
    `
}))
