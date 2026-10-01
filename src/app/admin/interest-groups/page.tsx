import { readInterestGroupsAction, readInterestGroupsExpandedAction } from '@/services/groups/interestGroups/actions'
import { readCurrentOmegaOrderAction } from '@/services/omegaOrder/actions'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import GroupTypeTable from '@/components/Group/GroupTypeTable'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'

export default async function AdminInterestGroups() {
    await authorizeAdminPage('interest-groups')

    const [interestGroups, expandedGroups, currentOrder] = await Promise.all([
        readInterestGroupsAction().then(unwrapActionReturn),
        readInterestGroupsExpandedAction().then(unwrapActionReturn),
        readCurrentOmegaOrderAction().then(unwrapActionReturn),
    ])

    const rows = interestGroups.flatMap(interestGroup => {
        const expanded = expandedGroups.find(group => group.id === interestGroup.groupId)
        return expanded ? [{
            key: interestGroup.id,
            name: interestGroup.name,
            order: expanded.order,
            members: expanded.members,
            pensioned: interestGroup.pensioned,
            href: `/interest-groups/${interestGroup.id}`,
        }] : []
    })

    return (
        <PageWrapper title="Interessegrupper">
            <GroupTypeTable rows={rows} currentOrder={currentOrder.order} emptyText="Ingen interessegrupper" />
        </PageWrapper>
    )
}
