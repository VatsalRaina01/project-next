import seedDevGroups from '@/prisma/seeder/src/development/seedDevGroups'
import { seedDevImages } from '@/prisma/seeder/src/development/seedDevImages'
import { seedDevUsers } from '@/prisma/seeder/src/development/seedDevUsers'
import { prisma } from '@/prisma-pn-client-instance'
import { withServiceContext } from '@/services/serviceOperation'
import { Session } from '@/auth/session/Session'
import { Admission } from '@/prisma-generated-pn-types'
import { beforeAll, describe, expect, test } from '@jest/globals'

const inServiceContext = (work: () => Promise<void>) => withServiceContext(
    { bypassAuth: true, session: Session.empty() },
    { opensTransaction: true },
    work,
)

describe('seedDevUsers leaves every user in a valid state', () => {
    beforeAll(async () => {
        // seedDevGroups is not idempotent yet, so it only runs once; seedDevUsers is what is
        // under test here and runs twice, since a re-seed must not leave anyone with two
        // memberships or with trials from a level they no longer sit at.
        await inServiceContext(async () => {
            await seedDevImages()
            await seedDevGroups(prisma)
        })
        await inServiceContext(async () => { await seedDevUsers() })
        await inServiceContext(async () => { await seedDevUsers() })
    }, 240 * 1000)

    test('every user holds exactly one omega membership', async () => {
        const users = await prisma.user.findMany({
            select: {
                username: true,
                memberships: {
                    where: { active: true, group: { groupType: 'OMEGA_MEMBERSHIP_GROUP' } },
                    select: { groupId: true },
                },
            },
        })

        expect(users.length).toBeGreaterThan(0)
        const wrong = users.filter(user => user.memberships.length !== 1)
        expect(wrong.map(user => `${user.username}: ${user.memberships.length}`)).toEqual([])
    })

    test('sysken if and only if every trial is sat', async () => {
        const users = await prisma.user.findMany({
            select: {
                username: true,
                admissionTrials: { select: { admission: true } },
                memberships: {
                    where: { active: true, group: { groupType: 'OMEGA_MEMBERSHIP_GROUP' } },
                    select: { group: { select: { omegaMembershipGroup: { select: { omegaMembershipLevel: true } } } } },
                },
            },
        })

        const broken = users.filter(user => {
            const level = user.memberships[0]?.group.omegaMembershipGroup?.omegaMembershipLevel
            const satAll = user.admissionTrials.length === Object.keys(Admission).length
            return (level === 'SYSKEN') !== satAll
        })

        expect(broken.map(user => user.username)).toEqual([])
    })

    test('den gemene hob has sat nothing, and the levels are actually spread', async () => {
        const groups = await prisma.omegaMembershipGroup.findMany({
            select: {
                omegaMembershipLevel: true,
                group: {
                    select: {
                        memberships: {
                            where: { active: true },
                            select: { user: { select: { admissionTrials: { select: { admission: true } } } } },
                        },
                    },
                },
            },
        })

        const byLevel = new Map(groups.map(group => [group.omegaMembershipLevel, group.group.memberships]))

        // Every level is actually represented, so the seed is worth having.
        groups.forEach(group => expect(byLevel.get(group.omegaMembershipLevel)!.length).toBeGreaterThan(0))

        const hobTrials = byLevel.get('DEN_GEMENE_HOB')!
            .flatMap(membership => membership.user.admissionTrials)
        expect(hobTrials).toEqual([])
    })
})

