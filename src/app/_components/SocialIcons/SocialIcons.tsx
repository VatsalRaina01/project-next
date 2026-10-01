import { socialPlatformIcons } from './socialPlatformIcons'
import { socialPlatformConfig } from '@/services/socials/constants'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { SocialFiltered } from '@/services/socials/types'

export type PropTypes = {
    socials: SocialFiltered[],
}

/**
 * A row of links to the socials it is given, as bare anchors - the size, colour and spacing of the
 * icons are left to whatever is rendering them, since the frontpage and the footer want them to
 * look different.
 */
export default function SocialIcons({ socials }: PropTypes) {
    return (
        <>
            {socials.map(social => (
                <Link
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialPlatformConfig[social.platform].label}
                >
                    <FontAwesomeIcon icon={socialPlatformIcons[social.platform]} />
                </Link>
            ))}
        </>
    )
}
