import ComponentTest from './ComponentTest'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'

export default async function ComponentTestPage() {
    await authorizeAdminPage('component-test')
    return <ComponentTest />
}
