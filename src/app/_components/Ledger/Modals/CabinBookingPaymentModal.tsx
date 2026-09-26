'use client'

import LedgerTransactionModal from './LedgerTransactionModal'
import { displayAmount } from '@/lib/currency/convert'
import { createCabinBookingPaymentAction } from '@/services/cabin/actions'
import type { LedgerTransactionPaymentMethod } from './LedgerTransactionModal'
import type { ReactNode } from 'react'

type Props = {
    funds: number,
    children: ReactNode,
    availableBalance?: number,
    availablePaymentMethods?: LedgerTransactionPaymentMethod[],
    customerSessionClientSecret?: string,
}

export default function CabinBookingPaymentModal({
    funds,
    children,
    availableBalance,
    availablePaymentMethods,
    customerSessionClientSecret,
}: Props) {
    return <LedgerTransactionModal
        popUpKey="cabinBookingPaymentModal"
        triggerLabel="Betal og book"
        title="Betal for hyttebooking"
        submitText="Betal og book"
        funds={funds}
        availableBalance={availableBalance}
        availablePaymentMethods={availablePaymentMethods ?? ['STRIPE', 'MANUAL']}
        customerSessionClientSecret={customerSessionClientSecret}
        refreshOnSuccess
        onSubmitAction={({ paymentMethod, manualFees, description }) => createCabinBookingPaymentAction({
            params: {
                provider: paymentMethod!,
                manualFees: manualFees ?? 0,
                description,
            }
        })}
    >
        {children}
        <p>Totalt for oppholdet: {displayAmount(funds)}</p>
    </LedgerTransactionModal>
}
