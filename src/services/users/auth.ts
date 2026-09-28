import { Require } from '@/auth/authorizer/Require'

export const profileImagesImagePanelAuth = Require.permission('USERS_ADMIN')

const userFieldOrUsersUse = Require.anyOf(Require.permission('USERS_USE'), Require.userField())
const userFieldOrUsersAdmin = Require.anyOf(Require.permission('USERS_ADMIN'), Require.userField())
const userIdOrUsersAdmin = Require.anyOf(Require.permission('USERS_ADMIN'), Require.userId())

export const userAuth = {
    readProfile: userFieldOrUsersUse,
    read: userFieldOrUsersUse,
    readOrNull: userFieldOrUsersUse,
    readPage: Require.permission('USERS_USE'),
    search: Require.permission('USERS_USE'),
    create: Require.permission('USERS_ADMIN'),
    connectStudentCard: Require.user(),
    registerNewEmail: userIdOrUsersAdmin,
    updatePassword: userIdOrUsersAdmin,
    update: Require.permission('USERS_ADMIN'),
    updateProfile: userFieldOrUsersAdmin,
    updateProfileImage: userFieldOrUsersAdmin,
    register: Require.userId(),
    destroy: Require.permission('USERS_ADMIN'),
} as const
