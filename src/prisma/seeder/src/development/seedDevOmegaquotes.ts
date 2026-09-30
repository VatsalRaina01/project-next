import { defineSeedOperation } from '@/seeder/src/defineSeedOperation'
import type { PrismaClient } from '@/prisma-generated-pn-client'

const OMEGAQUOTE_COUNT = 40

export const seedDevOmegaquotes = defineSeedOperation(async (prisma: PrismaClient) => {
    const user = await prisma.user.findFirstOrThrow()

    const berries = ['blåbær', 'bringebær', 'bjørnebær', 'kake', 'multer', 'stikkelsbær', 'jordbær']
    const indexing = ['første', 'andre', 'tredje', 'fjerde', 'femte', 'sjette']

    const quotes = Array.from({ length: OMEGAQUOTE_COUNT }).map((_, index) => ({
        author: `Den ${index >= indexing.length ? `${index + 1}'ende` : indexing[index]} veveren på bærtur`,
        quote: `Finnes det ${berries[index % berries.length]} her?`,
    }))

    // OmegaQuote has no unique key, but every seeded quote has its own author, so that is what an
    // existing one is recognised by.
    const existingAuthors = new Set((await prisma.omegaQuote.findMany({
        where: { author: { in: quotes.map(quote => quote.author) } },
        select: { author: true },
    })).map(quote => quote.author))

    // createMany keeps the insertion order, so the quotes are still listed in the order above.
    await prisma.omegaQuote.createMany({
        data: quotes
            .filter(quote => !existingAuthors.has(quote.author))
            .map(quote => ({ ...quote, userPosterId: user.id })),
    })
})
