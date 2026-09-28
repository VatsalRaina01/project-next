import { RequireLevelFromDoubleLevelVisibility } from '@/auth/authorizer/RequireLevelFromDoubleLevelVisibility'
import { RequireLevelFromDoubleLevelVisibilityDynamic } from '@/auth/authorizer/RequireLevelFromDoubleLevelVisibilityDynamic'
import { RequireVisibilityFilter } from '@/auth/authorizer/RequireVisibilityFilter'
import { Require } from '@/auth/authorizer/Require'

export const newsAuth = {
    create: Require.permission('NEWS_USE'),

    readDoubleLevelMatrix:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'REGULAR', bypassPermission: 'NEWS_ADMIN' }),
    updateRegularLevel:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'NEWS_ADMIN' }),
    updateAdminLevel:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'NEWS_ADMIN' }),

    destroy: RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'NEWS_ADMIN' }),
    update: RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'NEWS_ADMIN' }),
    updateArticle: RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'NEWS_ADMIN' }),
    setPublished:
        RequireLevelFromDoubleLevelVisibility.staticFields({ level: 'ADMIN', bypassPermission: 'NEWS_ADMIN' }),

    read: RequireLevelFromDoubleLevelVisibilityDynamic.staticFields({ bypassPermission: 'NEWS_ADMIN' }),
    readCurrent: RequireVisibilityFilter.staticFields({ bypassPermission: 'NEWS_ADMIN' }),
    readOldPage: RequireVisibilityFilter.staticFields({ bypassPermission: 'NEWS_ADMIN' }),
} as const
