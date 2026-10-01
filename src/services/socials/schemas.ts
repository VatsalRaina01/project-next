import { socialPlatformConfig } from './constants'
import { SocialPlatform, SpecialSocials } from '@/prisma-generated-pn-types'
import { z } from 'zod'

/** What a handle may be made of - the characters the platforms allow in the name part of a link. */
const handleRegex = /^@?[\w.-]{1,100}$/

/** Matches an address that names its own scheme, e.g. `https://…`. */
const schemeRegex = /^[a-z][\w+.-]*:\/\//i

export type NormalizedSocialUrl =
    | { success: true, url: string }
    | { success: false, message: string }

/**
 * Turns what someone typed into the link that gets stored.
 *
 * Both shapes are accepted: a full address, which is checked against the platform's hostnames so
 * that a Github field cannot hold a link to somewhere else entirely, and a bare handle, which is
 * expanded into the platform's canonical address. A platform with no canonical address
 * (LinkedIn, a plain website) only takes the full form.
 */
export function normalizeSocialUrl(platform: SocialPlatform, input: string): NormalizedSocialUrl {
    const config = socialPlatformConfig[platform]
    const trimmed = input.trim()

    if (trimmed === '') return { success: false, message: 'Lenken kan ikke være tom' }

    // Anything with a scheme or a slash in it is meant as an address, not as a handle. Without
    // this, `instagram.com/sctomega` would be expanded into instagram.com/instagram.com/sctomega.
    const looksLikeUrl = schemeRegex.test(trimmed) || trimmed.includes('/')

    if (!looksLikeUrl) {
        if (!config.profileUrl) {
            return { success: false, message: `${config.label} krever en hel lenke` }
        }
        if (!handleRegex.test(trimmed)) {
            return { success: false, message: 'Brukernavnet inneholder ugyldige tegn' }
        }
        return { success: true, url: config.profileUrl(trimmed.replace(/^@/, '')) }
    }

    // A bare `instagram.com/sctomega` has no scheme for the URL parser to work with.
    const withScheme = schemeRegex.test(trimmed) ? trimmed : `https://${trimmed}`

    let url: URL
    try {
        url = new URL(withScheme)
    } catch {
        return { success: false, message: 'Ugyldig lenke' }
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return { success: false, message: 'Lenken må være en http- eller https-lenke' }
    }

    // An empty host list means the platform takes any address - that is what WEBSITE is for.
    const host = url.hostname.toLowerCase()
    const hostAllowed = config.hosts.length === 0 ||
        config.hosts.some(allowed => host === allowed || host.endsWith(`.${allowed}`))
    if (!hostAllowed) {
        return { success: false, message: `Lenken må peke til ${config.hosts.join(' eller ')}` }
    }

    return { success: true, url: url.toString() }
}

/**
 * Who a set of socials belongs to. A social is owned either by a user or by one of the site-wide
 * sets - the same operations serve both, and only the authorizer differs.
 */
export const socialOwnerSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('USER'),
        userId: z.number(),
    }),
    z.object({
        type: z.literal('SPECIAL'),
        special: z.nativeEnum(SpecialSocials),
    }),
])

const socialLink = z.object({
    platform: z.nativeEnum(SocialPlatform),
    url: z.string().max(300, 'Lenken kan ikke være lengre enn 300 tegn'),
}).transform((value, ctx) => {
    const normalized = normalizeSocialUrl(value.platform, value.url)
    if (!normalized.success) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['url'],
            message: normalized.message,
        })
        return z.NEVER
    }
    return { platform: value.platform, url: normalized.url }
})

export const socialSchemas = {
    upsertSocial: socialLink,
} as const
