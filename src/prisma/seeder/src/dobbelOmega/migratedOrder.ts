import manifest from './manifest'
import { CURRENT_OMEGA_ORDER } from '@/prisma/seeder/src/standardContent/seedOrders'

/**
 * The order to write a migrated membership to.
 *
 * The orders come from the seeder and from nowhere else: omegaweb-basic knew nothing of them, so
 * the migration has nothing to learn a new one from and never creates one. An order past the
 * current one is therefore bad data - a user registered with a year that has not come yet, or a
 * class ladder inferred further than the orders go. It is reported in the manifest and brought
 * down to the current order, so the membership still lands and nothing in omega sits ahead of omega.
 *
 * @param order - The order as omegaweb-basic has it, or as inferred from it.
 * @param what - What the order belongs to, for the manifest.
 */
export function migratedOrder(order: number, what: string): number {
    if (order <= CURRENT_OMEGA_ORDER) return order
    manifest.error(
        `${what} is of order ${order}, past the current order ${CURRENT_OMEGA_ORDER} - setting to ${CURRENT_OMEGA_ORDER}`
    )
    return CURRENT_OMEGA_ORDER
}
