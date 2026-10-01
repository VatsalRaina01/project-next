import { AuthorizerFactory } from './Authorizer'
import { checkVisibility } from '@/auth/visibility/checkVisibility'
import type { DoubleLevelVisibilityMatrix } from '@/services/visibility/types'
import type { Permission } from '@/prisma-generated-pn-types'

/**
 * Like RequireLevelFromDoubleLevelVisibility, but the level to check is picked at call time
 * (dynamicFields) rather than fixed at definition time (staticFields) - for resources where which
 * level applies depends on the resource's own data, e.g. a news article that requires only the
 * regular level once published, but the admin level while still a draft.
 *
 * The level 'PUBLIC' is for resources that can additionally declare themselves open to everyone,
 * e.g. an event marked as viewable by all: then neither level is checked.
 */
export const RequireLevelFromDoubleLevelVisibilityDynamic = AuthorizerFactory<
    { bypassPermission: Permission | null },
    { level: 'PUBLIC' | 'REGULAR' | 'ADMIN', doubleLevelMatrix: DoubleLevelVisibilityMatrix },
    'USER_NOT_REQUIERED_FOR_AUTHORIZED'
> (({ session, dynamicFields, staticFields }) => ({
    success: dynamicFields.level === 'PUBLIC' || checkVisibility(
        session.memberships,
        dynamicFields.level === 'REGULAR' ?
            dynamicFields.doubleLevelMatrix.regularLevel : dynamicFields.doubleLevelMatrix.adminLevel
    ) || (staticFields.bypassPermission ? session.permissions.includes(staticFields.bypassPermission) : false),
    session,
}))
