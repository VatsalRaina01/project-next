import styles from './page.module.scss'
import { redirectToErrorPage, unwrapActionReturn } from '@/app/redirectToErrorPage'
import { readLedgerAccountAction } from '@/services/ledger/accounts/actions'
import TransactionList from '@/components/Ledger/Transactions/LedgerTransactionList'
import { ServerSession } from '@/auth/session/ServerSession'

export default async function Transactions() {
    const session = await ServerSession.fromNextAuth()

    if (!session.user) redirectToErrorPage('UNAUTHORIZED')

    const ledgerAccount = unwrapActionReturn(await readLedgerAccountAction({ params: { userId: session.user.id } }))

    return <div className={styles.wrapper}>
        <TransactionList accountId={ledgerAccount.id} />
    </div>
}
