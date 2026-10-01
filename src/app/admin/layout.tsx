import styles from './layout.module.scss'
import SlideSidebar from './SlideSidebar'
import { visibleAdminNav } from '@/app/admin/adminNavDef'
import PageTitleSetter from '@/contexts/PageTitleSetter'
import { ServerSession } from '@/auth/session/ServerSession'
import React from 'react'

type PropTypes = {
    children: React.ReactNode
}

export default async function AdminLayout({ children }: PropTypes) {
    const session = await ServerSession.fromNextAuth()

    // Only what the sidebar renders crosses into it - the authorizers stay on the server.
    const navigation = visibleAdminNav(session).map(group => ({
        header: group.header,
        links: group.links.map(({ title, path }) => ({ title, path })),
    }))

    return (
        <div className={styles.wrapper}>
            <PageTitleSetter title={'Admin'} />
            <div className={styles.slideBar}>
                <SlideSidebar navigation={navigation} />
            </div>
            <div className={styles.content}>
                { children }
            </div>
        </div>
    )
}
