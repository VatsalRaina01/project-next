import { RequireEveryPermission } from '@/auth/authorizer/RequireEveryPermission'
import type { Permission } from '@/prisma-generated-pn-types'

/**
 * The authorizer every group type's `readMembers` uses. Reading a group's members hands out the
 * users behind the memberships, so it takes permission to read users on top of permission to read
 * the group type itself - a group type's own read permission is not enough on its own.
 *
 * `CLASS_READ` and `MANUAL_GROUP_READ` are default permissions (`seedPermissions.ts`), and
 * `ServerSession.fromNextAuth` falls back to the default permissions when there is no session, so a
 * `readMembers` gated on one of those alone is callable by a visitor who is not logged in at all.
 *
 * `USERS_READ` is a membership permission, so for the group types whose own read permission is a
 * membership permission too this adds nothing - which is the point. The rule holds for every type
 * rather than being a patch on the two that need it, so a group type that is made readable by
 * default later cannot start handing out member data by doing so.
 */
export function requireReadGroupMembers(groupTypeReadPermission: Permission) {
    return RequireEveryPermission.staticFields({
        permissions: [groupTypeReadPermission, 'USERS_READ'],
    })
}
