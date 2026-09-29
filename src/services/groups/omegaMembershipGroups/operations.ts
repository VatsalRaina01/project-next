import '@pn-server-only'
import { omegaMembershipGroupAuth } from './auth'
import { omegaMembershipGroupSchemas } from './schemas'
import { implementGroupType, implementStraightAwayMigration } from '@/services/groups/implementGroupType'
import { OMEGA_MEMBERSHIP_LEVEL_RANKING } from '@/services/groups/constants'
import { omegaOrderOperations } from '@/services/omegaOrder/operations'
import { admissionOperations } from '@/services/admission/operations'
import { defineOperation } from '@/services/serviceOperation'
import { invalidateOneUserSessionData } from '@/services/auth/invalidateSession'
import logger from '@/lib/logger'
import { GroupType } from '@/prisma-generated-pn-types'
import type { OmegaMembershipLevel, Prisma } from '@/prisma-generated-pn-types'

function omegaMembershipGTEQ(lhs: OmegaMembershipLevel, rhs: OmegaMembershipLevel) {
    return OMEGA_MEMBERSHIP_LEVEL_RANKING.indexOf(lhs) >= OMEGA_MEMBERSHIP_LEVEL_RANKING.indexOf(rhs)
}

const commonGroupOperations = implementGroupType({
    type: GroupType.OMEGA_MEMBERSHIP_GROUP,
    auth: {
        readExpanded: omegaMembershipGroupAuth.readExpanded.dynamicFields({}),
        readMembers: () => omegaMembershipGroupAuth.readMembers.dynamicFields({}),
    },
})

const migration = implementStraightAwayMigration({
    type: GroupType.OMEGA_MEMBERSHIP_GROUP,
    auth: {
        migrateGroups: omegaMembershipGroupAuth.migrateGroups.dynamicFields({}),
    },
})

const readMany = defineOperation({
    authorizer: () => omegaMembershipGroupAuth.readMany.dynamicFields({}),
    operation: async ({ prisma }) => prisma.omegaMembershipGroup.findMany()
})

const read = defineOperation({
    paramsSchema: omegaMembershipGroupSchemas.read,
    authorizer: () => omegaMembershipGroupAuth.read.dynamicFields({}),
    operation: async ({ prisma, params }) => prisma.omegaMembershipGroup.findUniqueOrThrow({
        where: params,
    })
})

/**
 * The active omega memberships of a user, with the level each one is in. There should be exactly
 * one - `readUserLevel` is what decides what to do when there is not.
 */
async function readActiveOmegaMemberships(prisma: Prisma.TransactionClient, userId: number) {
    const memberships = await prisma.membership.findMany({
        where: {
            userId,
            active: true,
            group: { groupType: GroupType.OMEGA_MEMBERSHIP_GROUP },
        },
        select: {
            order: true,
            group: {
                select: {
                    omegaMembershipGroup: { select: { omegaMembershipLevel: true } },
                },
            },
        },
    })

    return memberships.flatMap(membership => {
        const level = membership.group.omegaMembershipGroup?.omegaMembershipLevel
        return level ? [{ level, order: membership.order }] : []
    })
}

/**
 * Moves the user into the omega membership group of the given level, dropping any other omega
 * membership. This is the only way an omega membership changes - the admission system drives it.
 */
const updateUserLevel = defineOperation({
    paramsSchema: omegaMembershipGroupSchemas.updateUserLevel,
    authorizer: () => omegaMembershipGroupAuth.updateUserLevel.dynamicFields({}),
    opensTransaction: true,
    operation: async ({ prisma, params }) => {
        const group = await read({
            params: { omegaMembershipLevel: params.omegaMembershipLevel },
            bypassAuth: true,
        })

        if (params.onlyUpgrade) {
            const current = await readActiveOmegaMemberships(prisma, params.userId)

            if (current.length === 1 && omegaMembershipGTEQ(current[0].level, params.omegaMembershipLevel)) {
                return
            }
        }

        const currentOmegaOrder = await omegaOrderOperations.readCurrent({ bypassAuth: true })

        await prisma.$transaction([
            prisma.membership.deleteMany({
                where: {
                    userId: params.userId,
                    group: {
                        groupType: GroupType.OMEGA_MEMBERSHIP_GROUP,
                    },
                }
            }),
            prisma.membership.create({
                data: {
                    active: true,
                    user: {
                        connect: { id: params.userId },
                    },
                    group: {
                        connect: { id: group.groupId },
                    },
                    admin: false,
                    omegaOrder: {
                        connect: { order: currentOmegaOrder.order },
                    },
                }
            })
        ])

        // The level decides which group permissions the user holds, and those sit in the JWT.
        await invalidateOneUserSessionData(params.userId)
    }
})

/**
 * The omega membership the user holds - which of the omega membership groups they are an active
 * member of, and the order that membership was granted in.
 *
 * Every user is given one when they are created, and `updateUserLevel` replaces the one they hold
 * rather than adding to it, so both holding none and holding several are broken states. Neither is
 * papered over at read time: the database is put right here, so that the next read - and everything
 * else that looks at the user's memberships - sees one answer rather than each caller inventing its
 * own tie-break.
 *
 * Which level to put the user at is the admission system's to say, since that is what the level
 * records: a user who has sat every trial has earned their place as a sysken, and anyone else is a
 * soelle. Den gemene hob is deliberately not a possible outcome - it is where users start out, so a
 * user whose membership has gone missing is assumed to have been somewhere in omega, not outside it.
 */
const readUserLevel = defineOperation({
    paramsSchema: omegaMembershipGroupSchemas.readUserLevel,
    authorizer: () => omegaMembershipGroupAuth.readUserLevel.dynamicFields({}),
    operation: async ({ prisma, params }): Promise<{ level: OmegaMembershipLevel, order: number }> => {
        const omegaMemberships = await readActiveOmegaMemberships(prisma, params.userId)

        if (omegaMemberships.length === 1) return omegaMemberships[0]

        const completedTrials = await admissionOperations.userCompletedTrials({
            params: { userId: params.userId },
            bypassAuth: true,
        })
        const level = completedTrials ? 'SYSKEN' : 'SOELLE'

        logger.warn('User holds a broken omega membership - rewriting it', {
            userId: params.userId,
            held: omegaMemberships.map(
                omegaMembership => `${omegaMembership.level} (${omegaMembership.order})`
            ),
            completedTrials,
            rewrittenTo: level,
        })

        await updateUserLevel({
            params: {
                userId: params.userId,
                omegaMembershipLevel: level,
                onlyUpgrade: false,
            },
            bypassAuth: true,
        })

        const { order } = await omegaOrderOperations.readCurrent({ bypassAuth: true })
        return { level, order }
    }
})

/**
 * Omega membership groups are neither created nor destroyed: there is one per `OmegaMembershipLevel`
 * and they always have to exist.
 */
export const omegaMembershipGroupOperations = {
    read,
    readMany,
    readUserLevel,
    updateUserLevel,
    readExpanded: commonGroupOperations.readExpanded,
    readMembers: commonGroupOperations.readMembers,
    migrateGroups: migration.migrateGroups,
} as const
