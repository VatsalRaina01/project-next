import '@pn-server-only'
import { apiHandler } from '@/api/apiHandler'
import { userOperations } from '@/services/users/operations'

export const GET = apiHandler({
    serviceOperation: userOperations.readUserWithBalance,
    query: searchParams => ({
        studentCard: searchParams.get('studentCard') ?? undefined,
    }),
})

export const POST = apiHandler({
    serviceOperation: userOperations.create
})
