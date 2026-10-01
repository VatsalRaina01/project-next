import MailForm from './mailForm'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'

export default async function SendMail() {
    await authorizeAdminPage('send-mail')

    return (
        <PageWrapper title="Elektronisk postutsendelse">
            <MailForm />
        </PageWrapper>
    )
}
