import { apiHandler } from '@/api/apiHandler'
import { productOperations } from '@/services/shop/product/operations'

export const GET = apiHandler({
    serviceOperation: productOperations.readByBarCode,
    query: searchParams => ({
        barcode: searchParams.get('barcode') ?? undefined,
        shopId: Number(searchParams.get('shopId') ?? undefined),
    }),
})
