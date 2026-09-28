import { Require } from '@/auth/authorizer/Require'

export const admissionAuth = {
    createTrial: Require.user().permission('ADMISSION_USE'),
    readTrial: (userId: number) => Require.anyOf(Require.permission('ADMISSION_USE'), Require.userId(userId)),
    userCompletedTrials: (userId: number) => Require.anyOf(Require.permission('ADMISSION_USE'), Require.userId(userId)),
} as const
