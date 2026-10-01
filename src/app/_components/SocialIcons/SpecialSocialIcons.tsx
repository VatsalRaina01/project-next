import SocialIcons from './SocialIcons'
import { readSocialsAction } from '@/services/socials/actions'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import type { SpecialSocials } from '@/prisma-generated-pn-types'

export type PropTypes = {
    special: SpecialSocials,
}

/**
 * The socials of one of the site-wide sets - the ones an administrator maintains under
 * /admin/socials, as opposed to the ones a user puts on their own profile.
 */
export default async function SpecialSocialIcons({ special }: PropTypes) {
    const socials = unwrapActionReturn(await readSocialsAction({
        params: { owner: { type: 'SPECIAL', special } }
    }))

    return <SocialIcons socials={socials} />
}
