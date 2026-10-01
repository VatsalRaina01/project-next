'use server'
import PageStateWrapper from './PageStateWrapper'
import PageWrapper from '@/app/_components/PageWrapper/PageWrapper'
import { readPricePeriodsAction } from '@/services/cabin/pricePeriod/actions'
import { readReleasePeriodsAction } from '@/services/cabin/releasePeriod/actions'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'


export default async function CabinCalendarPage() {
    await authorizeAdminPage('cabin-periods')
    const releasePeriods = unwrapActionReturn(await readReleasePeriodsAction())
    const pricePeriods = unwrapActionReturn(await readPricePeriodsAction())

    return <PageWrapper
        title="Heutte perioder"
    >
        <PageStateWrapper
            releasePeriods={releasePeriods}
            pricePeriods={pricePeriods}
        />
    </PageWrapper>
}
