import styles from './page.module.scss'
import { readSocialsAction } from '@/services/socials/actions'
import { authorizeSocialOwner, socialAuth } from '@/services/socials/auth'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { ServerSession } from '@/auth/session/ServerSession'
import PageWrapper from '@/components/PageWrapper/PageWrapper'
import SocialsEditor from '@/components/SocialIcons/SocialsEditor'

export default async function Socials() {
    const session = await ServerSession.fromNextAuth()
    const owner = { type: 'SPECIAL', special: 'FRONTPAGE' } as const
    authorizeSocialOwner(socialAuth.upsertSocial, owner)
        .auth(session)
        .redirectOnUnauthorized({ returnUrl: '/admin/socials' })

    const socials = unwrapActionReturn(await readSocialsAction({ params: { owner } }))

    return (
        <PageWrapper title="Sosiale medier">
            <h1>Sosiale medier</h1>
            <p className={styles.explanation}>
                Lenkene som vises i bunnteksten og på forsiden. De redigeres på samme måte som
                brukere redigerer sine egne sosiale medier, og en plattform kan bare ha én lenke.
            </p>
            <SocialsEditor owner={owner} socials={socials} />
        </PageWrapper>
    )
}
