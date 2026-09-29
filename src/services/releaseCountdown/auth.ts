import { Require } from '@/auth/authorizer/Require'

export const releaseCountdownAuth = {
    readIsActive: Require.nothing(),
    unlock: Require.nothing(),
} as const
