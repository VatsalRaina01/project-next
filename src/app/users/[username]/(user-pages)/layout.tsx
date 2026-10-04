import styles from './layout.module.scss'
import PageTitleSetter from '@/contexts/PageTitleSetter'
import { userOperations } from '@/services/users/operations'
import { withFallback, withPageSession } from '@/app/serverPage'
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
    return withPageSession(async (session) => {
        const paramUsername = (await params).username
        const username = paramUsername === 'me' ? session.user?.username : paramUsername
        if (!username) return {}

        const profile = await withFallback(userOperations.readProfile({ params: { username } }), null)
        if (!profile) return {}
        return { title: userPagesTitle(profile.user, session) }
    })
}

export default async function UserAdmin({ children, params }: PropTypes & { children: ReactNode }) {
    const { username, user, session } = await withPageSession(async (pageSession) => {
        let usernameOfPage = (await params).username
        if (usernameOfPage === 'me') {
            if (!pageSession.user) return notFound()
            usernameOfPage = pageSession.user.username
        }

        // Guards the whole section: a username nobody may read gets no layout and no nav.
        const profile = await userOperations.readProfile({ params: { username: usernameOfPage } })
        return { username: usernameOfPage, user: profile.user, session: pageSession }
    })

    return (
        <PageWrapper fillHeight transparent hideTitle>
            <PageTitleSetter title={userPagesTitle(user, session)} />
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
