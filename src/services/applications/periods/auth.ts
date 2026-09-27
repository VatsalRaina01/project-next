import { RequirePermission } from '@/auth/authorizer/RequirePermission'

export const applicationPeriodAuth = {
    readAll: RequirePermission.staticFields({ permission: 'APPLICATION_USE' }),
    read: RequirePermission.staticFields({ permission: 'APPLICATION_USE' }),
    readNumberOfApplications: RequirePermission.staticFields({ permission: 'APPLICATION_USE' }),
    create: RequirePermission.staticFields({ permission: 'APPLICATION_ADMIN' }),
    update: RequirePermission.staticFields({ permission: 'APPLICATION_ADMIN' }),
    removeAllApplicationTexts: RequirePermission.staticFields({ permission: 'APPLICATION_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'APPLICATION_ADMIN' }),
}
