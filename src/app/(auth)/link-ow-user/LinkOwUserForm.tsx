'use client'
import { sendLinkFeideAccountEmailAction } from '@/services/auth/actions'
import Form from '@/components/Form/Form'
import TextInput from '@/components/UI/TextInput'
import { useState } from 'react'

export default function LinkOwUserForm() {
    const [feedback, setFeedback] = useState('')

    return <>
        <Form
            title="Koble til gammel bruker"
            submitText="Send e-post"
            action={sendLinkFeideAccountEmailAction}
            successCallback={() => {
                setFeedback(`
                    Hvis brukeren finnes og ikke allerede er koblet til en innlogging, er det sendt
                    en e-post til e-postadressen som er registrert på den, med en lenke for å
                    bekrefte koblingen. Det kan ta noen minutter før den kommer fram.`)
            }}
        >
            <p>
                Hadde du bruker på gamle Omegaveven? Skriv inn det gamle brukernavnet ditt eller
                e-postadressen som var registrert på brukeren, så sender vi en bekreftelseslenke
                dit. Når du har bekreftet, blir denne Feide-innloggingen koblet til den gamle
                brukeren din.
            </p>
            <TextInput label="Gammelt brukernavn eller e-post" name="usernameOrEmail" />
        </Form>
        <p>{feedback}</p>
    </>
}
