import { Require } from '@/auth/authorizer/Require'

const userIdOrAdmissionUse = Require.anyOf(Require.permission('ADMISSION_USE'), Require.userId())

export const admissionAuth = {
    createTrial: Require.user().permission('ADMISSION_USE'),
    readTrial: (userId: number) => userIdOrAdmissionUse.data({ userId }),
    userCompletedTrials: (userId: number) => userIdOrAdmissionUse.data({ userId }),
} as const
