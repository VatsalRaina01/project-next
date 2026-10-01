import '@pn-server-only'
import { authorizeSocialOwner, socialAuth } from './auth'
import { socialOwnerSchema, socialSchemas } from './schemas'
import { socialFilterSelection, socialPlatformsInDisplayOrder } from './constants'
import { defineOperation } from '@/services/serviceOperation'
import { SocialPlatform } from '@/prisma-generated-pn-types'
import { z } from 'zod'
import type { SocialOwner } from './types'
import type { Prisma } from '@/prisma-generated-pn-client'

/**
 * The rows belonging to one owner. Exactly one of the two columns is set on any row, so filtering
 * on the owner's own column is enough to keep one owner's socials out of another's.
 */
function socialsOf(owner: SocialOwner): Prisma.SocialWhereInput {
    return owner.type === 'USER' ? { userId: owner.userId } : { special: owner.special }
}

/** The single row for one platform of one owner, addressed by the unique constraint it lives under. */
function socialOf(owner: SocialOwner, platform: SocialPlatform): Prisma.SocialWhereUniqueInput {
    return owner.type === 'USER'
        ? { userId_platform: { userId: owner.userId, platform } }
        : { special_platform: { special: owner.special, platform } }
}

export const socialOperations = {
    readSocials: defineOperation({
        paramsSchema: z.object({
            owner: socialOwnerSchema,
        }),
        authorizer: ({ params }) => authorizeSocialOwner(socialAuth.readSocials, params.owner),
        operation: async ({ prisma, params }) => {
            const socials = await prisma.social.findMany({
                where: socialsOf(params.owner),
                select: socialFilterSelection,
            })
            // Ordered by the platform list rather than by anything on the row, so every owner's
            // socials come out in the same order and no one has to maintain a rank.
            return socials.sort((socialOne, socialTwo) =>
                socialPlatformsInDisplayOrder.indexOf(socialOne.platform) -
                socialPlatformsInDisplayOrder.indexOf(socialTwo.platform)
            )
        }
    }),

    /**
     * Sets the owner's link on one platform, whether or not they already had one. An owner has at
     * most one link per platform, so there is nothing an editor would want a separate create and
     * update for - both are "this is my Github now".
     */
    upsertSocial: defineOperation({
        paramsSchema: z.object({
            owner: socialOwnerSchema,
        }),
        dataSchema: socialSchemas.upsertSocial,
        authorizer: ({ params }) => authorizeSocialOwner(socialAuth.upsertSocial, params.owner),
        operation: ({ prisma, params, data }) => prisma.social.upsert({
            where: socialOf(params.owner, data.platform),
            create: {
                platform: data.platform,
                url: data.url,
                ...(params.owner.type === 'USER'
                    ? { userId: params.owner.userId }
                    : { special: params.owner.special }),
            },
            update: {
                url: data.url,
            },
            select: socialFilterSelection,
        })
    }),

    destroySocial: defineOperation({
        paramsSchema: z.object({
            owner: socialOwnerSchema,
            platform: z.nativeEnum(SocialPlatform),
        }),
        authorizer: ({ params }) => authorizeSocialOwner(socialAuth.destroySocial, params.owner),
        operation: async ({ prisma, params }) => {
            await prisma.social.delete({
                where: socialOf(params.owner, params.platform),
            })
        }
    }),
} as const
