'use client'
import { linkFeideAccountAction } from '@/services/auth/actions'
import { configureAction } from '@/services/configureAction'
import Form from '@/components/Form/Form'
import Link from 'next/link'
import { useState } from 'react'

type PropTypes = {
    token: string
}

export default function ConfirmLinkOwUserForm({ token }: PropTypes) {
    const [linked, setLinked] = useState(false)

    if (linked) {
        return <>
            <h1>Brukeren er koblet!</h1>
            <p>
                Feide-innloggingen er nå koblet til den gamle brukeren din.
                Logg inn med Feide på nytt for å fortsette registreringen.
            </p>
            <Link href="/login">Til innlogging</Link>
        </>
    }

    return <Form
        title="Bekreft kobling"
        submitText="Koble Feide-innloggingen til denne brukeren"
        action={configureAction(linkFeideAccountAction, { params: { token } })}
        successCallback={() => setLinked(true)}
    >
        <p>
            Du er i ferd med å koble en Feide-innlogging til den gamle brukeren din fra
            Omegaveven. Den midlertidige brukeren som ble opprettet ved Feide-innloggingen
            blir slettet, og du må logge inn med Feide på nytt etterpå.
        </p>
    </Form>
}
