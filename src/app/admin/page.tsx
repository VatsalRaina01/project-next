import styles from './page.module.scss'
import { authorizeAdminPage } from '@/app/admin/authorizeAdminPage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons'

export default async function Admin() {
    await authorizeAdminPage(null)
    return (
        <div className={styles.wrapper}>
            <FontAwesomeIcon icon={faScrewdriverWrench} className={styles.icon} />
            <p>Velg en ting å administrere i menyen</p>
        </div>
    )
}
