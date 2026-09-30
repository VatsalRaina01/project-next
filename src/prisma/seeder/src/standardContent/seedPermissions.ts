import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import type { PrismaClient } from '@/prisma-generated-pn-client'
import type { OmegaMembershipLevel, Permission } from '@/prisma-generated-pn-types'

export function checkForPermissionDuplicates(arr: Permission[], failMessage: string) {
    const permissionSet = new Set(arr)
    if (permissionSet.size !== arr.length) {
        const duplicates = arr.filter((perm, index) => arr.indexOf(perm) !== index)
        throw new Error(
            `A duplicate permission is trying to be added to ${failMessage}, duplicates: ${duplicates.join(', ')}`
        )
    }
}

export const COMMITTEE_PERMISSIONS: Permission[] = [
    'IMAGE_COLLECTION_CREATE',
    'EVENT_CREATE',
    'NOTIFICATION_CREATE',
    'MAILADDRESS_EXTERNAL_READ',
    'MAILALIAS_READ',
    'MAILINGLIST_READ',
    'MAILINGLIST_ADMIN',

]

/**
 * Upserts the default permissions and the permissions of each omega membership group. This is
 * additive: a permission added to the lists below is granted on the next run, and one that
 * already exists is never removed. Note the flip side - a listed permission revoked through the
 * admin pages is granted again on the next run, so revoke it here instead.
 */
export const seedPermissions = defineSeedOperation(async (prisma: PrismaClient) => {
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
        data: defaultPermissions.map(perm => ({
            permission: perm
        })),
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

    checkForPermissionDuplicates(membershipPermissions.SYSKEN, 'SYSKEN permissions')
    checkForPermissionDuplicates(membershipPermissions.SOELLE, 'SOELLE permissions')
    checkForPermissionDuplicates(membershipPermissions.DEN_GEMENE_HOB, 'DEN_GEMENE_HOB permissions')

    await Promise.all(Object.entries(membershipPermissions).map(async ([level, permissions]) => {
        const membershipType = await prisma.omegaMembershipGroup.findUniqueOrThrow({
            where: {
                omegaMembershipLevel: level as OmegaMembershipLevel,
            },
        })

        await prisma.groupPermission.createMany({
            data: permissions.map(perm => ({
                permission: perm,
                groupId: membershipType.groupId
            })),
            skipDuplicates: true,
        })
    }))
})
