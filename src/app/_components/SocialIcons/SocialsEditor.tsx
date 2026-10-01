'use client'
import styles from './SocialsEditor.module.scss'
import { socialPlatformIcons } from './socialPlatformIcons'
import Form from '@/components/Form/Form'
import TextInput from '@/components/UI/TextInput'
import Dropdown from '@/components/UI/Dropdown'
import { destroySocialAction, upsertSocialAction } from '@/services/socials/actions'
import { socialPlatformConfig, socialPlatformsInDisplayOrder } from '@/services/socials/constants'
import { configureAction } from '@/services/configureAction'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import type { SocialPlatform } from '@/prisma-generated-pn-types'
import type { SocialFiltered, SocialOwner } from '@/services/socials/types'

export type PropTypes = {
    owner: SocialOwner,
    socials: SocialFiltered[],
    title?: string,
}

/**
 * Edits one owner's socials - a user's own, or one of the site-wide sets. Both are the same rows
 * behind the same operations, so the only thing that differs between the two is the owner passed
 * in; whether the session may actually save anything is decided by the action, and by whoever
 * chose to render this.
 */
export default function SocialsEditor({ owner, socials, title }: PropTypes) {
    const usedPlatforms = new Set(socials.map(social => social.platform))
    const unusedPlatforms = socialPlatformsInDisplayOrder.filter(platform => !usedPlatforms.has(platform))

    // The placeholder of the add form's url field follows its platform dropdown, so it is always
    // showing an example of what the currently chosen platform accepts. A refresh after a save
    // leaves this state behind on a platform that now has a link, so the choice is only honoured
    // while it is still one of the ones left - and the dropdown is remounted along with the list,
    // since it keeps a copy of its default.
    const [chosenPlatform, setChosenPlatform] = useState<SocialPlatform | null>(null)
    const platformToAdd = chosenPlatform && unusedPlatforms.includes(chosenPlatform)
        ? chosenPlatform
        : unusedPlatforms[0]

    return (
        <div className={styles.SocialsEditor}>
            {title && <h2>{title}</h2>}

            {socials.length === 0 && <p className={styles.empty}>Ingen sosiale medier lagt til enda.</p>}

            <ul className={styles.socials}>
                {socials.map(social => (
                    <li key={social.id} className={styles.social}>
                        <span className={styles.platform}>
                            <FontAwesomeIcon icon={socialPlatformIcons[social.platform]} />
                            {socialPlatformConfig[social.platform].label}
                        </span>
                        <Form
                            className={styles.urlForm}
                            submitText="Lagre"
                            refreshOnSuccess
                            action={configureAction(upsertSocialAction, { params: { owner } })}
                        >
                            <input type="hidden" name="platform" value={social.platform} readOnly />
                            <TextInput
                                label={socialPlatformConfig[social.platform].label}
                                name="url"
                                defaultValue={social.url}
                                placeholder={socialPlatformConfig[social.platform].placeholder}
                            />
                        </Form>
                        <Form
                            className={styles.destroyForm}
                            submitText="Fjern"
                            submitColor="red"
                            confirmation={{
                                confirm: true,
                                text: `Vil du fjerne ${socialPlatformConfig[social.platform].label}?`,
                            }}
                            refreshOnSuccess
                            action={configureAction(destroySocialAction, {
                                params: { owner, platform: social.platform },
                            })}
                        />
                    </li>
                ))}
            </ul>

            {unusedPlatforms.length > 0 && (
                <Form
                    className={styles.addForm}
                    title="Legg til"
                    submitText="Legg til"
                    refreshOnSuccess
                    action={configureAction(upsertSocialAction, { params: { owner } })}
                >
                    <Dropdown
                        key={unusedPlatforms.join()}
                        label="Plattform"
                        name="platform"
                        defaultValue={platformToAdd}
                        onChange={setChosenPlatform}
                        options={unusedPlatforms.map(platform => ({
                            value: platform,
                            label: socialPlatformConfig[platform].label,
                        }))}
                    />
                    <TextInput
                        label="Brukernavn eller lenke"
                        name="url"
                        placeholder={socialPlatformConfig[platformToAdd].placeholder}
                    />
                </Form>
            )}
        </div>
    )
}
