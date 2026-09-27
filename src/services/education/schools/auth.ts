import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const schoolAuth = {
    create: RequirePermission.staticFields({ permission: 'SCHOOLS_ADMIN' }),
    createStandard: RequirePermission.staticFields({ permission: 'SCHOOLS_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'SCHOOLS_ADMIN' }),
    read: RequirePermission.staticFields({ permission: 'SCHOOLS_USE' }),
    readExpandedPage: RequirePermission.staticFields({ permission: 'SCHOOLS_USE' }),
    readStandard: RequirePermission.staticFields({ permission: 'SCHOOLS_USE' }),
    readMany: RequirePermission.staticFields({ permission: 'SCHOOLS_USE' }),
    update: RequirePermission.staticFields({ permission: 'SCHOOLS_ADMIN' }),
    updateCmsParagraphContent: RequirePermission.staticFields({ permission: 'SCHOOLS_ADMIN' }),
    updateCmsImage: RequirePermission.staticFields({ permission: 'SCHOOLS_ADMIN' }),
    updateCmsLink: RequirePermission.staticFields({ permission: 'SCHOOLS_ADMIN' }),
} as const
