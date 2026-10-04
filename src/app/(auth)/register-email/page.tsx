import EmailRegistrationForm from './EmailregistrationForm'
import { Require } from '@/auth/authorizer/Require'
import { userOperations } from '@/services/users/operations'
import { authOperations } from '@/services/auth/operations'
import { serverPage } from '@/app/serverPage'
import { notFound, redirect } from 'next/navigation'
import type { PageOperationArgs } from '@/app/serverPage'

const { page, generateMetadata } = serverPage({
    operation: async ({ session }: PageOperationArgs) => {
        const authResult = Require.user().auth(session)
        if (!authResult.authorized) return notFound()

        const updatedUser = await userOperations.read({ params: { id: authResult.session.user.id } })

        if (updatedUser.acceptedTerms) {
            redirect('/users/me')
        }

        if (updatedUser.emailVerified) {
            redirect('/register')
        }

        const feideLoginMatch = await authOperations.readFeideLoginMatch({})
        return { updatedUser, feideLoginMatch }
    },
    render: ({ data: { updatedUser, feideLoginMatch } }) => (
        <EmailRegistrationForm user={updatedUser} feideLoginMatch={feideLoginMatch} />
    ),
})

export default page
export { generateMetadata }
