'use client'
import { generatePaging } from './PagingGenerator'
import { readEventRegistrationsPageAction } from '@/services/events/registration/actions'
import type {
    EventRegistrationCursor,
    EventRegistrationExpanded,
    EventRegistrationPageDetails
} from '@/services/events/registration/types'

export type PageSizeEventRegistration = 50

export const [EventRegistrationPagingContext, EventRegistrationPagingProvider] = generatePaging<
    EventRegistrationExpanded,
    EventRegistrationCursor,
    PageSizeEventRegistration,
    EventRegistrationPageDetails
>({
    fetcher: async ({ paging }) => await readEventRegistrationsPageAction({ params: { paging } }),
    getCursor: ({ lastElement }) => ({ id: lastElement.id }),
})
