import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import type { PrismaClient } from '@/prisma-generated-pn-client'

const BULLSHIT_COUNT = 100

export const seedDevBullshit = defineSeedOperation(async (prisma: PrismaClient) => {
    const user = await prisma.user.findFirst({})
    if (!user) {
        return
    }

    // The dev container seeds on every start without resetting, so each sample is keyed by its
    // own quote text and only created when missing - a blind createMany would stack up another
    // hundred copies every restart. Quotes written through the site are left alone.
    await Promise.all(Array.from({ length: BULLSHIT_COUNT }, async (_, index) => {
        const quote = `Bullshit ${index + 1}`
        const existing = await prisma.bullshit.findFirst({
            where: { quote },
            select: { id: true },
        })
        if (existing) return

        await prisma.bullshit.create({
            data: {
                quote,
                bullshitPoster: {
                    connect: {
                        id: user.id
                    }
                },
            }
        })
    }))
})
