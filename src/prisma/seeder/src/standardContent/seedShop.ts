import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import type { PrismaClient } from '@/prisma-generated-pn-client'

export const FRIDGE_NAME = 'Koigeskabet'

/**
 * Upserts the fridge shop, keyed on the unique shop name. An existing shop is left untouched -
 * its description and ledger account are edited through the admin pages.
 */
export const seedShop = defineSeedOperation(async (prisma: PrismaClient) => {
    await prisma.shop.upsert({
        where: { name: FRIDGE_NAME },
        update: {},
        create: {
            name: FRIDGE_NAME,
            description: 'Her kan du kjøpe snack og drikke fra kjøleskapet på Lophtet.'
        }
    })
})
