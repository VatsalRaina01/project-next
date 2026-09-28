import { UpdateCabinProductForm } from './UpdateCabinProductForm'
import { AddHeaderItemPopUp } from '@/app/_components/HeaderItems/HeaderItemPopUp'
import { readCabinProductsAction } from '@/services/cabin/actions'
import { cabinProductAuth } from '@/services/cabin/product/auth'
import PageWrapper from '@/app/_components/PageWrapper/PageWrapper'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { ServerSession } from '@/auth/session/ServerSession'
import SimpleTable from '@/app/_components/Table/SimpleTable'

export default async function CabinProducs() {
    const session = await ServerSession.fromNextAuth()

    // The page guard is the read the listing below actually makes, not the create the
    // header item makes: gating the whole page on CABIN_PRODUCTS_ADMIN turned away the
    // users the product list is for. Creating is gated on its own, further down.
    cabinProductAuth.read.dynamicFields({}).auth(session)
        .redirectOnUnauthorized({ returnUrl: '/admin/cabin-product' })
    const canCreate = cabinProductAuth.create.dynamicFields({}).auth(session).authorized

    const products = unwrapActionReturn(await readCabinProductsAction())

    return <PageWrapper
        title="Heutte produkter"

        headerItem={canCreate && <AddHeaderItemPopUp popUpKey="UpdateCabinProductForm">
            <UpdateCabinProductForm />
        </AddHeaderItemPopUp>}
    >

        <SimpleTable
            header={[
                'Produkt',
                'Type',
                'Antall'
            ]}
            body={products.map(product => [
                product.name,
                product.type,
                product.amount.toString()
            ])}
            links={products.map(product => `/admin/cabin-product/${product.id}`)}
        />
    </PageWrapper>
}

