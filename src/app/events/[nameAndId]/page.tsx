import styles from './page.module.scss'
import ShowAndEditName from './ShowAndEditName'
import RegistrationUI from './RegistrationUI'
import RegistrationsList from './RegistrationsList'
import ManualRegistrationForm from './ManualRegistrationForm'
import EventVisibilityAdmin from './EventVisibilityAdmin'
import EventLocationMap from '@/components/Event/EventLocationMap'
import Date from '@/components/Date/Date'
import CreateOrUpdateEventForm from '@/app/events/CreateOrUpdateEventForm'
import CmsImage from '@/components/Cms/CmsImage/CmsImage'
import CmsParagraph from '@/components/Cms/CmsParagraph/CmsParagraph'
import Form from '@/components/Form/Form'
import EventTag from '@/components/Event/EventTag'
import { SettingsHeaderItemPopUp, UsersHeaderItemPopUp } from '@/components/HeaderItems/HeaderItemPopUp'
import { QueryParams } from '@/lib/queryParams/queryParams'
import { unwrapActionReturn } from '@/app/redirectToErrorPage'
import { readEventTagsAction } from '@/services/events/tags/actions'
import {
    destroyEventAction,
    readEventAction,
    readEventDoubleLevelVisibilityAction,
    updateEventCmsCoverImageAction,
    updateEventParagraphContentAction
} from '@/services/events/actions'
import {
    readDotPunishmentOfUserAction,
    readEventRegistrationOfUserAction
} from '@/services/events/registration/actions'
import { calculateLedgerAccountBalanceAction } from '@/services/ledger/accounts/actions'
import { createStripeCustomerSessionAction } from '@/services/stripeCustomers/actions'
import { configureAction } from '@/services/configureAction'
import { decodeVevenUriHandleError } from '@/lib/urlEncoding'
import { ServerSession } from '@/auth/session/ServerSession'
import { eventAuth } from '@/services/events/auth'
import { eventRegistrationAuth } from '@/services/events/registration/auth'
import { EMPTY_VISIBILITY } from '@/auth/visibility/emptyVisibility'
import PageTitleSetter from '@/contexts/PageTitleSetter'
import Link from 'next/link'
import { faCalendar, faCalendarPlus, faExclamation, faLocationDot, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type PropTypes = {
    params: Promise<{
        nameAndId: string
    }>
}

export default async function Event({ params }: PropTypes) {
    const event = unwrapActionReturn(await readEventAction({
        params: {
            id: decodeVevenUriHandleError((await params).nameAndId)
        }
    }))

    const tags = unwrapActionReturn(await readEventTagsAction())

    const session = await ServerSession.fromNextAuth()

    // Readable only by those who administrate the event, so a visitor without that access simply
    // gets no editing tools - EMPTY_VISIBILITY then denies everyone but those bypassing with
    // EVENT_ADMIN, which is the safe direction to fail in.
    const readDoubleLevelVisibility = await readEventDoubleLevelVisibilityAction({ params: { id: event.id } })
    const doubleLevelVisibility = readDoubleLevelVisibility.success ? readDoubleLevelVisibility.data : null
    const doubleLevelMatrix = doubleLevelVisibility ?? EMPTY_VISIBILITY

    const canEditCmsCoverImage = eventAuth.updateCmsCoverImage.data({ visibility: doubleLevelMatrix }).auth(
        session
    ).toJsObject()
    const canEditCmsParagraph = eventAuth.updateParagraphContent.data({ visibility: doubleLevelMatrix }).auth(
        session
    ).toJsObject()
    const canDestroy = eventAuth.destroy.data({ visibility: doubleLevelMatrix }).auth(
        session
    ).toJsObject()

    // Registering takes the regular level of the event, reading who is registered the same, and
    // registering on behalf of others its admin level - offering any of it to someone without the
    // level would only produce an error when they act on it.
    const canRegister = session.user ? eventRegistrationAuth.create({
        userId: session.user.id,
        doubleLevelMatrix,
    }).auth(session).authorized : false
    const canReadRegistrations = eventRegistrationAuth.readPage
        .data({ visibility: doubleLevelMatrix }).auth(session).authorized
    const canRegisterOthers = eventRegistrationAuth.createGuest
        .data({ visibility: doubleLevelMatrix }).auth(session).authorized

    // What the dots of the one visiting hold them back from - nothing to tell a visitor without a
    // user, and nothing to hide either, as it is their own dots it is read from.
    const dotPunishment = event.takesRegistration && session.user ? unwrapActionReturn(
        await readDotPunishmentOfUserAction({ params: { userId: session.user.id } })
    ) : null

    // The registration of the one visiting, if they are registered - the same holds as for the dots.
    const ownRegistration = event.takesRegistration && session.user ? unwrapActionReturn(
        await readEventRegistrationOfUserAction({
            params: { eventId: event.id, userId: session.user.id }
        })
    ) : null

    let eventPaymentBalance: number | undefined
    let eventPaymentCustomerSessionSecret: string | undefined

    if (event.takesRegistration && event.price && session.user) {
        eventPaymentBalance = unwrapActionReturn(
            await calculateLedgerAccountBalanceAction({ params: { userId: session.user.id } })
        ).amount

        const customerSessionResult = await createStripeCustomerSessionAction({
            params: { userId: session.user.id }
        })
        eventPaymentCustomerSessionSecret = customerSessionResult.success
            ? customerSessionResult.data.customerSessionClientSecret
            : undefined
    }

    const formatICSDate = (date: Date) => {
        try {
            const d = new Date(date)
            return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
        } catch {
            return ''
        }
    }

    const escapeICSText = (value: string) => value
        .replace(/\\/g, '\\\\')
        .replace(/\r\n|\r|\n/g, '\\n')
        .replace(/[,;]/g, character => `\\${character}`)

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${formatICSDate(event.eventStart)}/${formatICSDate(event.eventEnd)}&details=${encodeURIComponent(`Arrangement: ${event.name}`)}&location=${encodeURIComponent(event.location || '')}`

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Veven//NONSGML Event Calendar//EN',
        'BEGIN:VEVENT',
        `UID:event-${event.id}@veven`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `SUMMARY:${escapeICSText(event.name)}`,
        `DTSTART:${formatICSDate(event.eventStart)}`,
        `DTEND:${formatICSDate(event.eventEnd)}`,
        `DESCRIPTION:Arrangement: ${escapeICSText(event.name)}`,
        `LOCATION:${escapeICSText(event.location || '')}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n')

    const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`

    return (
        <div className={styles.wrapper}>
            <PageTitleSetter title={'Arrangement'} />
            <span className={styles.coverImage}>
                <CmsImage
                    canEdit={canEditCmsCoverImage}
                    cmsImage={event.coverImage}
                    width={900}
                    updateCmsImageAction={
                        configureAction(
                            updateEventCmsCoverImageAction,
                            { implementationParams: { eventId: event.id } }
                        )}
                />
                <div className={styles.infoInImage}>
                    <ShowAndEditName event={event} />
                    <ul className={styles.tags}>
                        {event.tags.map(tag => (
                            <li key={tag.id}>
                                <Link href={`/events?${QueryParams.eventTags.encodeUrl([tag.name])}`}>
                                    <EventTag eventTag={tag} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.settings}>
                    {event.takesRegistration && canRegisterOthers &&
                        <UsersHeaderItemPopUp scale={30} popUpKey="Users">
                            <ManualRegistrationForm eventId={event.id} />
                        </UsersHeaderItemPopUp>
                    }
                    <SettingsHeaderItemPopUp scale={30} popUpKey="EditEvent">
                        <CreateOrUpdateEventForm event={event} eventTags={tags} />
                        <EventVisibilityAdmin event={event} doubleLevelVisibility={doubleLevelVisibility} />
                        { canDestroy.authorized &&
                            <Form
                                action={configureAction(destroyEventAction, { params: { id: event.id } })}
                                navigateOnSuccess="/events"
                                className={styles.destroyForm}
                                buttonClassName={styles.destroyButton}
                                submitText="Slett"
                                submitColor="red"
                                confirmation={{
                                    confirm: true,
                                    text: 'Er du sikker på at du vil slette dette arrangementet?'
                                }}
                            />
                        }
                    </SettingsHeaderItemPopUp>
                </div>
            </span>
            <aside>
                <p>
                    <FontAwesomeIcon icon={faCalendar} />
                    <Date date={event.eventStart} includeTime /> - <Date date={event.eventEnd} includeTime />
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: '8px 0 16px 0', fontSize: '0.9em' }}>
                    <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FontAwesomeIcon icon={faCalendarPlus} /> Legg til i kalender:
                    </span>
                    <div style={{ display: 'flex', gap: '8px', paddingLeft: '20px' }}>
                        <a
                            href={googleCalendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'var(--primary-color, #0070f3)',
                                textDecoration: 'underline',
                                fontWeight: '500'
                            }}
                        >
                            Google
                        </a>
                        <span>|</span>
                        <a
                            href={icsHref}
                            download={`${event.name}.ics`}
                            style={{
                                color: 'var(--primary-color, #0070f3)',
                                textDecoration: 'underline',
                                fontWeight: '500'
                            }}
                        >
                            iCal / Outlook
                        </a>
                    </div>
                </div>
                <p>
                    <FontAwesomeIcon icon={faLocationDot} />
                    {event.location}
                </p>
                {event.takesRegistration ? <>
                    <p>
                        <FontAwesomeIcon icon={faUsers} />
                        {event.numOfRegistrations} / {event.places}
                    </p>
                    <p>
                        Påmelding start: <Date date={event.registrationStart} includeTime />
                    </p>
                    <p>
                        Påmelding slutt: <Date date={event.registrationEnd} includeTime />
                    </p>
                    {event.waitingList && <p>
                        På venteliste: {event.numOnWaitingList}
                    </p>}
                    <RegistrationUI
                        event={event}
                        registration={ownRegistration}
                        dotPunishment={dotPunishment}
                        availableBalance={eventPaymentBalance}
                        customerSessionClientSecret={eventPaymentCustomerSessionSecret}
                        canRegister={canRegister}
                    />
                </> : <p>
                    <FontAwesomeIcon icon={faExclamation} />
                    Dette arrangementet tar ikke påmeldinger
                </p>}

            </aside>
            <main>
                <CmsParagraph
                    canEdit={canEditCmsParagraph}
                    cmsParagraph={event.paragraph}
                    updateCmsParagraphAction={
                        configureAction(
                            updateEventParagraphContentAction,
                            { implementationParams: { eventId: event.id } }
                        )
                    }
                />
                {event.locationMap && <section aria-label="Kart til arrangementet">
                    <h2>Her finner du oss</h2>
                    <EventLocationMap locationMap={event.locationMap} />
                </section>}
            </main>

            {event.takesRegistration && canReadRegistrations && (
                <div className={styles.registrationList}>
                    <RegistrationsList event={event} />
                </div>
            )}
        </div>
    )
}
