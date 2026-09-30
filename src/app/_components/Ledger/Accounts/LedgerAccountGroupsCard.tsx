import styles from './LedgerAccountGroupsCard.module.scss'
import LedgerAccountGroupList from './LedgerAccountGroupList'
import AddGroupToLedgerAccount from './AddGroupToLedgerAccount'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { readExpandedGroupsOfAllTypesAction } from '@/services/groups/actions'
import { flattenExpandedGroups } from '@/services/groups/flattenExpandedGroups'

type Props = {
    ledgerAccountId: number,
    groupIds: number[],
}

export default async function LedgerAccountGroupsCard({ ledgerAccountId, groupIds }: Props) {
    const allGroups = flattenExpandedGroups(unwrapActionReturn(await readExpandedGroupsOfAllTypesAction()))
    const currentGroups = allGroups.filter(group => groupIds.includes(group.id))
    const availableGroups = allGroups.filter(group => !groupIds.includes(group.id))

    return <div className={styles.wrapper}>
        <h2>Grupper</h2>
        <LedgerAccountGroupList ledgerAccountId={ledgerAccountId} groups={currentGroups} />
        <AddGroupToLedgerAccount ledgerAccountId={ledgerAccountId} availableGroups={availableGroups} />
    </div>
}
