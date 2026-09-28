import { RequireNothing } from '@/auth/authorizer/RequireNothing'
import { Require } from '@/auth/authorizer/Require'


export const frontpageAuth = {
    readSpecialCmsParagraphSection: RequireNothing.staticFields({}),
    updateSpecialCmsParagraphContentSection: Require.permission('FRONTPAGE_ADMIN'),
    readSpecialCmsImage: RequireNothing.staticFields({}),
    updateSpecialCmsImage: Require.permission('FRONTPAGE_ADMIN')
}
