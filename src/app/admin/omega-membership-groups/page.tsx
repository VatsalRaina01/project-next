import styles from './page.module.scss'
import {
    readOmegaMembershipGroupsAction,
    readOmegaMembershipGroupsExpandedAction,
} from '@/services/groups/omegaMembershipGroups/actions'
import { readCurrentOmegaOrderAction } from '@/services/omegaOrder/actions'
import { OmegaMembershipLevelConfig } from '@/services/groups/constants'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import GroupTypeTable from '@/components/Group/GroupTypeTable'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'

export default async function AdminOmegaMembershipGroups() {
    await authorizeAdminPage('omega-membership-groups')

    const [membershipGroups, expandedGroups, currentOrder] = await Promise.all([
        readOmegaMembershipGroupsAction().then(unwrapActionReturn),
        readOmegaMembershipGroupsExpandedAction().then(unwrapActionReturn),
        readCurrentOmegaOrderAction().then(unwrapActionReturn),
    ])

    // Membership in these groups is only ever changed through the admission system, so every row
    // points there rather than at a page of its own.
    const rows = membershipGroups.flatMap(membershipGroup => {
        const expanded = expandedGroups.find(group => group.id === membershipGroup.groupId)
        return expanded ? [{
            key: membershipGroup.id,
            name: OmegaMembershipLevelConfig[membershipGroup.omegaMembershipLevel].name,
            order: expanded.order,
            members: expanded.members,
            href: '/admin/admission',
        }] : []
    })

    return (
        <PageWrapper title="Medlemsgrupper">
            <p className={styles.explanation}>
                Hvilken medlemsgruppe en bruker tilhører styres kun gjennom opptakssystemet. Gruppene
                følger ordenen til Omega automatisk, og kan verken opprettes eller slettes.
            </p>
            <GroupTypeTable rows={rows} currentOrder={currentOrder.order} nameHeading="Medlemsgruppe" />
        </PageWrapper>
    )
}
