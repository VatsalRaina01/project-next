import styles from './LedgerAccountGroupsCard.module.scss'
import LedgerAccountGroupList from './LedgerAccountGroupList'
import AddGroupToLedgerAccount from './AddGroupToLedgerAccount'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { readGroupsExpandedAction } from '@/services/groups/actions'

type Props = {
    ledgerAccountId: number,
    groupIds: number[],
}

export default async function LedgerAccountGroupsCard({ ledgerAccountId, groupIds }: Props) {
    const allGroups = unwrapActionReturn(await readGroupsExpandedAction())
    const currentGroups = allGroups.filter(group => groupIds.includes(group.id))
    const availableGroups = allGroups.filter(group => !groupIds.includes(group.id))

    return <div className={styles.wrapper}>
        <h2>Grupper</h2>
        <LedgerAccountGroupList ledgerAccountId={ledgerAccountId} groupIds={groupIds} groups={currentGroups} />
        <AddGroupToLedgerAccount ledgerAccountId={ledgerAccountId} groupIds={groupIds} availableGroups={availableGroups} />
    </div>
}
