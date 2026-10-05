import styles from './page.module.scss'
import UserSettingsForm from './UserProfileSettingsForm'
import UserProfileSettingsCard from './UserProfileSettingsCard'
import ChangeEmailForm from './ChangeEmailForm'
import AdminUserSettingsForm from './AdminUserSettingsForm'
import ChangeClassForm from './ChangeClassForm'
import ManageUserStudyProgrammes from './ManageUserStudyProgrammes'
import { getProfileForUserPage } from '@/app/users/[username]/(user-pages)/getProfileForUserPage'
import Image from '@/components/Image/Image'
import CmsParagraphEditorForm from '@/components/Cms/CmsParagraph/CmsParagraphEditorForm'
import ImageUploader from '@/components/Image/ImageUploader'
import { updateUserBioParagraphContentAction, updateUserProfileImageAction } from '@/services/users/actions'
import { userAuth } from '@/services/users/auth'
import { classAuth } from '@/services/groups/classes/auth'
import { studyProgrammeAuth } from '@/services/groups/studyProgrammes/auth'
import { studyProgrammeOperations } from '@/services/groups/studyProgrammes/operations'
import { serverPage } from '@/app/serverPage'
import { configureAction } from '@/services/configureAction'
import type { PageOperationArgs } from '@/app/serverPage'

/**
 * The first cards are what the user may change about themselves, which an administrator may change
 * for them as well. The rest is for administrators only.
 */
const { page, generateMetadata } = serverPage({
    operation: async ({ params, session }: PageOperationArgs<{ username: string }>) => {
        const { profile } = await getProfileForUserPage(params, 'settings', session)

        // Study programme membership normally comes from Feide. Putting someone on one by hand is
        // an administrator's job, so the form only shows for one - the actions check per programme
        // anyway.
        const studyProgrammes = studyProgrammeAuth.update.auth(session).authorized
            ? await studyProgrammeOperations.readMany({})
            : []

        return { profile, studyProgrammes }
    },
    capabilityChecks: {
        canUpdateProfile: ({ profile }) => userAuth.updateProfile.data({
            userField: { username: profile.user.username }
        }),
        canUpdateBio: ({ profile }) => userAuth.updateBioParagraphContent.data({ userId: profile.user.id }),
        canRegisterNewEmail: ({ profile }) => userAuth.registerNewEmail.data({ userId: profile.user.id }),
        canUpdateImage: ({ profile }) => userAuth.updateProfileImage.data({
            userField: { username: profile.user.username }
        }),
        canUpdateUser: () => userAuth.update,
        canChangeClass: () => classAuth.changeClassOfUser,
        canManageStudyProgrammes: () => studyProgrammeAuth.update,
    },
    render: ({ data, capabilities }) => {
        const { profile, studyProgrammes } = data

        return (
            <div className={styles.wrapper}>
                {capabilities.canUpdateProfile.authorized && (
                    <UserProfileSettingsCard>
                        <UserSettingsForm user={profile.user} emailDomain={process.env.EMAIL_DOMAIN} />
                    </UserProfileSettingsCard>
                )}
                {capabilities.canUpdateBio.authorized && (
                    <UserProfileSettingsCard>
                        <h2>Bio</h2>
                        <CmsParagraphEditorForm
                            cmsParagraph={profile.user.bioParagraph}
                            updateCmsParagraphAction={configureAction(
                                updateUserBioParagraphContentAction,
                                { implementationParams: { userId: profile.user.id } }
                            )}
                        />
                    </UserProfileSettingsCard>
                )}
                {capabilities.canRegisterNewEmail.authorized && (
                    <UserProfileSettingsCard>
                        <ChangeEmailForm user={profile.user} />
                    </UserProfileSettingsCard>
                )}
                {capabilities.canUpdateImage.authorized && (
                    <UserProfileSettingsCard>
                        <h2>Profilbilde</h2>
                        <div className={styles.profileImage}>
                            <Image width={300} image={profile.user.image} alt={profile.user.image.alt} />
                            <ImageUploader
                                title="Endre profilbilde"
                                uploadImageAction={configureAction(
                                    updateUserProfileImageAction,
                                    { params: { username: profile.user.username } }
                                )}
                                refreshOnSuccess
                            />
                        </div>
                    </UserProfileSettingsCard>
                )}
                {capabilities.canUpdateUser.authorized && (
                    <UserProfileSettingsCard>
                        <AdminUserSettingsForm user={profile.user} />
                    </UserProfileSettingsCard>
                )}
                {capabilities.canChangeClass.authorized && (
                    <UserProfileSettingsCard>
                        <ChangeClassForm
                            userId={profile.user.id}
                            currentLevel={profile.class?.level ?? null}
                        />
                    </UserProfileSettingsCard>
                )}
                {capabilities.canManageStudyProgrammes.authorized && (
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
            </div>
        )
    },
})

export default page
export { generateMetadata }
