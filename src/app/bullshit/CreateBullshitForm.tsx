'use client'

import styles from './CreateBullshitFrom.module.scss'
import PopUp from '@/components/PopUp/PopUp'
import Form from '@/components/Form/Form'
import { createBullshitAction } from '@/services/bullshit/actions'
import Textarea from '@/components/UI/Textarea'
import { configureAction } from '@/services/configureAction'
import { useSession } from '@/auth/session/useSession'
import { useRouter } from 'next/navigation'

export default function CreateBullshitForm() {
    const { refresh } = useRouter()
    const session = useSession()
    if (session.loading || !session.session.user) return null

    return (
        <PopUp
            popUpKey="new_bullshit"
            showButtonContent="Ny bullshit"
            showButtonClass={styles.button}
        >
            <Form
                title="Ny bullshit"
                submitText="Legg til"
                action={configureAction(
                    createBullshitAction,
                    { params: { bullshitAuthPosterId: session.session.user?.id } }
                )}
                successCallback={refresh}
                className={styles.popupForm}
            >
                <Textarea
                    name="quote"
                    label="bullshit"
                    placeholder="bullshit"
                    className={styles.textarea}
                />
            </Form>
        </PopUp>
    )
}
