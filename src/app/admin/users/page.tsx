import styles from './page.module.scss'
import LinkFeideAccountForm from './LinkFeideAccountForm'
import CreateUserForm from '@/components/User/CreateUserForm'

export default function Users() {
    return (
        <div className={styles.wrapper}>
            <CreateUserForm />
            <LinkFeideAccountForm />
        </div>
    )
}
