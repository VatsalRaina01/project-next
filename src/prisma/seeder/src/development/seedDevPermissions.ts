import { COMMITTEE_PERMISSIONS } from '@/seeder/src/standardContent/seedPermissions'
import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import { Permission } from '@/prisma-generated-pn-types'
import type { PrismaClient } from '@/prisma-generated-pn-client'

/**
 * Gives Harambe's committee every permission, and every committee the standard committee
 * permissions. Additive, so re-seeding also grants permissions added since the last run.
 */
export const seedDevPermissions = defineSeedOperation(async (prisma: PrismaClient) => {
    const harcom = await prisma.committee.findUniqueOrThrow({
        where: { shortName: 'harcom' },
    })

    await prisma.groupPermission.createMany({
        data: Object.values(Permission).map(permission => ({
            permission,
            groupId: harcom.groupId,
        })),
        skipDuplicates: true,
    })

    const allCommittees = await prisma.committee.findMany()

    await prisma.groupPermission.createMany({
        data: allCommittees.flatMap(committee => COMMITTEE_PERMISSIONS.map(permission => ({
            permission,
            groupId: committee.groupId,
        }))),
        skipDuplicates: true,
    })
})
