import { Require } from '@/auth/authorizer/Require'
import type { DoubleLevelVisibilityMatrix, VisibilityMatrix } from '@/services/visibility/types'

const visibilityOrNewsAdmin = (visibility: VisibilityMatrix) =>
    Require.anyOf(Require.permission('NEWS_ADMIN'), Require.visibility(visibility))
const adminLevelOrNewsAdmin = (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
    visibilityOrNewsAdmin(doubleLevelMatrix.adminLevel)

export const newsAuth = {
    create: Require.permission('NEWS_USE'),

    readDoubleLevelMatrix: (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
        visibilityOrNewsAdmin(doubleLevelMatrix.regularLevel),
    updateRegularLevel: adminLevelOrNewsAdmin,
    updateAdminLevel: adminLevelOrNewsAdmin,

    destroy: adminLevelOrNewsAdmin,
    update: adminLevelOrNewsAdmin,
    updateArticle: adminLevelOrNewsAdmin,
    setPublished: adminLevelOrNewsAdmin,

    // The level to check is picked at call time (published vs. draft), not fixed per-key like the
    // others above - the caller passes whichever of the matrix's two halves currently applies.
    read: visibilityOrNewsAdmin,
    readCurrent: () => Require.visibilityFilter({ bypassPermission: 'NEWS_ADMIN' }),
    readOldPage: () => Require.visibilityFilter({ bypassPermission: 'NEWS_ADMIN' }),
} as const
