import { Require } from '@/auth/authorizer/Require'

export const profileImagesImagePanelAuth = Require.permission('USERS_ADMIN')

type UserFieldMatch = { username?: string, id?: number, email?: string }

export const userAuth = {
    readProfile: (username: string) => Require.anyOf(Require.permission('USERS_USE'), Require.userField({ username })),
    read: (fields: UserFieldMatch) => Require.anyOf(Require.permission('USERS_USE'), Require.userField(fields)),
    readOrNull: (fields: UserFieldMatch) => Require.anyOf(Require.permission('USERS_USE'), Require.userField(fields)),
    readPage: Require.permission('USERS_USE'),
    search: Require.permission('USERS_USE'),
    create: Require.permission('USERS_ADMIN'),
    connectStudentCard: Require.user(),
    registerNewEmail: (userId: number) => Require.anyOf(Require.permission('USERS_ADMIN'), Require.userId(userId)),
    updatePassword: (userId: number) => Require.anyOf(Require.permission('USERS_ADMIN'), Require.userId(userId)),
    update: Require.permission('USERS_ADMIN'),
    updateProfile: (username: string) => Require.anyOf(Require.permission('USERS_ADMIN'), Require.userField({ username })),
    updateProfileImage: (username: string) =>
        Require.anyOf(Require.permission('USERS_ADMIN'), Require.userField({ username })),
    register: (userId: number) => Require.userId(userId),
    destroy: Require.permission('USERS_ADMIN'),
} as const
