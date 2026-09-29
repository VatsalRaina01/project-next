import styles from './page.module.scss'
import UserDotsInEditMode from './UserDotsInEditMode'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { getProfileForUserPage } from '@/app/users/[username]/(user-pages)/getProfileForUserPage'
import { readDotsForUserAction } from '@/services/dots/actions'

type PropTypes = {
    params: Promise<{
        username: string
    }>
}

export default async function UserDotAdmin({ params }: PropTypes) {
    const { profile } = await getProfileForUserPage(await params, 'dots')
    const dots = unwrapActionReturn(
        await readDotsForUserAction({ params: { userId: profile.user.id } })
    )

    return (
        <div className={styles.wrapper}>
            <h2>Prikker</h2>
            <UserDotsInEditMode userId={profile.user.id} dots={dots} />
        </div>
    )
}
