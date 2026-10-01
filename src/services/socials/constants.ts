import { createSelection } from '@/services/createSelection'
import type { Social, SocialPlatform } from '@/prisma-generated-pn-types'

export const socialFieldsToExpose = ['id', 'platform', 'url'] as const satisfies (keyof Social)[]
export const socialFilterSelection = createSelection([...socialFieldsToExpose])

/**
 * What a link on a given platform is allowed to look like, and how to build one from a bare handle.
 *
 * `hosts` are the hostnames a full URL may point at - a link is only accepted on a platform if it
 * matches one of them (or a subdomain of one), so a Github field cannot quietly hold an arbitrary
 * address. `profileUrl` turns a bare handle into the canonical link, so someone can type
 * `sctomega` instead of the whole address; a platform with no single canonical shape sets it to
 * null and demands a full URL instead.
 */
export type SocialPlatformConfig = {
    label: string,
    hosts: readonly string[],
    profileUrl: ((handle: string) => string) | null,
    /** Shown to the user as the input's placeholder. */
    placeholder: string,
}

export const socialPlatformConfig = {
    FACEBOOK: {
        label: 'Facebook',
        hosts: ['facebook.com', 'fb.com', 'fb.me'],
        profileUrl: handle => `https://www.facebook.com/${handle}`,
        placeholder: 'SctOmegaBroderskab',
    },
    INSTAGRAM: {
        label: 'Instagram',
        hosts: ['instagram.com'],
        profileUrl: handle => `https://www.instagram.com/${handle}`,
        placeholder: 'sctomega',
    },
    TWITTER: {
        label: 'X (Twitter)',
        hosts: ['twitter.com', 'x.com'],
        profileUrl: handle => `https://twitter.com/${handle}`,
        placeholder: 'OmegaVevcom',
    },
    LINKEDIN: {
        // LinkedIn puts people under /in/ and organisations under /company/, so there is no one
        // handle shape to expand - the whole address has to be given.
        label: 'LinkedIn',
        hosts: ['linkedin.com'],
        profileUrl: null,
        placeholder: 'https://www.linkedin.com/in/ditt-navn',
    },
    GITHUB: {
        label: 'GitHub',
        hosts: ['github.com'],
        profileUrl: handle => `https://github.com/${handle}`,
        placeholder: 'vevcom',
    },
    YOUTUBE: {
        label: 'YouTube',
        hosts: ['youtube.com', 'youtu.be'],
        profileUrl: handle => `https://www.youtube.com/@${handle}`,
        placeholder: 'sctomega',
    },
    TIKTOK: {
        label: 'TikTok',
        hosts: ['tiktok.com'],
        profileUrl: handle => `https://www.tiktok.com/@${handle}`,
        placeholder: 'sctomega',
    },
    SNAPCHAT: {
        label: 'Snapchat',
        hosts: ['snapchat.com'],
        profileUrl: handle => `https://www.snapchat.com/add/${handle}`,
        placeholder: 'sctomega',
    },
    DISCORD: {
        // What people share for Discord is an invite, not a profile.
        label: 'Discord',
        hosts: ['discord.gg', 'discord.com'],
        profileUrl: handle => `https://discord.gg/${handle}`,
        placeholder: 'invitasjonskode',
    },
    STRAVA: {
        label: 'Strava',
        hosts: ['strava.com'],
        profileUrl: handle => `https://www.strava.com/athletes/${handle}`,
        placeholder: 'athlete-id',
    },
    SPOTIFY: {
        label: 'Spotify',
        hosts: ['spotify.com'],
        profileUrl: handle => `https://open.spotify.com/user/${handle}`,
        placeholder: 'brukernavn',
    },
    WEBSITE: {
        // The catch-all: any address goes, so there is nothing to check the host against and
        // nothing to expand a handle into.
        label: 'Nettside',
        hosts: [],
        profileUrl: null,
        placeholder: 'https://omega.ntnu.no',
    },
} as const satisfies Record<SocialPlatform, SocialPlatformConfig>

/**
 * The order socials are rendered in, everywhere they are rendered. Keeping it here rather than on
 * the rows means no one has to maintain a rank, and every owner's socials come out in the same
 * order as everyone else's.
 */
export const socialPlatformsInDisplayOrder =
    Object.keys(socialPlatformConfig) as (keyof typeof socialPlatformConfig)[]
