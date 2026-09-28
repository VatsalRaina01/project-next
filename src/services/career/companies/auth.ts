import { RequirePermission } from '@/auth/authorizer/RequirePermission'
import { RequireNothing } from '@/auth/authorizer/RequireNothing'

export const companyAuth = {
    // The sponsor strip is public branding shown in the footer of the logged-out front page, so this
    // read cannot require a session the way the rest of the company service does.
    readSponsors: RequireNothing.staticFields({}),
    create: RequirePermission.staticFields({ permission: 'COMPANY_ADMIN' }),
    readPage: RequirePermission.staticFields({ permission: 'COMPANY_READ' }),
    update: RequirePermission.staticFields({ permission: 'COMPANY_ADMIN' }),
    updateSponsorTier: RequirePermission.staticFields({ permission: 'COMPANY_ADMIN' }),
    updateCmsImageLogo: RequirePermission.staticFields({ permission: 'COMPANY_ADMIN' }),
    destroy: RequirePermission.staticFields({ permission: 'COMPANY_ADMIN' }),
}
