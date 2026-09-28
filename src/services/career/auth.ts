import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { Require } from '@/auth/authorizer/Require'

export const careerAuth = {
    readSpecialCmsParagraphCareerInfo: RequireNothing.staticFields({}),
    updateSpecialCmsParagraphContentCareerInfo:
        Require.anyOf(Require.permission('JOBAD_ADMIN'), Require.permission('COMMITTEE_ADMIN')),
    readSpecialCmsLink: RequireNothing.staticFields({}),
    updateSpecialCmsLink: Require.anyOf(Require.permission('JOBAD_ADMIN'), Require.permission('COMMITTEE_ADMIN'))
} as const
