import { Require } from '@/auth/authorizer/Require'

export const omegaIdAuth = {
    generate: (userId: number) => Require.userId(userId),
    readPublicKey: Require.nothing(),
} as const
