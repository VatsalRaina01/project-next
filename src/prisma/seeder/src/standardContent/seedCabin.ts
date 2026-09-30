import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import { upsert } from '@/seeder/src/upsert'
import type { PrismaClient } from '@/prisma-generated-pn-client'
import type { CabinProduct, CabinProductPrice } from '@/prisma-generated-pn-types'

type SeedCabinProductConfig = Omit<CabinProduct, 'id'> & {
    CabinProductPrice: (Omit<CabinProductPrice, 'id' | 'cabinProductId' | 'pricePeriodId'>)[]
}

/**
 * Upserts the cabin products, and the initial price and release periods.
 *
 * None of these have a natural unique key, and all of them are managed through the cabin admin
 * pages once they exist, so everything here is skip-if-exists: a product is matched on its name,
 * and the price and release periods are only seeded while there are none at all.
 */
export const seedCabin = defineSeedOperation(async (prisma: PrismaClient) => {
    const products: SeedCabinProductConfig[] = [
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

    const seededProducts = await Promise.all(products.map(product => upsert({
        checkExistance: () => prisma.cabinProduct.findFirst({
            where: { name: product.name },
            select: { id: true },
        }),
        create: async () => await prisma.cabinProduct.create({
            data: {
                name: product.name,
                amount: product.amount,
                type: product.type,
            }
        }),
        update: async () => await prisma.cabinProduct.findFirstOrThrow({
            where: { name: product.name },
        }),
    }).then(seeded => ({ ...product, id: seeded.id }))))

    const now = new Date()

    if (await prisma.pricePeriod.count() === 0) {
        const pricePeriods = await Promise.all([
            { validFrom: now, priceFactor: 1 },
            { validFrom: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()), priceFactor: 1.5 },
        ].map(async ({ validFrom, priceFactor }) => ({
            id: (await prisma.pricePeriod.create({ data: { validFrom } })).id,
            priceFactor,
        })))

        await prisma.cabinProductPrice.createMany({
            data: pricePeriods.flatMap(pricePeriod => seededProducts.flatMap(product =>
                product.CabinProductPrice.map(price => ({
                    ...price,
                    price: price.price * pricePeriod.priceFactor,
                    cabinProductId: product.id,
                    pricePeriodId: pricePeriod.id,
                }))
            )),
        })
    }

    if (await prisma.releasePeriod.count() === 0) {
        await prisma.releasePeriod.createMany({
            data: [
                {
                    releaseTime: now,
                    releaseUntil: new Date(now.getUTCFullYear(), now.getUTCMonth() + 2, now.getUTCDate())
                },
                {
                    releaseTime: new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()),
                    releaseUntil: new Date(now.getUTCFullYear(), now.getUTCMonth() + 4, now.getUTCDate())
                },
            ],
        })
    }
})
