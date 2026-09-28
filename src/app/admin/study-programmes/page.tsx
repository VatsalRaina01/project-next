'use server'

import UpdateStudyProgrammeForm from './updateStudyProgrammeForm'
import StudyProgrammeTableBody from './studyProgrammeTable'
import styles from './page.module.scss'
import { readStudyProgrammesAction } from '@/services/groups/studyProgrammes/actions'
import { AddHeaderItemPopUp } from '@/components/HeaderItems/HeaderItemPopUp'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { studyProgrammeAuth } from '@/services/groups/studyProgrammes/auth'
import { ServerSession } from '@/auth/session/ServerSession'


export default async function StudyProgrammes() {
    const session = await ServerSession.fromNextAuth()
    const showCreateButton = studyProgrammeAuth.create.dynamicFields({}).auth(session)
    // Read, not create. Redirecting on the create check made the conditional header item
    // and the canEdit column below unreachable: the only sessions that got this far were
    // the ones that would have been shown everything anyway.
    studyProgrammeAuth.read.dynamicFields({}).auth(session)
        .redirectOnUnauthorized({ returnUrl: '/admin/study-programmes' })
    const canEdit = studyProgrammeAuth.update.dynamicFields({}).auth(session)

    const studyprogrammes = unwrapActionReturn(await readStudyProgrammesAction())


    return <PageWrapper
        title="Studieprogrammer"
        headerItem={
            showCreateButton.authorized && (
                <AddHeaderItemPopUp popUpKey="create ombul">
                    <UpdateStudyProgrammeForm />
                </AddHeaderItemPopUp>
            )
        }
    >
        <table className={styles.table}>
            <thead>
                <tr>
                    {canEdit && <th>Rediger</th>}
                    <th>Navn</th>
                    <th>Kode</th>
                    <th>Institutt kode</th>
                    <th>Start år</th>
                    <th>Lengde på studiet</th>
                    <th>Del av Omega</th>
                </tr>
            </thead>
            <StudyProgrammeTableBody studyprogrammes={studyprogrammes} canEdit={canEdit.authorized} />
        </table>
    </PageWrapper>
}
