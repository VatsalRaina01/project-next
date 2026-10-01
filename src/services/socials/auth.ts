import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'
import type { AuthorizerDynamicFieldsBound } from '@/auth/authorizer/Authorizer'
import type { SocialOwner } from '@/services/socials/types'

/**
 * Socials are the same thing wherever they live, so every operation has one authorizer per kind of
 * owner rather than one per operation: your own socials are yours to edit (or an administrator's,
 * with USERS_UPDATE), while the site-wide ones on the frontpage belong to whoever runs the
 * frontpage.
 */
type SocialOwnerAuthorizers = {
    user: { dynamicFields: (fields: { userId: number }) => AuthorizerDynamicFieldsBound },
    special: { dynamicFields: (fields: Record<string, never>) => AuthorizerDynamicFieldsBound },
}

export const socialAuth = {
    readSocials: {
        user: RequireUserIdOrPermission.staticFields({ permission: 'USERS_READ' }),
        special: RequireNothing.staticFields({}),
    },
    upsertSocial: {
        user: RequireUserIdOrPermission.staticFields({ permission: 'USERS_UPDATE' }),
        special: RequirePermission.staticFields({ permission: 'FRONTPAGE_ADMIN' }),
    },
    destroySocial: {
        user: RequireUserIdOrPermission.staticFields({ permission: 'USERS_UPDATE' }),
        special: RequirePermission.staticFields({ permission: 'FRONTPAGE_ADMIN' }),
    },
} as const satisfies Record<string, SocialOwnerAuthorizers>

/**
 * Picks the authorizer that applies to the owner a call is about. Frontend code that needs to know
 * whether it may show an editor calls this with the same owner it would pass to the action.
 */
export function authorizeSocialOwner(
    authorizers: SocialOwnerAuthorizers,
    owner: SocialOwner,
): AuthorizerDynamicFieldsBound {
    return owner.type === 'USER'
        ? authorizers.user.dynamicFields({ userId: owner.userId })
        : authorizers.special.dynamicFields({})
}
