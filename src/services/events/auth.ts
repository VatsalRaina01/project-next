import { Require } from '@/auth/authorizer/Require'
import type { DoubleLevelVisibilityMatrix } from '@/services/visibility/types'

/**
 * The admin level of an event decides who may edit and delete it, the regular level who may
 * register for it - and, for an event not viewable by all, who may see it at all. EVENT_ADMIN
 * bypasses both levels for every event, and is also what it takes to make one in the first place.
 */
const regularLevel = (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
    Require.anyOf(Require.permission('EVENT_ADMIN'), Require.visibility(doubleLevelMatrix.regularLevel))
const adminLevel = (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
    Require.anyOf(Require.permission('EVENT_ADMIN'), Require.visibility(doubleLevelMatrix.adminLevel))

export const eventAuth = {
    create: Require.permission('EVENT_ADMIN'),

    readDoubleLevelMatrix: regularLevel,
    updateRegularLevel: adminLevel,
    updateAdminLevel: adminLevel,

    // The level 'PUBLIC' is for an event marked as viewable by all: then neither level is checked.
    read: ({ level, doubleLevelMatrix }: {
        level: 'PUBLIC' | 'REGULAR' | 'ADMIN',
        doubleLevelMatrix: DoubleLevelVisibilityMatrix,
    }) => (
        level === 'PUBLIC'
            ? Require.nothing()
            : level === 'REGULAR' ? regularLevel(doubleLevelMatrix) : adminLevel(doubleLevelMatrix)
    ),
    readManyCurrent: Require.visibilityFilter({ bypassPermission: 'EVENT_ADMIN' }),
    readManyArchivedPage: Require.visibilityFilter({ bypassPermission: 'EVENT_ADMIN' }),
    search: Require.visibilityFilter({ bypassPermission: 'EVENT_ADMIN' }),

    update: adminLevel,
    setPublished: adminLevel,
    updateCmsCoverImage: adminLevel,
    updateParagraphContent: adminLevel,
    destroy: adminLevel,
} as const
