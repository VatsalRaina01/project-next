import BullshitList from './BullshitList'
import Bullshit from './Bullshit'
import BullshitForm from './CreateBullshitForm'
import { BullshitPagingProvider } from '@/contexts/paging/BullshitPaging'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import { readBullshitPageAction } from '@/services/bullshit/actions'
import { ServerSession } from '@/auth/session/ServerSession'
import { bullshitAuth } from '@/services/bullshit/auth'
import { notFound } from 'next/navigation'
import { v4 as uuid } from 'uuid'
import type { PageSizeBullshit } from '@/contexts/paging/BullshitPaging'
export default async function BullshitPage() {
    const session = await ServerSession.fromNextAuth()
    const showCreateButton = session.user && bullshitAuth.create.auth(session).authorized || false

    const showBullshit = session.user && bullshitAuth.readPage.auth(session).authorized || false

    const pageSize: PageSizeBullshit = 20

    if (showBullshit) {
        const readBullshit = await readBullshitPageAction({
            params: {
                paging: {
                    page: {
                        pageSize,
                        page: 0,
                        cursor: null,
                    },
                    details: undefined
                }
            }
        })
        if (!readBullshit.success) notFound()
        const bullshits = readBullshit.data
        return (
            <PageWrapper title="Bullshit" headerItem={
                showCreateButton && <BullshitForm />
            }>
                <BullshitPagingProvider
                    // router.refresh() after a submit hands down a new first page, but the provider
                    // seeds its paging state from serverRenderedData only on mount. Keying on the
                    // first page remounts it, so a new quote cannot push one out of sight.
                    key={bullshits.map(bullshit => bullshit.id).join(',')}
                    startPage={{
                        pageSize,
                        page: 1,
                    }}
                    details={undefined}
                    serverRenderedData={bullshits}
                >
                    <main>
                        <BullshitList
                            serverRendered={bullshits.map(bullshit => <Bullshit key={uuid()} quote={bullshit} />)}
                        />
                    </main>
                </BullshitPagingProvider>
            </PageWrapper>
        )
    }
    return (
        <PageWrapper title="Bullshit" headerItem={
            showCreateButton && <BullshitForm />
        }>
            <></>
        </PageWrapper>
    )
}
