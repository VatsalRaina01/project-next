import styles from './page.module.scss'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import LedgerAccountOverview from '@/components/Ledger/Accounts/LedgerAccountOverviewCard'
import LedgerAccountTransactionSummary from '@/components/Ledger/Accounts/LedgerAccountTransactionSummaryCard'
import LedgerAccountGroupsCard from '@/components/Ledger/Accounts/LedgerAccountGroupsCard'
import EditLedgerAccountDetailsForm from '@/components/Ledger/Accounts/EditLedgerAccountDetailsForm'
import PopUp from '@/components/PopUp/PopUp'
import { readLedgerAccountAction } from '@/services/ledger/accounts/actions'
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { notFound } from 'next/navigation'

type Props = {
    params: Promise<{
        accountId: string,
    }>,
}

export default async function LedgerAccount({ params }: Props) {
    const accountId = Number((await params).accountId)

    if (!accountId) {
        notFound()
    }

    const ledgerAccount = unwrapActionReturn(await readLedgerAccountAction({ params: { ledgerAccountId: accountId } }))

    return <div className={styles.wrapper}>
        {ledgerAccount.type === 'GROUP' && (
            <PopUp
                popUpKey="editLedgerAccountDetails"
                showButtonClass={styles.editButton}
                showButtonContent={<FontAwesomeIcon icon={faPencil} />}
            >
                <EditLedgerAccountDetailsForm ledgerAccount={ledgerAccount} popUpKey="editLedgerAccountDetails" />
            </PopUp>
        )}
        <LedgerAccountOverview
            ledgerAccount={ledgerAccount}
            showDepositButton
            depositPaymentMethods={['MANUAL']}
            showPayoutButton
            showDeactivateButton
            showFees
        />
        {/* Add link to products overview */}
        <LedgerAccountTransactionSummary transactionsHref={`${accountId}/transactions`} />
        {ledgerAccount.type === 'GROUP' && (
            <LedgerAccountGroupsCard ledgerAccountId={ledgerAccount.id} groupIds={ledgerAccount.groupIds} />
        )}
    </div>
}
