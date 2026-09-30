import { companyOperations } from '@/services/career/companies/operations'
import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import { upsert } from '@/seeder/src/upsert'
import type { PrismaClient } from '@/prisma-generated-pn-client'

const COMPANY_COUNT = 100

export const devCompanyName = (index: number) => `dev_companies_${index}`

export const seedDevCompanies = defineSeedOperation(async (prisma: PrismaClient) => {
    await Promise.all(Array.from({ length: COMPANY_COUNT }).map((_, index) => upsert({
        checkExistance: () => prisma.company.findUnique({
            where: { name: devCompanyName(index) },
            select: { id: true },
        }),
        create: () => companyOperations.create({
            data: {
                name: devCompanyName(index),
                description: `${devCompanyName(index)} description`,
            }
        }),
        update: () => Promise.resolve(),
    })))
})
