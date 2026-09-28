import { RequireLevelFromDoubleLevelVisibility } from '@/auth/authorizer/RequireLevelFromDoubleLevelVisibility'
import { RequireLevelFromDoubleLevelVisibilityDynamic } from '@/auth/authorizer/RequireLevelFromDoubleLevelVisibilityDynamic'
import { RequireVisibilityFilter } from '@/auth/authorizer/RequireVisibilityFilter'
import { Require } from '@/auth/authorizer/Require'

/**
 * The admin level of an event decides who may edit and delete it, the regular level who may
 * register for it - and, for an event not viewable by all, who may see it at all. EVENT_ADMIN
 * bypasses both levels for every event, and is also what it takes to make one in the first place.
 */
export const eventAuth = {
    create: Require.permission('EVENT_ADMIN'),

    readDoubleLevelMatrix:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'REGULAR', bypassPermission: 'EVENT_ADMIN' }),
    updateRegularLevel:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'EVENT_ADMIN' }),
    updateAdminLevel:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'EVENT_ADMIN' }),

    read: RequireLevelFromDoubleLevelVisibilityDynamic.staticFields({ bypassPermission: 'EVENT_ADMIN' }),
    readManyCurrent: RequireVisibilityFilter.staticFields({ bypassPermission: 'EVENT_ADMIN' }),
    readManyArchivedPage: RequireVisibilityFilter.staticFields({ bypassPermission: 'EVENT_ADMIN' }),
    search: RequireVisibilityFilter.staticFields({ bypassPermission: 'EVENT_ADMIN' }),

    update: RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'EVENT_ADMIN' }),
    setPublished:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'EVENT_ADMIN' }),
    updateCmsCoverImage:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'EVENT_ADMIN' }),
    updateParagraphContent:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'EVENT_ADMIN' }),
    destroy: RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'EVENT_ADMIN' }),
} as const
