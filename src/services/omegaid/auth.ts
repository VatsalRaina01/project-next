import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { Require } from '@/auth/authorizer/Require'

export const omegaIdAuth = {
    generate: (userId: number) => Require.userId(userId),
    readPublicKey: RequireNothing.staticFields({}),
} as const
