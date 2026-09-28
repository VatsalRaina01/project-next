import { Require } from '@/auth/authorizer/Require'

export const omegaQuotesAuth = {
    create: (userId: number) => Require.userId(userId).permission('OMEGAQUOTES_USE'),
    readPage: Require.permission('OMEGAQUOTES_USE')
} as const
