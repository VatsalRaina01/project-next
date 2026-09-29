import { eventOperations } from '@/services/events/operations'
import type { PrismaClient } from '@/prisma-generated-pn-client'

/**
 * Seeded content is administrated through the EVENT_ADMIN permission rather than by any group: a
 * requirement with no conditions can never be satisfied, so the admin level admits only those who
 * bypass it with that permission.
 */
const ADMINISTRATED_BY_PERMISSION_ONLY = [{ conditions: [] }]

export default async function seedDevEvents(prisma: PrismaClient) {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    const startDate = new Date()
    startDate.setDate(today.getDate() + 7)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 1)

    const bedPresTag = await prisma.eventTag.findUniqueOrThrow({
        where: {
            special: 'COMPANY_PRESENTATION'
        }
    })

    const coverImage = await prisma.image.findUniqueOrThrow({
        where: {
            standardImage: 'FAIR',
        }
    })

    const bedpres = await eventOperations.create({
        prisma,
        bypassAuth: true,
        data: {
            name: 'Bedpres med Kongsberg',
            location: 'EL5',
            eventStart: startDate,
            eventEnd: endDate,
            canBeViewdBy: 'ALL',
            takesRegistration: true,
            places: 15,
            registrationStart: today,
            registrationEnd: tomorrow,
            waitingList: true,
            tagIds: [
                bedPresTag.id,
            ],
            visibilityAdminRequirements: ADMINISTRATED_BY_PERMISSION_ONLY,
        }
    })

    const examReading = await eventOperations.create({
        prisma,
        bypassAuth: true,
        data: {
            name: 'Stresset eksamenslesing',
            location: 'Lesesal',
            eventStart: startDate,
            eventEnd: endDate,
            canBeViewdBy: 'ALL',
            takesRegistration: false,
            waitingList: false,
            registrationStart: today,
            registrationEnd: tomorrow,
            tagIds: [],
            visibilityAdminRequirements: ADMINISTRATED_BY_PERMISSION_ONLY,
        }
    })

    const ohmaBirthday = await eventOperations.create({
        prisma,
        bypassAuth: true,
        data: {
            name: 'Ohma sin bursdag',
            location: 'Ohma',
            eventStart: startDate,
            eventEnd: endDate,
            canBeViewdBy: 'ALL',
            takesRegistration: true,
            waitingList: true,
            places: 50,
            registrationStart: today,
            registrationEnd: tomorrow,
            tagIds: [],
            visibilityAdminRequirements: ADMINISTRATED_BY_PERMISSION_ONLY,
        }
    })

    // Events are created as drafts, and a draft is visible only to those who administrate it - so
    // the seeded ones are published to make them show up in the development environment.
    await Promise.all([bedpres, examReading, ohmaBirthday].map(event =>
        eventOperations.setPublished({
            prisma,
            bypassAuth: true,
            params: { id: event.id },
            data: { published: true },
        })
    ))

    await prisma.cmsImage.updateMany({
        where: {
            id: { in: [bedpres.coverImageId, examReading.coverImageId, ohmaBirthday.coverImageId] }
        },
        data: {
            imageId: coverImage.id
        }
    })

    const someUsers = await prisma.user.findMany({
        take: 10,
        select: {
            id: true
        }
    })

    await prisma.eventRegistration.createMany({
        data: someUsers.map(user => ({
            eventId: bedpres.id,
            userId: user.id
        }))
    })

    const aLotOfUsers = await prisma.user.findMany({
        take: 70,
        select: {
            id: true
        }
    })

    await prisma.eventRegistration.createMany({
        data: aLotOfUsers.map(user => ({
            eventId: ohmaBirthday.id,
            userId: user.id
        }))
    })
}
