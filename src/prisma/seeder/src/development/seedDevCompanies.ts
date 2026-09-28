import type { PrismaClient } from '@/prisma-generated-pn-client'

// The first few companies get a sponsor tier and a website so the ordering of the career listings,
// the badges that explain it, and the footer's sponsor strip are all visible in development without
// having to promote anyone by hand.
const SPONSORS_BY_INDEX = {
    0: { sponsorTier: 'MAIN', website: 'https://www.nordicsemi.com' },
    1: { sponsorTier: 'SPONSOR', website: 'https://www.kongsberg.com' },
    2: { sponsorTier: 'SPONSOR', website: null },
} as const

export default async function seedDevCompanies(prisma: PrismaClient) {
    await Promise.all(Array.from({ length: 100 }, (_, index) => prisma.company.create({
        data: {
            name: `Company ${index + 1}`,
            description: `Company ${index + 1} description`,
            ...(SPONSORS_BY_INDEX[index as keyof typeof SPONSORS_BY_INDEX] ?? { sponsorTier: 'NONE' }),
            logo: {
                create: {
                    name: `Company ${index + 1} logo`,
                }
            }
        }
    })))
}
