import styles from './ServiceErrorView.module.scss'
import StandardImageServer from '@/components/Image/StandardImageServer'
import PageTitleSetter from '@/contexts/PageTitleSetter'
import { errorCodes } from '@/services/error'
import type { ErrorCode, Smorekopp } from '@/services/error'
import type { AuthStatus } from '@/auth/authorizer/AuthResult'

export const DEFAULT_ERROR_TITLE = 'Feil'

/**
 * Renders a service error in place of a page. Used by `serverPage` when the page's
 * operation throws a service error - unlike the error boundary in error.tsx, this is
 * rendered on the server and receives the actual error instance, so no information
 * has to be smuggled through an encoded native Error.
 *
 * `title` and `message` default to the generic error title and the error's own
 * message chain, but can be overridden per page for a more specific error view.
 */
export default function ServiceErrorView({ error, title = DEFAULT_ERROR_TITLE, message }: {
    error: Smorekopp<ErrorCode | AuthStatus>,
    title?: string,
    message?: string,
}) {
    const errorConfig = errorCodes.find((code) => code.name === error.errorCode)
    const resolvedMessage = message
        ?? error.errors.at(0)?.message
        ?? errorConfig?.defaultMessage
        ?? 'En ukjent feil har oppstått'

    return (
        <div className={styles.wrapper}>
            <PageTitleSetter title={title} />
            <div className={styles.info}>
                <div className={styles.imageContainer}>
                    <StandardImageServer
                        width={70}
                        standardImage="LOGO_SIMPLE"
                        tint="var(--text)"
                    />
                </div>
                <div>
                    <h3>{resolvedMessage}</h3>
                    <p className={styles.code}>{error.httpCode} - {error.errorCode}</p>
                </div>
            </div>
        </div>
    )
}
