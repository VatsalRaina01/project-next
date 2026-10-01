import { Session } from '@/auth/session/Session'
import { Smorekopp } from '@/services/error'
import { prisma } from '@/prisma-pn-client-instance'
import { socialOperations } from '@/services/socials/operations'
import { normalizeSocialUrl } from '@/services/socials/schemas'
import { userFilterSelection } from '@/services/users/constants'
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals'
import type { UserFiltered } from '@/services/users/types'
import type { SocialOwner } from '@/services/socials/types'

const USERNAME = 'socials-test'
const OTHER_USERNAME = 'socials-test-other'

let user: UserFiltered
let otherUser: UserFiltered
let owner: SocialOwner
let otherOwner: SocialOwner

const frontpage = { type: 'SPECIAL', special: 'FRONTPAGE' } as const

/** A logged-in user with nothing but their own account to their name. */
const sessionOf = (sessionUser: UserFiltered) => Session.fromJsObject({
    memberships: [],
    permissions: [],
    user: sessionUser,
})

const frontpageAdminSession = Session.fromJsObject({
    memberships: [],
    permissions: ['FRONTPAGE_ADMIN'],
    user: null,
})

const userAdminSession = Session.fromJsObject({
    memberships: [],
    permissions: ['USERS_UPDATE', 'USERS_READ'],
    user: null,
})

beforeAll(async () => {
    user = await prisma.user.create({
        data: { username: USERNAME, email: `${USERNAME}@omega.ntnu.no` },
        select: userFilterSelection,
    })
    otherUser = await prisma.user.create({
        data: { username: OTHER_USERNAME, email: `${OTHER_USERNAME}@omega.ntnu.no` },
        select: userFilterSelection,
    })
    owner = { type: 'USER', userId: user.id }
    otherOwner = { type: 'USER', userId: otherUser.id }
})

afterAll(async () => {
    await prisma.user.deleteMany({ where: { username: { in: [USERNAME, OTHER_USERNAME] } } })
})

describe('normalizing what someone typed into a link', () => {
    test('a bare handle is expanded into the platform´s address', () => {
        expect(normalizeSocialUrl('GITHUB', 'vevcom')).toEqual({
            success: true,
            url: 'https://github.com/vevcom',
        })
    })

    test('a leading @ is not part of the handle', () => {
        expect(normalizeSocialUrl('INSTAGRAM', '@sctomega')).toEqual({
            success: true,
            url: 'https://www.instagram.com/sctomega',
        })
    })

    test('a full address on the platform´s own host is kept', () => {
        expect(normalizeSocialUrl('TWITTER', 'https://x.com/OmegaVevcom')).toEqual({
            success: true,
            url: 'https://x.com/OmegaVevcom',
        })
    })

    test('an address missing its scheme is still understood as an address', () => {
        expect(normalizeSocialUrl('INSTAGRAM', 'instagram.com/sctomega')).toEqual({
            success: true,
            url: 'https://instagram.com/sctomega',
        })
    })

    test('a subdomain of the platform is accepted', () => {
        expect(normalizeSocialUrl('FACEBOOK', 'https://www.facebook.com/SctOmegaBroderskab/').success)
            .toBe(true)
    })

    test('a link to somewhere else entirely is refused', () => {
        expect(normalizeSocialUrl('GITHUB', 'https://evil.example.com/vevcom').success).toBe(false)
    })

    test('a host that merely ends in the platform´s name is refused', () => {
        expect(normalizeSocialUrl('GITHUB', 'https://notgithub.com/vevcom').success).toBe(false)
    })

    test('a platform without one canonical address demands the whole link', () => {
        expect(normalizeSocialUrl('LINKEDIN', 'ola-nordmann').success).toBe(false)
        expect(normalizeSocialUrl('LINKEDIN', 'https://www.linkedin.com/in/ola-nordmann').success)
            .toBe(true)
    })

    test('the website platform takes any http address', () => {
        expect(normalizeSocialUrl('WEBSITE', 'https://omega.ntnu.no').success).toBe(true)
        // eslint-disable-next-line no-script-url -- the point of the test is that it is refused
        expect(normalizeSocialUrl('WEBSITE', 'javascript://omega.ntnu.no/%0Aalert(1)').success).toBe(false)
    })

    test('an empty link is refused', () => {
        expect(normalizeSocialUrl('GITHUB', '   ').success).toBe(false)
    })
})

describe('a user´s own socials', () => {
    test('upserting creates the link, and upserting again replaces it', async () => {
        const created = await socialOperations.upsertSocial({
            params: { owner },
            data: { platform: 'GITHUB', url: 'vevcom' },
            session: sessionOf(user),
        })
        expect(created.url).toBe('https://github.com/vevcom')

        const updated = await socialOperations.upsertSocial({
            params: { owner },
            data: { platform: 'GITHUB', url: 'https://github.com/vegardbauge' },
            session: sessionOf(user),
        })
        expect(updated.id).toBe(created.id)
        expect(updated.url).toBe('https://github.com/vegardbauge')

        const socials = await socialOperations.readSocials({
            params: { owner },
            session: sessionOf(user),
        })
        expect(socials).toHaveLength(1)
    })

    test('the socials come back in the order the platforms are listed in', async () => {
        await socialOperations.upsertSocial({
            params: { owner },
            data: { platform: 'INSTAGRAM', url: 'sctomega' },
            session: sessionOf(user),
        })
        const socials = await socialOperations.readSocials({
            params: { owner },
            session: sessionOf(user),
        })
        // INSTAGRAM is declared before GITHUB, so it comes first however it was added.
        expect(socials.map(social => social.platform)).toEqual(['INSTAGRAM', 'GITHUB'])
    })

    test('one user´s socials are not another´s', async () => {
        const socials = await socialOperations.readSocials({
            params: { owner: otherOwner },
            session: sessionOf(otherUser),
        })
        expect(socials).toHaveLength(0)
    })

    test('someone else may not write to your socials', async () => {
        await expect(socialOperations.upsertSocial({
            params: { owner },
            data: { platform: 'TWITTER', url: 'someoneelse' },
            session: sessionOf(otherUser),
        })).rejects.toThrow(Smorekopp)
    })

    test('an administrator may write to them for you', async () => {
        const created = await socialOperations.upsertSocial({
            params: { owner },
            data: { platform: 'TWITTER', url: 'OmegaVevcom' },
            session: userAdminSession,
        })
        expect(created.url).toBe('https://twitter.com/OmegaVevcom')
    })

    test('destroying removes only the platform asked for', async () => {
        await socialOperations.destroySocial({
            params: { owner, platform: 'TWITTER' },
            session: sessionOf(user),
        })
        const socials = await socialOperations.readSocials({
            params: { owner },
            session: sessionOf(user),
        })
        expect(socials.map(social => social.platform)).toEqual(['INSTAGRAM', 'GITHUB'])
    })

    test('a link that does not belong on the platform is refused', async () => {
        await expect(socialOperations.upsertSocial({
            params: { owner },
            data: { platform: 'GITHUB', url: 'https://evil.example.com/vevcom' },
            session: sessionOf(user),
        })).rejects.toThrow(Smorekopp)
    })
})

describe('the site-wide socials', () => {
    test('anyone may read them', async () => {
        const socials = await socialOperations.readSocials({
            params: { owner: frontpage },
            session: Session.empty(),
        })
        // The seeder puts the links the frontpage used to have hardcoded here.
        expect(socials.map(social => social.platform)).toEqual(['FACEBOOK', 'INSTAGRAM', 'TWITTER'])
    })

    test('editing them takes FRONTPAGE_ADMIN, not merely a login', async () => {
        await expect(socialOperations.upsertSocial({
            params: { owner: frontpage },
            data: { platform: 'GITHUB', url: 'vevcom' },
            session: sessionOf(user),
        })).rejects.toThrow(Smorekopp)

        const created = await socialOperations.upsertSocial({
            params: { owner: frontpage },
            data: { platform: 'GITHUB', url: 'vevcom' },
            session: frontpageAdminSession,
        })
        expect(created.url).toBe('https://github.com/vevcom')

        await socialOperations.destroySocial({
            params: { owner: frontpage, platform: 'GITHUB' },
            session: frontpageAdminSession,
        })
    })

    test('a user holding USERS_UPDATE cannot reach the frontpage set', async () => {
        await expect(socialOperations.upsertSocial({
            params: { owner: frontpage },
            data: { platform: 'DISCORD', url: 'omega' },
            session: userAdminSession,
        })).rejects.toThrow(Smorekopp)
    })
})
