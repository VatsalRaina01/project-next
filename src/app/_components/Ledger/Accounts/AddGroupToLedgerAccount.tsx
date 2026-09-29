'use client'

import styles from './AddGroupToLedgerAccount.module.scss'
import { SelectNumber } from '@/components/UI/Select'
import Button from '@/components/UI/Button'
import { updateLedgerAccountAction } from '@/services/ledger/accounts/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ExpandedGroup } from '@/services/groups/types'

type Props = {
    ledgerAccountId: number,
    groupIds: number[],
    availableGroups: ExpandedGroup[],
}

export default function AddGroupToLedgerAccount({ ledgerAccountId, groupIds, availableGroups }: Props) {
    const router = useRouter()
    const [selectedGroupId, setSelectedGroupId] = useState(availableGroups[0]?.id)

    if (availableGroups.length === 0) return null

    const addGroup = async () => {
        if (selectedGroupId === undefined) return

        await updateLedgerAccountAction({
            params: { ledgerAccountId },
        }, {
            data: { groupIds: [...groupIds, selectedGroupId] },
        })
        router.refresh()
    }

    return (
        <div className={styles.addGroup}>
            <SelectNumber
                name="groupId"
                label="Gruppe"
                options={availableGroups.map(group => ({ value: group.id, label: group.name }))}
                value={selectedGroupId}
                onChange={setSelectedGroupId}
            />
            <Button onClick={addGroup} color="secondary">Legg til</Button>
        </div>
    )
}
