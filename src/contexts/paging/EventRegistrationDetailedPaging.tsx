'use client'
import { generatePaging } from './PagingGenerator'
import { readDetailedEventRegistrationsPageAction } from '@/services/events/registration/actions'
import type { PageSizeEventRegistration } from './EventRegistrationPaging'
import type {
    EventRegistrationCursor,
    EventRegistrationDetailedExpanded,
    EventRegistrationPageDetails
} from '@/services/events/registration/types'

export const [EventRegistrationDetailedPagingContext, EventRegistrationDetailedPagingProvider] = generatePaging<
    EventRegistrationDetailedExpanded,
    EventRegistrationCursor,
    PageSizeEventRegistration,
    EventRegistrationPageDetails
>({
    fetcher: async ({ paging }) => await readDetailedEventRegistrationsPageAction({ params: { paging } }),
    getCursor: ({ lastElement }) => ({ id: lastElement.id }),
})
