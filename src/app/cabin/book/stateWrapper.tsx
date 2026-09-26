'use client'
import CabinCalendar from './CabinCalendar'
import CabinPriceCalculator from './CabinPriceCalculator'
import SelectBedProducts from './SelectBedProduct'
import RadioLarge from '@/components/UI/RadioLarge'
import TextInput from '@/components/UI/TextInput'
import NumberInput from '@/components/UI/NumberInput'
import Checkbox from '@/components/UI/Checkbox'
import CabinBookingPaymentModal from '@/components/Ledger/Modals/CabinBookingPaymentModal'
import { calculateCabinBookingPrice, calculateTotalCabinBookingPrice } from '@/services/cabin/booking/cabinPriceCalculator'
import { useSession } from '@/auth/session/useSession'
import { useMemo, useState } from 'react'
import type { CabinProductExtended } from '@/services/cabin/product/constants'
import type { BookingFiltered } from '@/services/cabin/booking/types'
import type { DateRange } from './CabinCalendar'
import type { BookingType, PricePeriod } from '@/prisma-generated-pn-types'

export default function StateWrapper({
    cabinAvailability,
    releaseUntil,
    cabinProducts,
    canBookCabin,
    canBookBed,
    pricePeriods,
    availableBalance,
    customerSessionClientSecret,
}: {
    cabinAvailability: BookingFiltered[],
    releaseUntil: Date,
    cabinProducts: CabinProductExtended[],
    canBookCabin: boolean,
    canBookBed: boolean,
    pricePeriods: PricePeriod[],
    availableBalance?: number,
    customerSessionClientSecret?: string,
}) {
    const cabinProduct = cabinProducts.find(product => product.type === 'CABIN')
    if (!cabinProduct) {
        throw new Error('No product with type CABIN.')
    }
    const bedProducts = cabinProducts.filter(product => product.type === 'BED')

    const [bookingType, setBookingType] = useState<BookingType>(canBookCabin ? 'CABIN' : 'BED')
    const [dateRange, setDateRange] = useState<DateRange>({})

    const [selectedProducts, setSelectedProducts] = useState<CabinProductExtended[]>(
        canBookCabin ? [cabinProduct] : bedProducts
    )
    const [bedAmounts, setBedAmounts] = useState<number[]>(Array(bedProducts.length).fill(0))

    const [numberOfMembers, setNumberOfMembers] = useState(0)
    const [numberOfNonMembers, setNumberOfNonMembers] = useState(0)

    // Only editable for guest bookings. Logged in users are pre-filled and locked below.
    const [tenantNotes, setTenantNotes] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [mobile, setMobile] = useState('')

    const session = useSession()

    const calendar = useMemo(() => (
        <CabinCalendar
            startDate={new Date()}
            bookingUntil={releaseUntil}
            defaultDateRange={dateRange}
            intervalChangeCallback={setDateRange}
            bookings={cabinAvailability}
        />
    ), [cabinAvailability, releaseUntil, dateRange])

    const productAmounts = useMemo(
        () => (bookingType === 'BED' ? bedAmounts : [1]),
        [bookingType, bedAmounts]
    )

    const priceCalculator = useMemo(() => (
        <CabinPriceCalculator
            pricePeriods={pricePeriods}
            products={selectedProducts}
            productAmounts={productAmounts}
            startDate={dateRange.start}
            endDate={dateRange.end}
            numberOfMembers={numberOfMembers}
            numberOfNonMembers={numberOfNonMembers}
        />
    ), [selectedProducts, productAmounts, dateRange, numberOfMembers, numberOfNonMembers, pricePeriods])

    let totalPrice = 0
    if (dateRange.start && dateRange.end) {
        totalPrice = calculateTotalCabinBookingPrice(calculateCabinBookingPrice({
            pricePeriods,
            products: selectedProducts,
            productAmounts,
            startDate: dateRange.start,
            endDate: dateRange.end,
            numberOfMembers,
            numberOfNonMembers,
        }))
    }

    if (!canBookCabin && !canBookBed) {
        return <>Du kan ikke booke hytta.</>
    }

    if (session.loading) {
        return <>Laster session...</>
    }

    const canChangeBookingType = canBookCabin && canBookBed

    const user = session.session.user

    // TODO: Thread tenantNotes, contact fields, dateRange, bookingType and products into
    // cabinBookingOperations.createPayment once implemented.
    const contactFirstname = user?.firstname ?? firstname
    const contactLastname = user?.lastname ?? lastname
    const contactEmail = user?.email ?? email
    const contactMobile = user?.mobile ?? mobile

    return <>
        {calendar}

        {canChangeBookingType &&
            <RadioLarge
                name="Select type"
                options={[
                    {
                        value: 'CABIN',
                        label: 'Hele hytta',
                    },
                    {
                        value: 'BED',
                        label: 'Enkelt seng'
                    }
                ]}
                value={bookingType}
                onChange={(newType) => {
                    setBookingType(newType)
                    if (newType === 'CABIN') {
                        setSelectedProducts([cabinProduct])
                    } else {
                        setSelectedProducts(bedProducts)
                    }
                }}
            />
        }

        {(bookingType === 'CABIN' && user) && <>
            <NumberInput
                name="numberOfMembers"
                label="Antall som er medlem i Omega"
                value={numberOfMembers}
                onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value >= 0) {
                        setNumberOfMembers(value)
                    }
                }}
            />
            <NumberInput
                name="numberOfNonMembers"
                label="Antall som ikke er medlem i Omega"
                value={numberOfNonMembers}
                onChange={(e) => {
                    const value = Number(e.target.value)
                    if (value >= 0) {
                        setNumberOfNonMembers(value)
                    }
                }}
            />
        </>}

        {bookingType === 'BED' && <>
            <SelectBedProducts
                amounts={bedAmounts}
                bedProducts={bedProducts}
                onChange={setBedAmounts}
            />
        </>}

        {priceCalculator}

        <CabinBookingPaymentModal
            funds={totalPrice}
            availablePaymentMethods={user ? ['STRIPE', 'MANUAL'] : ['STRIPE']}
            availableBalance={user ? availableBalance : undefined}
            customerSessionClientSecret={user ? customerSessionClientSecret : undefined}
        >
            <TextInput
                name="firstname"
                label="Fornavn"
                value={contactFirstname}
                onChange={e => setFirstname(e.target.value)}
                disabled={Boolean(user)}
                readOnly={Boolean(user)}
            />
            <TextInput
                name="lastname"
                label="Etternavn"
                value={contactLastname}
                onChange={e => setLastname(e.target.value)}
                disabled={Boolean(user)}
                readOnly={Boolean(user)}
            />
            <TextInput
                name="email"
                label="E-post"
                value={contactEmail}
                onChange={e => setEmail(e.target.value)}
                disabled={Boolean(user)}
                readOnly={Boolean(user)}
            />
            <TextInput
                name="mobile"
                label="Telefonnummer"
                value={contactMobile}
                onChange={e => setMobile(e.target.value)}
                disabled={Boolean(user)}
                readOnly={Boolean(user)}
            />

            <TextInput
                name="tenantNotes"
                label="Notater til utleier"
                value={tenantNotes}
                onChange={e => setTenantNotes(e.target.value)}
            />

            <Checkbox name="acceptedTerms" label="Jeg godtar vilkårene under" required />
        </CabinBookingPaymentModal>
    </>
}
