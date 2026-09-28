import { Require } from '@/auth/authorizer/Require'
import type { DoubleLevelVisibilityMatrix } from '@/services/visibility/types'

const regularLevelOrImageAdmin = (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
    Require.anyOf(Require.permission('IMAGE_ADMIN'), Require.visibility(doubleLevelMatrix.regularLevel))
const adminLevelOrImageAdmin = (doubleLevelMatrix: DoubleLevelVisibilityMatrix) =>
    Require.anyOf(Require.permission('IMAGE_ADMIN'), Require.visibility(doubleLevelMatrix.adminLevel))

export const dynamicImageAuth = {
    readDoubleLevelMatrix: regularLevelOrImageAdmin,
    updateRegularLevel: adminLevelOrImageAdmin,
    updateAdminLevel: adminLevelOrImageAdmin,

    readCollection: regularLevelOrImageAdmin,
    readCollectionPage: () => Require.visibilityFilter({ bypassPermission: 'IMAGE_ADMIN' }),

    createCollection: Require.permission('IMAGE_USE'),
    destroyCollection: adminLevelOrImageAdmin,
    updateCollection: adminLevelOrImageAdmin,

    uploadImage: adminLevelOrImageAdmin,
    uploadManyImages: adminLevelOrImageAdmin,
    readPageOfImagesInCollection: regularLevelOrImageAdmin,
    updateImageMeta: adminLevelOrImageAdmin,
    destroyImage: adminLevelOrImageAdmin,
} as const
