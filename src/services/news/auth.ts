import { Require } from '@/auth/authorizer/Require'

// The caller picks which half of a double-level matrix (or, for `read`, whichever level currently
// applies) to supply as `visibility` in `.data()`.
const visibilityOrNewsAdmin = Require.anyOf(Require.permission('NEWS_ADMIN'), Require.visibility())

export const newsAuth = {
    create: Require.permission('NEWS_USE'),

    readDoubleLevelMatrix: visibilityOrNewsAdmin,
    updateRegularLevel: visibilityOrNewsAdmin,
    updateAdminLevel: visibilityOrNewsAdmin,

    destroy: visibilityOrNewsAdmin,
    update: visibilityOrNewsAdmin,
    updateArticle: visibilityOrNewsAdmin,
    setPublished: visibilityOrNewsAdmin,

    read: visibilityOrNewsAdmin,
    readCurrent: Require.visibilityFilter({ bypassPermission: 'NEWS_ADMIN' }),
    readOldPage: Require.visibilityFilter({ bypassPermission: 'NEWS_ADMIN' }),
} as const
