import styles from './page.module.scss'
import { getProfileForAdmin } from '@/app/users/[username]/(user-admin)/getProfileForAdmin'
import type { PropTypes } from '@/app/users/[username]/page'

export default async function MembershipStatus({ params }: PropTypes) {
    await getProfileForAdmin(await params, 'membership-status')

    return (
        <div className={styles.wrapper}>
            <h2>Medlemsstatus</h2>
        </div>
    )
}
