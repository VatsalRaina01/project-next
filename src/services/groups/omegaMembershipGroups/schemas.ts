import { OmegaMembershipLevel } from '@/prisma-generated-pn-types'
import { z } from 'zod'

const userRelation = z.object({
    userId: z.number(),
})

export const omegaMembershipGroupSchemas = {
    read: z.union([
        z.object({ id: z.number() }),
        z.object({ omegaMembershipLevel: z.nativeEnum(OmegaMembershipLevel) }),
    ]),
    readUserLevel: userRelation,
    inferUserLevel: userRelation,
    updateUserOrderParams: userRelation,
    updateUserOrder: z.object({
        order: z.coerce.number().int().min(1),
    }),
    updateUserLevel: z.object({
        userId: z.number(),
        omegaMembershipLevel: z.nativeEnum(OmegaMembershipLevel),
        /**
         * When set, a user who already sits at the wanted level or a higher one is left alone.
         */
        onlyUpgrade: z.boolean().default(false),
    }),
} as const
