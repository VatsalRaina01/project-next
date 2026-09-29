'use client'

import styles from './LedgerAccountGroupList.module.scss'
import { updateLedgerAccountAction } from '@/services/ledger/accounts/actions'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import type { ExpandedGroup } from '@/services/groups/types'

type Props = {
    ledgerAccountId: number,
    groupIds: number[],
    groups: ExpandedGroup[],
}

export default function LedgerAccountGroupList({ ledgerAccountId, groupIds, groups }: Props) {
    const router = useRouter()

    const removeGroup = async (groupId: number) => {
        await updateLedgerAccountAction({
            params: { ledgerAccountId },
        }, {
            data: { groupIds: groupIds.filter(id => id !== groupId) },
        })
        router.refresh()
    }

    return (
        <ul>
            {groups.length > 0 ? groups.map(group => (
                <li key={group.id} className={styles.groupElement}>
                    <span>{group.name}</span>
                    <button onClick={() => removeGroup(group.id)} className={styles.removeButton}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </li>
            )) : <li><em>Denne kontoen er ikke knyttet til noen grupper.</em></li>}
        </ul>
    )
}
