import styles from './PageWrapper.module.scss'
import PageTitleSetter from '@/contexts/PageTitleSetter'
import React from 'react'

export default function PageWrapper({
    title,
    children,
    headerItem,
    fillHeight = false,
    hideTitle = false,
    transparent = false,
    className,
}: {
    children: React.ReactNode,
    title: string,
    headerItem?: React.ReactNode,
    fillHeight?: boolean,
    hideTitle?: boolean,
    /** For pages laid out as islands: drops the wrapper's surface-base panel so the page background shows through. */
    transparent?: boolean,
    /** Extra class for page-specific tweaks (e.g. rounding, spacing) without touching the shared default. */
    className?: string,
}) {
    const wrapperClass = [
        styles.wrapper,
        fillHeight && styles.fillHeight,
        transparent && styles.transparent,
        className,
    ].filter(Boolean).join(' ')

    return (
        <div className={wrapperClass}>
            <PageTitleSetter title={title} />
            {!hideTitle && (
                <div className={styles.inlineHeader}>
                    <div>
                        { headerItem }
                    </div>
                </div>
            )}

            <div className={styles.body}>
                { children }
            </div>
        </div>
    )
}
