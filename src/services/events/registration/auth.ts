import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequirePermissionAndUser } from '@/auth/authorizer/RequirePermissionAndUser'
import { RequireUser } from '@/auth/authorizer/RequireUser'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'

export const eventRegistrationAuth = {
    // TODO: Fix authing
    create: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_REGISTRATION_CREATE' }),
    createGuest: RequirePermission.staticFields({ permission: 'EVENT_ADMIN' }),
    readDotPunishmentOfUser: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_ADMIN' }),
    readOfUser: RequireUserIdOrPermission.staticFields({ permission: 'EVENT_REGISTRATION_READ' }),
    readPage: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_READ' }),
    readPageDetailed: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_READ' }),
    updateNotes: RequireUser.staticFields({}), // TODO: bypass permission
    destroy: RequirePermissionAndUser.staticFields({ permission: 'EVENT_REGISTRATION_DESROY' }),
}
