import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import type { PrismaClient } from '@/prisma-generated-pn-client'

/**
 * The order omega is in. The orders are seeded up to it, and the migration from omegaweb-basic
 * treats anything past it as bad data - omegaweb-basic had no notion of orders, so there is nothing
 * there to learn a newer one from. Omega increments through the app, which creates the next order
 * itself, so this only has to be right when a database is first set up.
 */
export const CURRENT_OMEGA_ORDER = 108

/**
 * Upserts every omega order up until CURRENT_OMEGA_ORDER.
 */
export const seedOrders = defineSeedOperation(async (prisma: PrismaClient) => {
    await Promise.all(
        Array.from({ length: CURRENT_OMEGA_ORDER }, (_, i) => i + 1).map(orderNumber =>
            prisma.omegaOrder.upsert({
                where: { order: orderNumber },
                create: { order: orderNumber },
                update: {},
            })
        )
    )
})
