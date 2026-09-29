import styles from './page.module.scss'
import { getProfileForAdmin } from '@/app/users/[username]/(user-admin)/getProfileForAdmin'
import { readAdmissionTrialsAction } from '@/services/admission/actions'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { admissionDisplayNames, allAdmissions } from '@/services/admission/constants'
import { OMEGA_MEMBERSHIP_LEVEL_RANKING } from '@/services/groups/constants'
import { sexConfig } from '@/services/users/constants'
import type { OmegaMembershipLevel } from '@/prisma-generated-pn-types'
import type { PropTypes } from '@/app/users/[username]/page'

/**
 * What each step of the ladder is called on this page. Sysken is left out: what a member is called
 * depends on who they are, so it is resolved against the user's sex below.
 */
const stepNames = {
    DEN_GEMENE_HOB: 'Den gemene hob',
    SOELLE: 'Soelle',
} as const satisfies Partial<Record<OmegaMembershipLevel, string>>

export default async function MembershipStatus({ params }: PropTypes) {
    const { profile } = await getProfileForAdmin(await params, 'membership-status')
    const trials = unwrapActionReturn(await readAdmissionTrialsAction({
        params: { userId: profile.user.id },
    }))

    const currentLevel = profile.omegaMembership.level
    const sittedTrials = new Set(trials.map(trial => trial.admission))

    return (
        <div className={styles.wrapper}>
            <h2>Medlemsstatus</h2>

            {/* Highest standing first, so the ladder is read from the top down. */}
            <ol className={styles.ladder}>
                {[...OMEGA_MEMBERSHIP_LEVEL_RANKING].reverse().map(level => (
                    <li key={level} className={styles.step}>
                        <div className={level === currentLevel
                            ? `${styles.level} ${styles.current}`
                            : styles.level}
                        >
                            {level === 'SYSKEN'
                                ? sexConfig[profile.user.sex ?? 'OTHER'].title
                                : stepNames[level]}
                            {level === currentLevel && <span className={styles.marker}>Du er her</span>}
                        </div>

                        {/* The trials are what carries a soelle up to sysken, so they sit in the
                            gap between the two. */}
                        {level === 'SYSKEN' && (
                            <ul className={styles.trials}>
                                {allAdmissions.map(admission => (
                                    <li
                                        key={admission}
                                        className={sittedTrials.has(admission)
                                            ? `${styles.trial} ${styles.sitted}`
                                            : styles.trial}
                                    >
                                        {admissionDisplayNames[admission]}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    )
}
