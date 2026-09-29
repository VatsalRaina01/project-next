import styles from './BullshitQuote.module.scss'
import Date from '@/components/Date/Date'
import type { BullshitFiltered } from '@/services/bullshit/types'

export type BullshitPropTypes = {
    quote: BullshitFiltered
}

export default function BullshitBullshit({ quote }: BullshitPropTypes) {
    return <div className={styles.Bullshit}>
        <div className={styles.BullshitBubble}>
            <p>&quot;{quote.quote}&quot;</p>
        </div>
        <span className={styles.triangle}>▼</span>

        <span className={styles.timestamp}>
            <Date date={quote.timestamp} includeTime={false} />
        </span>
    </div>
}
