'use client'

import styles from './DesktopSideBar.module.scss'
import { adminNavItemHref } from './adminNavItemHref'
import SideBarNavItem from './SideBarNavItem'
import AdminNav from './AdminNav'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import type { NavLink } from './navDef'

export type PropTypes = {
    /** The nav items the session may open, as `visibleNavItems` leaves them. */
    navItems: NavLink[]
}

export default function DesktopSideBar({ navItems }: PropTypes) {
    const [expanded, setExpanded] = useState(false)

    // The admin item gets its own spot at the bottom rather than a place among the others.
    const showAdmin = navItems.some(item => item.href === adminNavItemHref)
    const sideBarItems = navItems.filter(item => item.href !== adminNavItemHref)
    return (
        <aside className={styles.DesktopSideBar} data-expanded={expanded}>
            <nav className={styles.navIcons} aria-label="Desktop navigation">
                {sideBarItems.map((item) => (
                    <SideBarNavItem key={item.name} item={item} expanded={expanded} />
                ))}
            </nav>
            <AdminNav showAdmin={showAdmin} expanded={expanded} />
            <button
                type="button"
                className={styles.expandToggle}
                onClick={() => setExpanded(prev => !prev)}
                aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
            >
                <FontAwesomeIcon icon={expanded ? faChevronLeft : faChevronRight} />
            </button>
        </aside>
    )
}
