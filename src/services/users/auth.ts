import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequireUser } from '@/auth/authorizer/RequireUser'
import { RequireUserFieldOrPermission } from '@/auth/authorizer/RequireUserFieldOrPermission'
import { RequireUserId } from '@/auth/authorizer/RequireUserId'
import { RequireUserIdOrPermission } from '@/auth/authorizer/RequireUserIdOrPermission'
import { RequireUsernameOrPermission } from '@/auth/authorizer/RequireUsernameOrPermission'

export const profileImagesImagePanelAuth = RequirePermission.staticFields({ permission: 'USERS_ADMIN' })

export const userAuth = {
    readProfile: RequireUsernameOrPermission.staticFields({ permission: 'USERS_USE' }),
    read: RequireUserFieldOrPermission.staticFields({ permission: 'USERS_USE' }),
    readOrNull: RequireUserFieldOrPermission.staticFields({ permission: 'USERS_USE' }),
    readPage: RequirePermission.staticFields({ permission: 'USERS_USE' }),
    search: RequirePermission.staticFields({ permission: 'USERS_USE' }),
    create: RequirePermission.staticFields({ permission: 'USERS_ADMIN' }),
    connectStudentCard: RequireUser.staticFields({}),
    registerNewEmail: RequireUserIdOrPermission.staticFields({ permission: 'USERS_ADMIN' }),
    updatePassword: RequireUserIdOrPermission.staticFields({ permission: 'USERS_ADMIN' }),
    update: RequirePermission.staticFields({ permission: 'USERS_ADMIN' }),
    updateProfile: RequireUsernameOrPermission.staticFields({ permission: 'USERS_ADMIN' }),
    updateProfileImage: RequireUsernameOrPermission.staticFields({ permission: 'USERS_ADMIN' }),
    register: RequireUserId.staticFields({}),
    destroy: RequirePermission.staticFields({ permission: 'USERS_ADMIN' }),
} as const
