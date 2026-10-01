import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import { SpecialSocials } from '@/prisma-generated-pn/enums'
import type { SocialPlatform } from '@/prisma-generated-pn-types'
import type { PrismaClient } from '@/prisma-generated-pn-client'

/**
 * The links the frontpage and the footer used to have hardcoded into the SocialIcons component.
 * They are only created, never updated, so an administrator changing one on /admin/socials does
 * not get it put back on the next seed.
 */
const seedSpecialSocialsConfig: Record<SpecialSocials, Partial<Record<SocialPlatform, string>>> = {
    FRONTPAGE: {
        TWITTER: 'https://twitter.com/OmegaVevcom',
        FACEBOOK: 'https://www.facebook.com/SctOmegaBroderskab/',
        INSTAGRAM: 'https://www.instagram.com/sctomega/',
    },
}

export const seedSocials = defineSeedOperation(async (prisma: PrismaClient) => {
    await Promise.all(
        Object.values(SpecialSocials).flatMap(special =>
            Object.entries(seedSpecialSocialsConfig[special]).map(([platform, url]) =>
                prisma.social.upsert({
                    where: { special_platform: { special, platform: platform as SocialPlatform } },
                    create: { special, platform: platform as SocialPlatform, url },
                    update: {},
                })
            )
        )
    )
})
