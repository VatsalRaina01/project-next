import {
    faDiscord,
    faFacebookSquare,
    faGithub,
    faInstagram,
    faLinkedin,
    faSnapchat,
    faSpotify,
    faStrava,
    faTiktok,
    faXTwitter,
    faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import type { SocialPlatform } from '@/prisma-generated-pn-types'

/**
 * The icon each platform is drawn with. This lives next to the components rather than in the
 * service's constants because it is the only part of a platform that is purely a matter of how it
 * looks - everything the server needs to know about a platform is in `@/services/socials/constants`.
 */
export const socialPlatformIcons = {
    FACEBOOK: faFacebookSquare,
    INSTAGRAM: faInstagram,
    TWITTER: faXTwitter,
    LINKEDIN: faLinkedin,
    GITHUB: faGithub,
    YOUTUBE: faYoutube,
    TIKTOK: faTiktok,
    SNAPCHAT: faSnapchat,
    DISCORD: faDiscord,
    STRAVA: faStrava,
    SPOTIFY: faSpotify,
    WEBSITE: faGlobe,
} as const satisfies Record<SocialPlatform, IconDefinition>
