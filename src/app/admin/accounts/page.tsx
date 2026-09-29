import LedgerAccountList from '@/components/Ledger/Accounts/LedgerAccountList'
import CreateGroupLedgerAccountForm from '@/components/Ledger/Accounts/CreateGroupLedgerAccountForm'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import { AddHeaderItemPopUp } from '@/components/HeaderItems/HeaderItemPopUp'

const popUpKey = 'createGroupLedgerAccount'

export default async function LedgerAccounts() {
    return (
        <PageWrapper title="Gruppekontoer" headerItem={
            <AddHeaderItemPopUp popUpKey={popUpKey}>
                <CreateGroupLedgerAccountForm popUpKey={popUpKey} />
            </AddHeaderItemPopUp>
        }>
            <LedgerAccountList />
        </PageWrapper>
    )
}
