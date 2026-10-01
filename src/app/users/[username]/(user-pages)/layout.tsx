import styles from './layout.module.scss'
import { readUserProfileAction } from '@/services/users/actions'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { ServerSession } from '@/auth/session/ServerSession'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import UserNavBar from '@/app/users/[username]/UserNavBar'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import type { PropTypes } from '@/app/users/[username]/page'
import type { Metadata } from 'next'
import type { SessionMaybeUser } from '@/auth/session/Session'

/**
 * "Min Side | Navn" on your own pages, "Navns sider" on someone else's - a name already ending in
 * an s-sound takes only the apostrophe, as Norwegian spells the genitive.
 */
function userPagesTitle(
    user: { firstname: string, lastname: string, username: string },
    session: SessionMaybeUser,
) {
    const name = `${user.firstname} ${user.lastname}`
    if (session.user?.username === user.username) return `Min Side | ${name}`
    return /[sxz]$/i.test(name) ? `${name}' sider` : `${name}s sider`
}

export async function generateMetadata({ params }: PropTypes): Promise<Metadata> {
    const session = await ServerSession.fromNextAuth()
    const paramUsername = (await params).username
    const username = paramUsername === 'me' ? session.user?.username : paramUsername
    if (!username) return {}

    const profileRes = await readUserProfileAction({ params: { username } })
    if (!profileRes.success) return {}
    return { title: userPagesTitle(profileRes.data.user, session) }
}

export default async function UserAdmin({ children, params }: PropTypes & { children: ReactNode }) {
    const session = await ServerSession.fromNextAuth()
    let username = (await params).username
    if (username === 'me') {
        if (!session.user) return notFound()
        username = session.user.username
    }

    // Guards the whole section: a username nobody may read gets no layout and no nav.
    const { user } = unwrapActionReturn(await readUserProfileAction({ params: { username } }))

    return (
        <PageWrapper title={userPagesTitle(user, session)} fillHeight transparent hideTitle>
            <div className={styles.userAdminLayout}>
                <main className={styles.main}>
                    <div className={styles.mainInner}>
                        {children}
                    </div>
                </main>
                <UserNavBar username={username} userId={user.id} />
            </div>
        </PageWrapper>
    )
}
