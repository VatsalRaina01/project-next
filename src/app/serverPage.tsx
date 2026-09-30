import '@pn-server-only'
import ServiceErrorView, { DEFAULT_ERROR_TITLE } from '@/components/ServiceErrorView/ServiceErrorView'
import PageTitleSetter from '@/contexts/PageTitleSetter'
import { Smorekopp } from '@/services/error'
import { withServiceContext } from '@/services/serviceOperation'
import { ServerSession } from '@/auth/session/ServerSession'
import { CURRENT_PATH_HEADER } from '@/proxy'
import { notFound, redirect, unstable_rethrow as unstableRethrow } from 'next/navigation'
import { headers } from 'next/headers'
import { cache } from 'react'
import type { ErrorCode } from '@/services/error'
import type { AuthStatus } from '@/auth/authorizer/AuthResult'
import type { Session } from '@/auth/session/Session'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export type SearchParams = { [key: string]: string | string[] | undefined }

export type ServerPageSession = Session<'HAS_USER'> | Session<'NO_USER'>

/**
 * The arguments a serverPage operation receives. Pages with route params annotate their
 * operation callback with this to declare the params' shape:
 * `operation: async ({ params }: PageOperationArgs<{ id: string }>) => ...`
 */
export type PageOperationArgs<Params extends object = object> = {
    params: Params,
    searchParams: SearchParams,
    session: ServerPageSession,
}

type PageProps<Params extends object> = {
    params: Promise<Params>,
    searchParams: Promise<SearchParams>,
}

/**
 * Rethrows everything that should not be handled by rendering an error view:
 * Next.js control-flow errors (redirect/notFound) and non-service errors (which belong
 * in the error boundary - they are bugs, not expected failures). Service errors get their
 * conventional treatment: NOT FOUND renders the not-found page and UNAUTHENTICATED sends
 * the user to login. Every other service error is returned for the caller to display.
 */
export async function handleServiceError(error: unknown): Promise<Smorekopp<ErrorCode | AuthStatus>> {
    unstableRethrow(error)
    if (!(error instanceof Smorekopp)) throw error
    if (error.errorCode === 'NOT FOUND') notFound()
    if (error.errorCode === 'UNAUTHENTICATED') redirect(await urlWithCallback('/login'))
    if (error.errorCode === 'UNAUTHORIZED') {
        // A user who has not accepted the terms yet is not turned away but sent to finish
        // registration - the same rule redirectOnUnauthorized enforced.
        const session = await ServerSession.fromNextAuth()
        if (session.user && !session.user.acceptedTerms) redirect(await urlWithCallback('/register'))
    }
    return error
}

/**
 * The given url with the current page as callbackUrl, so the user lands back where they
 * were once they are through it. The current path comes from the header stamped by the proxy
 * (src/proxy.ts) - a server component cannot read its own URL. Should the header be
 * missing, the plain url is used.
 */
async function urlWithCallback(url: string) {
    const currentPath = (await headers()).get(CURRENT_PATH_HEADER)
    return currentPath ? `${url}?callbackUrl=${encodeURIComponent(currentPath)}` : url
}

/**
 * Builds a page (and its generateMetadata) from a data-loading operation and a renderer,
 * replacing the old pattern of calling read *actions* at the top of pages and unwrapping
 * their ActionReturn into a thrown error. Pages built with this call service operations
 * directly - the operation callback runs inside a service context seeded with the session
 * of the request, so operations called within it pick the session up automatically.
 *
 * Errors from the operation are handled here, not by the Next.js error boundary:
 * a thrown service error renders `ServiceErrorView` in place of the page (except
 * NOT FOUND -> `notFound()` and UNAUTHENTICATED -> redirect to login). Non-service errors
 * still propagate to the error boundary, since they are bugs rather than expected failures.
 *
 * The title returned by `metadata` is also fed to the PageTitle context, so pages built
 * with this never render `PageTitleSetter` themselves.
 *
 * @param operation - Loads everything the page needs. Runs once per request (shared between
 * the page render and generateMetadata via React `cache`). Throwing a service error inside
 * it sends the user to the error view - wrap non-critical calls in {@link withFallback} when
 * a failure should not take the whole page down.
 * @param metadata - Optional Next.js metadata from the loaded data. Titles are plain -
 * the root layout's title template appends the site name.
 * @param errorTitle - Overrides the page title used both by `ServiceErrorView` and by
 * `generateMetadata` when the operation throws. Defaults to the generic error title.
 * @param errorMessage - Overrides the message `ServiceErrorView` shows when the operation
 * throws. Defaults to the thrown error's own message (or its error code's default message).
 * @param render - Renders the page from the loaded data and the session. Call authorizers
 * directly here (e.g. `someAuth.op.dynamicFields({...}).auth(session)`) for any auth-gated UI.
 *
 * @example
 * const { page, generateMetadata } = serverPage({
 *     operation: async ({ params }: { params: { username: string } }) =>
 *         userOperations.readProfile({ params: { username: params.username } }),
 *     metadata: (profile) => ({ title: profile.user.username }),
 *     render: ({ data, session }) => {
 *         const canUpdate = userAuth.update.dynamicFields({ username: data.user.username }).auth(session)
 *         return (
 *             <div>
 *                 {data.user.username}
 *                 {canUpdate.authorized && <EditButton />}
 *             </div>
 *         )
 *     },
 * })
 *
 * export default page
 * export { generateMetadata }
 */
export function serverPage<Params extends object, Data>({
    operation, metadata, errorTitle, errorMessage, render,
}: {
    operation: (args: PageOperationArgs<Params>) => Promise<Data>,
    metadata?: (data: Data) => Metadata,
    errorTitle?: string,
    errorMessage?: string,
    render: (args: {
        data: Data,
        session: ServerPageSession,
    }) => ReactNode | Promise<ReactNode>,
}): {
    page: (props: PageProps<Params>) => Promise<ReactNode>,
    generateMetadata: (props: PageProps<Params>) => Promise<Metadata>,
} {
    // The operation must run at most once per request even though both the page and
    // generateMetadata need its result. React `cache` memoizes per request, but only on
    // argument identity - and Next does not guarantee that the page and generateMetadata
    // receive identical params/searchParams promise instances. Serializing the resolved
    // (JSON-safe) values gives a stable key to memoize on.
    const serializeProps = async ({ params, searchParams }: PageProps<Params>) =>
        JSON.stringify({ params: await params, searchParams: await searchParams })

    const load = cache(async (serializedProps: string) => {
        const { params, searchParams } = JSON.parse(serializedProps) as {
            params: Params,
            searchParams: SearchParams,
        }
        const session = await ServerSession.fromNextAuth()
        const data = await withServiceContext(
            { session },
            { opensTransaction: false },
            () => operation({ params, searchParams, session })
        )
        return { data, session }
    })

    // Shared between page and generateMetadata: both need the same load-then-handle-error
    // sequence, differing only in what they render/return once loading has failed.
    const tryLoad = async (props: PageProps<Params>) => {
        try {
            return { ok: true as const, loaded: await load(await serializeProps(props)) }
        } catch (error) {
            return { ok: false as const, error }
        }
    }

    const page = async (props: PageProps<Params>): Promise<ReactNode> => {
        const attempt = await tryLoad(props)
        if (!attempt.ok) {
            return <ServiceErrorView
                error={await handleServiceError(attempt.error)}
                title={errorTitle}
                message={errorMessage}
            />
        }
        const pageTitle = metadata ? metadata(attempt.loaded.data).title : undefined
        return (
            <>
                {typeof pageTitle === 'string' && <PageTitleSetter title={pageTitle} />}
                {await render(attempt.loaded)}
            </>
        )
    }

    const generateMetadata = async (props: PageProps<Params>): Promise<Metadata> => {
        if (!metadata) return {}
        const attempt = await tryLoad(props)
        if (!attempt.ok) {
            await handleServiceError(attempt.error)
            return { title: errorTitle ?? DEFAULT_ERROR_TITLE }
        }
        return metadata(attempt.loaded.data)
    }

    return { page, generateMetadata }
}

/**
 * Marks a service operation call inside a serverPage operation as non-critical: if it fails
 * with a service error the given fallback value is returned instead of the failure taking
 * the whole page to the error view. Next.js control-flow errors and non-service errors
 * still propagate.
 *
 * @example
 * operation: async ({ params }) => ({
 *     user: await userOperations.read({ params }),
 *     flairs: await withFallback(flairOperations.readForUser({ params }), []),
 * })
 */
export async function withFallback<Data, Fallback>(
    operationPromise: Promise<Data>,
    fallbackValue: Fallback
): Promise<Data | Fallback> {
    try {
        return await operationPromise
    } catch (error) {
        unstableRethrow(error)
        if (error instanceof Smorekopp) return fallbackValue
        throw error
    }
}

/**
 * For server components that are not pages (layouts, cards rendered inside a page's tree):
 * loads the session of the request and runs the callback inside a service context seeded
 * with it, so service operations called within pick the session up automatically - the same
 * environment a serverPage operation runs in. Errors are not handled here; catch them with
 * {@link handleServiceError} and render `ServiceErrorView`, or let them hit the error boundary.
 */
export async function withPageSession<Result>(
    callback: (session: ServerPageSession) => Promise<Result>
): Promise<Result> {
    const session = await ServerSession.fromNextAuth()
    return withServiceContext({ session }, { opensTransaction: false }, () => callback(session))
}
