import styles from './page.module.scss'
import UserSettingsForm from './UserProfileSettingsForm'
import UserProfileSettingsCard from './UserProfileSettingsCard'
import ProfileImageUploader from './ProfileImageUploader'
import ChangeClassForm from './ChangeClassForm'
import ManageUserStudyProgrammes from './ManageUserStudyProgrammes'
import { getProfileForUserPage } from '@/app/users/[username]/(user-pages)/getProfileForUserPage'
import Image from '@/components/Image/Image'
import { updateUserProfileImageAction } from '@/services/users/actions'
import { userAuth } from '@/services/users/auth'
import { classAuth } from '@/services/groups/classes/auth'
import { studyProgrammeAuth } from '@/services/groups/studyProgrammes/auth'
import { readStudyProgrammesAction } from '@/services/groups/studyProgrammes/actions'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { configureAction } from '@/services/configureAction'
import type { PropTypes } from '@/app/users/[username]/page'

export default async function UserSettings({ params }: PropTypes) {
    const { profile, session } = await getProfileForUserPage(await params, 'settings')

    const canUpdateImage = userAuth.updateProfileImage.dynamicFields({
        username: profile.user.username
    }).auth(session).toJsObject()
    const canChangeClass = classAuth.changeClassOfUser.dynamicFields({}).auth(session).authorized
    // Study programme membership normally comes from Feide. Putting someone on one by hand is an
    // administrator's job, so the form only shows for one - the actions check per programme anyway.
    const canManageStudyProgrammes = studyProgrammeAuth.update.dynamicFields({}).auth(session).authorized
    const studyProgrammes = canManageStudyProgrammes
        ? unwrapActionReturn(await readStudyProgrammesAction())
        : []

    return (
        <div className={styles.wrapper}>
            <UserProfileSettingsCard>
                <UserSettingsForm user={profile.user} emailDomain={process.env.EMAIL_DOMAIN} />
            </UserProfileSettingsCard>
            {canChangeClass && (
                <UserProfileSettingsCard>
                    <ChangeClassForm
                        userId={profile.user.id}
                        currentLevel={profile.class?.level ?? null}
                    />
                </UserProfileSettingsCard>
            )}
            {canManageStudyProgrammes && (
                <UserProfileSettingsCard>
                    <ManageUserStudyProgrammes
                        userId={profile.user.id}
                        studyProgrammes={studyProgrammes}
                        memberships={profile.groups.activeStudyProgrammes.map(({ groupId, order }) => ({
                            groupId,
                            order,
                        }))}
                    />
                </UserProfileSettingsCard>
            )}
            {/* TODO: add Email registration form and admin user settings */}
            <UserProfileSettingsCard>
                <h2>Generelle Instillinger</h2>
                <div className={styles.profileImage}>
                    <Image width={300} image={profile.user.image} />
                    <ProfileImageUploader
                        canEdit={canUpdateImage}
                        uploadImageAction={configureAction(
                            updateUserProfileImageAction,
                            { params: { username: profile.user.username } }
                        )}
                    />
                </div>
            </UserProfileSettingsCard>
        </div>
    )
}
