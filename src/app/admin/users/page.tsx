import styles from './page.module.scss'
import CreateUserForm from '@/components/User/CreateUserForm'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'

export default async function Users() {
    await authorizeAdminPage('users')
    return (
        <div className={styles.wrapper}>
            <CreateUserForm />
        </div>
    )
}
