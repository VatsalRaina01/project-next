import styles from './page.module.scss'
import {
    addInterestGroupMembersAction,
    migrateInterestGroupAction,
    removeInterestGroupMembersAction,
    setInterestGroupMemberAdminAction,
    setInterestGroupMemberTitleAction,
    pensionInterestGroupAction,
} from '@/services/groups/interestGroups/actions'
import { interestGroupOperations } from '@/services/groups/interestGroups/operations'
import { omegaOrderOperations } from '@/services/omegaOrder/operations'
import { interestGroupAuth } from '@/services/groups/interestGroups/auth'
import { serverPage } from '@/app/serverPage'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import MigrateGroup from '@/components/Group/MigrateGroup'
import ManageGroupMembers from '@/components/Group/ManageGroupMembers'
import PensionGroup from '@/components/Group/PensionGroup'
import { groupMembersByOrder } from '@/components/Group/groupMembersByOrder'
import UserCard from '@/components/User/UserCard'
import { notFound } from 'next/navigation'
import type { PageOperationArgs } from '@/app/serverPage'

const { page, generateMetadata } = serverPage({
    operation: async ({ params }: PageOperationArgs<{ id: string }>) => {
        const id = Number(params.id)
        if (!Number.isInteger(id)) notFound()

        const interestGroup = await interestGroupOperations.read({ params: { id } })
        const [members, expandedGroups, currentOrder] = await Promise.all([
            interestGroupOperations.readMembers({ params: { groupId: interestGroup.groupId } }),
            interestGroupOperations.readExpanded({}),
            omegaOrderOperations.readCurrent({}),
        ])

        const expanded = expandedGroups.find(group => group.id === interestGroup.groupId)

        return { interestGroup, members, expanded, currentOrder }
    },
    metadata: (data) => ({ title: data.interestGroup.name }),
    render: ({ data, session }) => {
        const { interestGroup, members, expanded, currentOrder } = data

        const canMigrate = interestGroupAuth.migrateGroup
            .dynamicFields({ groupId: interestGroup.groupId }).auth(session)
        const canAddMembers = interestGroupAuth.addMembers
            .dynamicFields({ groupId: interestGroup.groupId }).auth(session)
        const canSetMemberAdmin = interestGroupAuth.setMemberAdmin
            .dynamicFields({ groupId: interestGroup.groupId }).auth(session)
        const canSetMemberTitle = interestGroupAuth.setMemberTitle
            .dynamicFields({ groupId: interestGroup.groupId }).auth(session)
        const canPension = interestGroupAuth.pension.dynamicFields({}).auth(session)
        const canRemoveMembers = interestGroupAuth.removeMembers
            .dynamicFields({ groupId: interestGroup.groupId }).auth(session)

        const activeMembersOfGroupOrder = members.filter(
            member => member.active && member.order === expanded?.order
        )

        // Memberships are kept per order, so the list is grouped by the order they belong to - the
        // current order first, then the history below it.
        const membersByOrder = members.reduce((acc, member) => {
            acc[member.order] = [...(acc[member.order] ?? []), member]
            return acc
        }, {} as Record<number, typeof members>)

        const ordersDescending = Object.keys(membersByOrder)
            .map(order => parseInt(order, 10))
            .sort((orderOne, orderTwo) => orderTwo - orderOne)

        return (
            <PageWrapper>
                {canPension.authorized && expanded && (
                    <div className={styles.management}>
                        <h2>Pensjonering</h2>
                        <PensionGroup
                            groupId={interestGroup.groupId}
                            groupName={interestGroup.name}
                            pensioned={interestGroup.pensioned}
                            currentOmegaOrder={currentOrder.order}
                            pensionGroupAction={pensionInterestGroupAction}
                        />
                    </div>
                )}
                {!interestGroup.pensioned && expanded
                    && (canAddMembers.authorized || canRemoveMembers.authorized) && (
                    <div className={styles.management}>
                        <h2>Administrer medlemmer</h2>
                        <ManageGroupMembers
                            groupId={interestGroup.groupId}
                            groupOrder={expanded.order}
                            orders={groupMembersByOrder(members, expanded.order)}
                            addMembersAction={
                                canAddMembers.authorized ? addInterestGroupMembersAction : undefined
                            }
                            setMemberAdminAction={
                                canSetMemberAdmin.authorized
                                    ? setInterestGroupMemberAdminAction
                                    : undefined
                            }
                            setMemberTitleAction={
                                canSetMemberTitle.authorized
                                    ? setInterestGroupMemberTitleAction
                                    : undefined
                            }
                            removeMembersAction={
                                canRemoveMembers.authorized
                                    ? removeInterestGroupMembersAction
                                    : undefined
                            }
                        />
                    </div>
                )}
                {!interestGroup.pensioned && canMigrate.authorized && expanded && (
                    <div className={styles.migration}>
                        <h2>Migrering</h2>
                        <MigrateGroup
                            groupId={interestGroup.groupId}
                            groupOrder={expanded.order}
                            currentOmegaOrder={currentOrder.order}
                            candidates={activeMembersOfGroupOrder.map(member => ({
                                userId: member.userId,
                                name: `${member.user.firstname} ${member.user.lastname}`,
                                title: member.title,
                                admin: member.admin,
                            }))}
                            migrateGroupAction={migrateInterestGroupAction}
                        />
                    </div>
                )}

                <h2>Medlemmer</h2>
                {ordersDescending.length === 0 && <p className={styles.empty}>Ingen medlemmer</p>}
                {ordersDescending.map(order => (
                    <div key={order}>
                        <h3 className={styles.orderHeading}>{order}. Orden</h3>
                        <hr />
                        <div className={styles.memberList}>
                            {membersByOrder[order].map(member => (
                                <UserCard
                                    key={member.userId}
                                    user={member.user}
                                    subText={member.active ? member.title : `${member.title} (inaktiv)`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </PageWrapper>
        )
    },
})

export default page
export { generateMetadata }
