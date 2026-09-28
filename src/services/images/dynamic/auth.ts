import { Require } from '@/auth/authorizer/Require'

// The caller picks which half of a double-level matrix to supply as `visibility` in `.data()` -
// regularLevel for the "regular" keys below, adminLevel for the "admin" ones.
const visibilityOrImageAdmin = Require.anyOf(Require.permission('IMAGE_ADMIN'), Require.visibility())

export const dynamicImageAuth = {
    readDoubleLevelMatrix: visibilityOrImageAdmin,
    updateRegularLevel: visibilityOrImageAdmin,
    updateAdminLevel: visibilityOrImageAdmin,

    readCollection: visibilityOrImageAdmin,
    readCollectionPage: Require.visibilityFilter({ bypassPermission: 'IMAGE_ADMIN' }),

    createCollection: Require.permission('IMAGE_USE'),
    destroyCollection: visibilityOrImageAdmin,
    updateCollection: visibilityOrImageAdmin,

    uploadImage: visibilityOrImageAdmin,
    uploadManyImages: visibilityOrImageAdmin,
    readPageOfImagesInCollection: visibilityOrImageAdmin,
    updateImageMeta: visibilityOrImageAdmin,
    destroyImage: visibilityOrImageAdmin,
} as const
