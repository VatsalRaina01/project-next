import type { Prisma } from '@/prisma-generated-pn-types'

export type ExpandedLedgerTransaction = Prisma.LedgerTransactionGetPayload<{
    include: {
        ledgerEntries: true,
        payment: {
            include: {
                stripePayment: true,
                manualPayment: true,
            },
        },
        booking: {
            include: {
                event: { select: { name: true } },
            },
        },
        eventRegistration: {
            include: {
                event: { select: { name: true, location: true, eventStart: true, eventEnd: true } },
            },
        },
        purchase: {
            include: {
                shop: { select: { name: true } },
                PurchaseProduct: { include: { product: { select: { name: true } } } },
            },
        },
    }
}>
