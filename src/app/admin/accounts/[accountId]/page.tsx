import LedgerAccountOverview from '@/components/Ledger/Accounts/LedgerAccountOverviewCard'
import LedgerAccountTransactionSummary from '@/components/Ledger/Accounts/LedgerAccountTransactionSummaryCard'
import { ledgerAccountOperations } from '@/services/ledger/accounts/operations'
import { serverPage } from '@/app/serverPage'
import { notFound } from 'next/navigation'
import type { PageOperationArgs } from '@/app/serverPage'

const { page, generateMetadata } = serverPage({
    operation: async ({ params }: PageOperationArgs<{ accountId: string }>) => {
        const accountId = Number(params.accountId)

        if (!accountId) {
            notFound()
        }

        return ledgerAccountOperations.read({ params: { ledgerAccountId: accountId } })
    },
    render: ({ data: ledgerAccount }) => (
        <div>
            <LedgerAccountOverview
                ledgerAccount={ledgerAccount}
                showDepositButton
                depositPaymentMethods={['MANUAL']}
                showPayoutButton
                showDeactivateButton
                showFees
            />
            {/* Add link to products overview */}
            <LedgerAccountTransactionSummary transactionsHref={`${ledgerAccount.id}/transactions`} />
        </div>
    ),
})

export default page
export { generateMetadata }
