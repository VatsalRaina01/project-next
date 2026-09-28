import { RequireNothing } from '@/auth/authorizer/RequireNothing'

export const standardImagesImagePanelAuth = RequireNothing.staticFields({}).dynamicFields({})

export const standardImageCollectionAuth = {
    readStandardImage: RequireNothing.staticFields({}).dynamicFields({}),
} as const
