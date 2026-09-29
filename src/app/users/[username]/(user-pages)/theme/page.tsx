import ThemeForm from '@/app/users/[username]/(user-pages)/theme/ThemeForm'
import { getProfileForUserPage } from '@/app/users/[username]/(user-pages)/getProfileForUserPage'
import type { PropTypes } from '@/app/users/[username]/page'

export default async function UserTheme({ params }: PropTypes) {
    // The theme is the viewer's own and lives in their browser, so the page is only for the user
    // themselves - which is what its nav item says, and what this holds the page to.
    await getProfileForUserPage(await params, 'theme')

    return (
        <ThemeForm></ThemeForm>
    )
}
