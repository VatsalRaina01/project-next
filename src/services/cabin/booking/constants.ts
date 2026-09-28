import { createSelection } from '@/services/createSelection'
import { userFilterSelection } from '@/services/users/constants'
import type { Booking } from '@/prisma-generated-pn-types'

export const cabinBookingFieldsToExpose = ['start', 'end', 'type'] as const satisfies (keyof Booking)[]

export const cabinBookingFilerSelection = createSelection(cabinBookingFieldsToExpose)

export const cabinBookingIncluder = {
    user: {
        select: userFilterSelection,
    },
    BookingProduct: {
        include: {
            product: true,
        }
    },
    event: true,
    guestUser: true,
}

// How long a reserved booking blocks the calendar before payment must be started.
export const CABIN_RESERVATION_WINDOW_MS = 10 * 60 * 1000

