import type { Permission } from '@/prisma-generated-pn-types'

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
