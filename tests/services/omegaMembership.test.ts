import { admissionOperations } from '@/services/admission/operations'
import { omegaMembershipGroupOperations } from '@/services/groups/omegaMembershipGroups/operations'
import { userOperations } from '@/services/users/operations'
import { prisma } from '@/prisma-pn-client-instance'
import { describe, expect, test } from '@jest/globals'

async function createTestUser(username: string) {
    return userOperations.create({
        data: {
            email: `${username}@omega.ntnu.no`,
            firstname: 'Test',
            lastname: 'Testesen',
            username,
            emailVerified: new Date().toISOString(),
        },
        bypassAuth: true,
    })
}

const readOmegaMemberships = (userId: number) => prisma.membership.findMany({
    where: {
        userId,
        active: true,
        group: { groupType: 'OMEGA_MEMBERSHIP_GROUP' },
    },
    select: {
        order: true,
        group: { select: { omegaMembershipGroup: { select: { omegaMembershipLevel: true } } } },
    },
})

const dropOmegaMemberships = (userId: number) => prisma.membership.deleteMany({
    where: { userId, group: { groupType: 'OMEGA_MEMBERSHIP_GROUP' } },
})

describe('readUserLevel', () => {
    // The omega membership service asks the admission service which level a broken membership
    // should be rewritten to, and the admission service asks it back to promote a user who has
    // just sat their last trial. Both directions are only used from inside an operation, so the
    // import cycle resolves - this fails at module load if that ever stops being true.
    test('the admission and omega membership services can both be imported', () => {
        expect(typeof admissionOperations.userCompletedTrials).toBe('function')
        expect(typeof omegaMembershipGroupOperations.readUserLevel).toBe('function')
    })

    test('leaves a user holding exactly one membership alone', async () => {
        const user = await createTestUser('omegamembershipone')
        const before = await readOmegaMemberships(user.id)
        expect(before).toHaveLength(1)

        const resolved = await omegaMembershipGroupOperations.readUserLevel({
            params: { userId: user.id },
            bypassAuth: true,
        })

        expect(resolved.level).toBe('DEN_GEMENE_HOB')
        expect(resolved.order).toBe(before[0].order)
    })

    test('a user holding no membership is written back as a soelle', async () => {
        const user = await createTestUser('omegamembershiptwo')
        await dropOmegaMemberships(user.id)

        const resolved = await omegaMembershipGroupOperations.readUserLevel({
            params: { userId: user.id },
            bypassAuth: true,
        })

        expect(resolved.level).toBe('SOELLE')
        const after = await readOmegaMemberships(user.id)
        expect(after).toHaveLength(1)
        expect(after[0].group.omegaMembershipGroup?.omegaMembershipLevel).toBe('SOELLE')
    })

    test('a user who has sat every trial is written back as a sysken', async () => {
        const user = await createTestUser('omegamembershipthree')
        await prisma.admissionTrial.createMany({
            data: [
                { userId: user.id, admission: 'PLIKTTIAENESTE' },
                { userId: user.id, admission: 'PROEVELSEN' },
            ],
        })
        await dropOmegaMemberships(user.id)

        const resolved = await omegaMembershipGroupOperations.readUserLevel({
            params: { userId: user.id },
            bypassAuth: true,
        })

        expect(resolved.level).toBe('SYSKEN')
        const after = await readOmegaMemberships(user.id)
        expect(after).toHaveLength(1)
        expect(after[0].group.omegaMembershipGroup?.omegaMembershipLevel).toBe('SYSKEN')
    })

    test('a user holding several memberships is collapsed down to one', async () => {
        const user = await createTestUser('omegamembershipfour')
        const omegaMembershipGroups = await prisma.omegaMembershipGroup.findMany()
        const { order } = await prisma.omegaOrder.findFirstOrThrow({ orderBy: { order: 'desc' } })

        await dropOmegaMemberships(user.id)
        await prisma.membership.createMany({
            data: omegaMembershipGroups.map(group => ({
                userId: user.id,
                groupId: group.groupId,
                order,
                admin: false,
                active: true,
            })),
        })
        expect(await readOmegaMemberships(user.id)).toHaveLength(omegaMembershipGroups.length)

        const resolved = await omegaMembershipGroupOperations.readUserLevel({
            params: { userId: user.id },
            bypassAuth: true,
        })

        expect(resolved.level).toBe('SOELLE')
        expect(await readOmegaMemberships(user.id)).toHaveLength(1)
    })
})

describe('userCompletedTrials', () => {
    test('is false until every admission has been sat', async () => {
        const user = await createTestUser('omegamembershipfive')
        const completed = () => admissionOperations.userCompletedTrials({
            params: { userId: user.id },
            bypassAuth: true,
        })

        expect(await completed()).toBe(false)

        await prisma.admissionTrial.create({ data: { userId: user.id, admission: 'PLIKTTIAENESTE' } })
        expect(await completed()).toBe(false)

        await prisma.admissionTrial.create({ data: { userId: user.id, admission: 'PROEVELSEN' } })
        expect(await completed()).toBe(true)
    })
})
