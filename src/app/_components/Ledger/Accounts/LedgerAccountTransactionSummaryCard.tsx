import styles from './LedgerAccountTransactionSummaryCard.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

type Props = {
    transactionsHref?: string,
}

export default function LedgerAccountTransactionSummary({ transactionsHref }: Props) {
    return <div className={styles.wrapper}>
        <h2>Transaksjoner</h2>
        {
            transactionsHref &&
            <Link href={transactionsHref} className={styles.iconLink}>
                Se alle transaksjoner <FontAwesomeIcon icon={faArrowRight} />
            </Link>
        }
    </div>
}
