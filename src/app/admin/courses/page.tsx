import PageWrapper from '@/components/PageWrapper/PageWrapper'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'

export default async function CoursesAdmin() {
    await authorizeAdminPage('courses')
    return (
        <PageWrapper title="Emnekatalog">
            <h1>Emnene</h1>
        </PageWrapper>
    )
}
