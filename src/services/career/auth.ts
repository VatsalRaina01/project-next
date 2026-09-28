import { Require } from '@/auth/authorizer/Require'

export const careerAuth = {
    readSpecialCmsParagraphCareerInfo: Require.nothing(),
    updateSpecialCmsParagraphContentCareerInfo:
        Require.anyOf(Require.permission('JOBAD_ADMIN'), Require.permission('COMMITTEE_ADMIN')),
    readSpecialCmsLink: Require.nothing(),
    updateSpecialCmsLink: Require.anyOf(Require.permission('JOBAD_ADMIN'), Require.permission('COMMITTEE_ADMIN'))
} as const
