import TransactionList from '@/components/Ledger/Transactions/LedgerTransactionList'
import { ledgerAccountOperations } from '@/services/ledger/accounts/operations'
import { RequireUser } from '@/auth/authorizer/RequireUser'
import { serverPage } from '@/app/serverPage'
import type { PageOperationArgs } from '@/app/serverPage'

const { page, generateMetadata } = serverPage({
    operation: async ({ session }: PageOperationArgs) => {
        const { user } = RequireUser.staticFields({}).dynamicFields({})
            .auth(session).requireAuthorized().session

        return ledgerAccountOperations.read({ params: { userId: user.id } })
    },
    render: ({ data: ledgerAccount }) => <TransactionList accountId={ledgerAccount.id} showFees/>,
})

export default page
export { generateMetadata }
