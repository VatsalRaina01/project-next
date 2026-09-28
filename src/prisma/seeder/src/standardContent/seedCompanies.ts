import { companyOperations } from '@/services/career/companies/operations'
import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import { upsert } from '@/seeder/src/upsert'
import { getImageForCmsImageRelation } from '@/seeder/src/standardContent/seedImages'
import type { PrismaClient } from '@/prisma-generated-pn-client'
import type { ImagesAvailablieForCms } from '@/seeder/src/standardContent/seedImages'
import type { Data } from '@/services/serviceOperation'

type SeedCompanyConfig = Data<typeof companyOperations.create> & {
    logo: ImagesAvailablieForCms,
}

/**
 * Omegaweb-basic had no companies and no job ads, so DobbelOmega has nothing to bring
 * across for the career section. Companies were still only ever created by
 * seedDevCompanies, which does not run on a migrating import - leaving a production
 * import with an empty company register and no company to hang a job ad off.
 *
 * These are the sponsors the site already ships logos for. Extend the list as Bedkom
 * signs new ones; the job ads themselves are written in the new site rather than seeded.
 */
export const seedCompaniesConfig = [
    {
        name: 'Kongsberg Gruppen',
        description: 'Internasjonal teknologikonsern innen forsvar, maritime systemer og romfart.',
        logo: { dynamicImageSeededForCmsName: 'kongsberg' },
    },
    {
        name: 'Nordic Semiconductor',
        description: 'Trondheimsbasert produsent av trådløse kretsløsninger for IoT.',
        logo: { dynamicImageSeededForCmsName: 'nordic' },
    },
] as const satisfies SeedCompanyConfig[]

/**
 * Upserts the companies given by the config, keyed on the unique company name. An
 * existing company is left untouched - its description and logo may have been edited
 * through the admin pages since, and a seed run should not undo that.
 */
export const seedCompanies = defineSeedOperation(async (prisma: PrismaClient) => {
    await Promise.all(seedCompaniesConfig.map(company => upsertCompany(prisma, company)))
})

async function upsertCompany(prisma: PrismaClient, company: SeedCompanyConfig) {
    return upsert({
        checkExistance: () => prisma.company.findUnique({
            where: { name: company.name },
            select: { id: true },
        }),
        create: () => createCompany(prisma, company),
        update: () => Promise.resolve(),
    })
}

async function createCompany(prisma: PrismaClient, company: SeedCompanyConfig) {
    const createdCompany = await companyOperations.create({
        data: { name: company.name, description: company.description }
    })

    // companyOperations.create makes the logo CmsImage but has no way to point it at an
    // actual image, so the image is connected here.
    const logo = await getImageForCmsImageRelation(company.logo, prisma)
    await prisma.company.update({
        where: { id: createdCompany.id },
        data: {
            logo: {
                update: {
                    image: { connect: { id: logo.id } }
                }
            }
        }
    })

    return createdCompany
}
