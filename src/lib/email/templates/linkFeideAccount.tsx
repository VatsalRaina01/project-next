import '@pn-server-only'

import { Html } from '@react-email/components'
import type { UserFiltered } from '@/services/users/types'

export function LinkFeideAccountTemplate({
    user,
    link,
}: {
    user: UserFiltered,
    link: string,
}) {
    return (
        <Html>
            <h1>Koble Feide-innlogging til brukeren din</h1>

            <p>Hei {user.firstname},</p>

            <p>
                Noen (forhåpentligvis du) har logget inn med Feide på Veven og bedt om å koble
                innloggingen til brukeren {user.username}.
                Trykk på denne <a href={link}>lenken</a> for å bekrefte koblingen.
                Lenken blir ugyldig etter 1 time.
            </p>

            <p>Hvis dette ikke var deg kan du bare se bort i fra denne e-posten.</p>

            <p>
                Med vennlig hilsen<br/>
                Vevcom
            </p>
        </Html>
    )
}
