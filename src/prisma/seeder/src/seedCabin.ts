import type { PrismaClient } from '@/prisma-generated-pn-client'
import type { CabinProduct, CabinProductPrice } from '@/prisma-generated-pn-types'

export default async function seedCabin(prisma: PrismaClient) {
    const products: (Omit<CabinProduct, 'id' > & {
        CabinProductPrice: (Omit<CabinProductPrice, 'id' | 'cabinProductId' | 'pricePeriodId'>)[]
    })[] = [
        {
            name: 'Hele hytta',
            amount: 1,
            type: 'CABIN',
            CabinProductPrice: [
                {
                    description: 'Søn-Tors',
                    cronInterval: '* * 0-4',
                    price: 100000,
                    memberShare: 0,
                },
                {
                    description: 'Helg (>50% Omega)',
                    cronInterval: '* * 5-6',
                    price: 470000 * 0.5,
                    memberShare: 50,
                },
                {
                    description: 'Helg (med Omega)',
                    cronInterval: '* * 5-6',
                    price: 470000 * 0.75,
                    memberShare: 1,
                },
                {
                    description: 'Helg',
                    cronInterval: '* * 5-6',
                    price: 470000,
                    memberShare: 0,
                },
            ]
        },
        {
            name: 'Seng (120cm)',
            amount: 3,
            type: 'BED',
            CabinProductPrice: [{
                description: '',
                cronInterval: '* * *',
                price: 25000,
                memberShare: 0,
            }]
        },
        {
            name: 'Køye seng (90cm)',
            amount: 14,
            type: 'BED',
            CabinProductPrice: [{
                description: '',
                cronInterval: '* * *',
                price: 15000,
                memberShare: 0,
            }]
        }
    ]

    // A second price period starting a month out, so the switchover between periods is
    // exercised without a second price list having to be written by hand.
    const NEXT_PERIOD_PRICE_FACTOR = 1.5

    // Seeded whole or not at all. The periods are dated relative to the run, so there is no
    // stable key to match an existing row against, and a cabin product in the table means this
    // has run before - its prices may have been edited through the admin pages since, which a
    // re-seed has no business undoing.
    const alreadySeeded = await prisma.cabinProduct.findFirst({ select: { id: true } })
    if (alreadySeeded) return

    const now = new Date()

    const pricePeriod = await prisma.pricePeriod.create({
        data: {
            validFrom: now
        }
    })

    const secondPricePeriod = await prisma.pricePeriod.create({
        data: {
            validFrom: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate())
        }
    })

    await Promise.all(products.map(product =>
        prisma.cabinProduct.create({
            data: {
                name: product.name,
                amount: product.amount,
                type: product.type,
                CabinProductPrice: {
                    // Both periods are derived from the declared price. The second used to be
                    // built by reading every price already in the table and multiplying it,
                    // which made each run inflate the prices the run before it had written.
                    create: product.CabinProductPrice.flatMap(price => [
                        {
                            ...price,
                            pricePeriodId: pricePeriod.id
                        },
                        {
                            ...price,
                            pricePeriodId: secondPricePeriod.id,
                            price: Math.round(price.price * NEXT_PERIOD_PRICE_FACTOR)
                        },
                    ])
                }
            }
        })
    ))

    await prisma.releasePeriod.create({
        data: {
            releaseTime: now,
            releaseUntil: new Date(now.getUTCFullYear(), now.getUTCMonth() + 2, now.getUTCDate())
        }
    })
    await prisma.releasePeriod.create({
        data: {
            releaseTime: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()),
            releaseUntil: new Date(now.getUTCFullYear(), now.getUTCMonth() + 4, now.getUTCDate())
        }
    })
}
