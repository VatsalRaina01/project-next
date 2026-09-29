'use client'
import { generatePaging } from '@/contexts/paging/PagingGenerator'
import { readQuotesPageAction } from '@/services/omegaquotes/actions'
import type { BullshitCursor, BullshitFiltered } from '@/services/bullshit/types'

export type PageSizeBullshit = 20;

export const [BullshitPagingContext, BullshitPagingProvider] = generatePaging<
    BullshitFiltered,
    BullshitCursor,
    PageSizeBullshit
>({
    fetcher: async ({ paging }) => await readQuotesPageAction({ params: { paging } }),
    getCursor: ({ lastElement }) => ({ id: lastElement.id }),
})
