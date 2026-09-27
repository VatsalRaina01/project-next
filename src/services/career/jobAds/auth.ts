import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const jobAdAuth = {
    create: RequirePermission.staticFields({ permission: 'JOBAD_ADMIN' }),
    read: RequirePermission.staticFields({ permission: 'JOBAD_USE' }),
    readActive: RequirePermission.staticFields({ permission: 'JOBAD_USE' }),
    readInactivePage: RequirePermission.staticFields({ permission: 'JOBAD_USE' }),
    update: RequirePermission.staticFields({ permission: 'JOBAD_ADMIN' }),
    updateArticle: RequirePermission.staticFields({ permission: 'JOBAD_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'JOBAD_ADMIN' }),
}
