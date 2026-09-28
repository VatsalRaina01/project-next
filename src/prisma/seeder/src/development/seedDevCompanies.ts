import type { PrismaClient } from '@/prisma-generated-pn-client'

// The first few companies get a sponsor tier so the ordering of the career listings - and the
// badges that explain it - are visible in development without having to promote anyone by hand.
const SPONSOR_TIER_BY_INDEX = {
    0: 'MAIN',
    1: 'SPONSOR',
    2: 'SPONSOR',
} as const

export default async function seedDevCompanies(prisma: PrismaClient) {
    await Promise.all(Array.from({ length: 100 }, (_, index) => prisma.company.create({
        data: {
            name: `Company ${index + 1}`,
            description: `Company ${index + 1} description`,
            sponsorTier: SPONSOR_TIER_BY_INDEX[index as keyof typeof SPONSOR_TIER_BY_INDEX] ?? 'NONE',
            logo: {
                create: {
                    name: `Company ${index + 1} logo`,
                }
            }
        }
    })))
}
