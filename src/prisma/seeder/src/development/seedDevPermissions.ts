import { checkForPermissionDuplicates, COMMITTEE_PERMISSIONS } from '@/seeder/src/permissions'
import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import { Permission } from '@/prisma-generated-pn-types'
import type { PrismaClient } from '@/prisma-generated-pn-client'
import type { OmegaMembershipLevel } from '@/prisma-generated-pn-types'

/**
 * Seeds the default permissions, the permissions of each omega membership group, every permission
 * for Harambe's committee and the standard committee permissions for every committee.
 *
 * Development only - in any other environment permissions are managed through the admin pages, and
 * a seed that re-grants them on every run would undo revocations made there. Additive, so re-seeding
 * also grants permissions added since the last run.
 */
export const seedDevPermissions = defineSeedOperation(async (prisma: PrismaClient) => {
    const defaultPermissions: Permission[] = [
        'MANUAL_GROUP_READ',
        'CLASS_READ',
        'OMEGA_ORDER_READ',
        'JOBAD_READ',
        'SCHOOLS_READ',
        'COURSES_READ',
        'CABIN_CALENDAR_READ',
        'CABIN_BOOKING_CABIN_CREATE',
        'LEDGER_USE',
    ]

    checkForPermissionDuplicates(defaultPermissions, 'default permissions')

    await prisma.defaultPermission.createMany({
        data: defaultPermissions.map(permission => ({ permission })),
        skipDuplicates: true,
    })

    const membershipPermissions: Record<OmegaMembershipLevel, Permission[]> = {
        SYSKEN: [
            'OMBUL_READ',
            'OMEGAQUOTES_READ',
            'OMEGAQUOTES_WRITE',
            'COMMITTEE_READ',
            'INTEREST_GROUP_READ',
            'STUDY_PROGRAMME_READ',
            'LOCKER_USE',
            'PURCHASE_CREATE',
            'USERS_READ',
            'CLASS_READ',
            'OMEGA_MEMBERSHIP_GROUP_READ',
            'JOBAD_READ',
            'SCHOOLS_READ',
            'COURSES_READ',
            'COMPANY_READ',
            'CABIN_BOOKING_CABIN_CREATE',
            'CABIN_BOOKING_BED_CREATE',
            'CABIN_CALENDAR_READ',
        ],
        SOELLE: [
            'OMBUL_READ',
            'OMEGAQUOTES_READ',
            'COMMITTEE_READ',
            'INTEREST_GROUP_READ',
            'STUDY_PROGRAMME_READ',
            'USERS_READ',
            'CLASS_READ',
            'OMEGA_MEMBERSHIP_GROUP_READ',
            'JOBAD_READ',
            'SCHOOLS_READ',
            'COURSES_READ',
            'COMPANY_READ',
            'CABIN_BOOKING_CABIN_CREATE',
            'CABIN_BOOKING_BED_CREATE',
            'CABIN_CALENDAR_READ',
        ],
        DEN_GEMENE_HOB: []
    }

    const omegaMembershipGroups = await prisma.omegaMembershipGroup.findMany()

    await prisma.groupPermission.createMany({
        data: omegaMembershipGroups.flatMap(group => {
            const permissions = membershipPermissions[group.omegaMembershipLevel]
            checkForPermissionDuplicates(permissions, `${group.omegaMembershipLevel} permissions`)
            return permissions.map(permission => ({ permission, groupId: group.groupId }))
        }),
        skipDuplicates: true,
    })

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
