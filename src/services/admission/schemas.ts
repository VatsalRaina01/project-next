import { z } from 'zod'

const userRelation = z.object({
    userId: z.coerce.number(),
})

export const admissionSchemas = {
    createTrial: userRelation,
    readTrial: userRelation,
    userCompletedTrials: userRelation,
} as const
