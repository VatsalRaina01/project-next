import ConfirmLinkOwUserForm from './ConfirmLinkOwUserForm'
import LinkOwUserForm from './LinkOwUserForm'
import { QueryParams } from '@/lib/queryParams/queryParams'
import { ServerSession } from '@/auth/session/ServerSession'
import { RequireUser } from '@/auth/authorizer/RequireUser'
import { notFound } from 'next/navigation'
import type { SearchParamsServerSide } from '@/lib/queryParams/types'

type PropTypes = SearchParamsServerSide

export default async function LinkOwUser({ searchParams }: PropTypes) {
    const token = QueryParams.token.decode(await searchParams)

    // With a token the visitor came from the confirmation mail. The token alone authorizes
    // the linking, so no session is required - the mail may well be opened in another browser
    // than the one that logged in with Feide.
    if (token) {
        return <ConfirmLinkOwUserForm token={token} />
    }

    const { authorized } = RequireUser.staticFields({}).dynamicFields({}).auth(
        await ServerSession.fromNextAuth()
    )

    if (!authorized) notFound()

    return <LinkOwUserForm />
}
