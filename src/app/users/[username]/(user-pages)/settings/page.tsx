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
import { studyProgrammeOperations } from '@/services/groups/studyProgrammes/operations'
import { serverPage } from '@/app/serverPage'
import { configureAction } from '@/services/configureAction'
import type { PageOperationArgs } from '@/app/serverPage'

const { page, generateMetadata } = serverPage({
    operation: async ({ params, session }: PageOperationArgs<{ username: string }>) => {
        const { profile } = await getProfileForUserPage(params, 'settings', session)

        // Study programme membership normally comes from Feide. Putting someone on one by hand is
        // an administrator's job, so the form only shows for one - the actions check per programme
        // anyway.
        const canManageStudyProgrammes = studyProgrammeAuth.update.dynamicFields({}).auth(session)
        const studyProgrammes = canManageStudyProgrammes.authorized
            ? await studyProgrammeOperations.readMany({})
            : []

        return { profile, studyProgrammes }
    },
    render: ({ data, session }) => {
        const { profile, studyProgrammes } = data
        const canUpdateImage = userAuth.updateProfileImage
            .dynamicFields({ username: profile.user.username }).auth(session)
        const canChangeClass = classAuth.changeClassOfUser.dynamicFields({}).auth(session)
        const canManageStudyProgrammes = studyProgrammeAuth.update.dynamicFields({}).auth(session)

        return (
            <div className={styles.wrapper}>
                <UserProfileSettingsCard>
                    <UserSettingsForm user={profile.user} />
                </UserProfileSettingsCard>
                {canChangeClass.authorized && (
                    <UserProfileSettingsCard>
                        <ChangeClassForm
                            userId={profile.user.id}
                            currentLevel={profile.class?.level ?? null}
                        />
                    </UserProfileSettingsCard>
                )}
                {canManageStudyProgrammes.authorized && (
                    <UserProfileSettingsCard>
                        <ManageUserStudyProgrammes
                            userId={profile.user.id}
                            studyProgrammes={studyProgrammes}
                            memberships={profile.user.memberships
                                .filter(membership => membership.group.groupType === 'STUDY_PROGRAMME')
                                .filter(membership => membership.active)
                                .map(membership => ({
                                    groupId: membership.group.id,
                                    order: membership.order,
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
                            canEdit={canUpdateImage.toJsObject()}
                            uploadImageAction={configureAction(
                                updateUserProfileImageAction,
                                { params: { username: profile.user.username } }
                            )}
                        />
                    </div>
                </UserProfileSettingsCard>
            </div>
        )
    },
})

export default page
export { generateMetadata }
