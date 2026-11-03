import { useId, useState, type ReactNode } from 'react'
import { AssignmentOutlineIcon } from 'src/components/icons/assignment-outline-icon'
import { CheckFactOutlineIcon } from 'src/components/icons/check-fact-outline-icon'
import { ChevronRightIcon } from 'src/components/icons/chevron-right-icon'
import { ClockOutlineIcon } from 'src/components/icons/clock-outline-icon'
import { DescriptionOutlineIcon } from 'src/components/icons/description-outline-icon'
import { LocationIcon } from 'src/components/icons/location-icon'
import { OutlineCalendarMonth } from 'src/components/icons/outline-calendar-month'
import { WidgetIcon } from 'src/components/icons/widgets-icon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledSwitch } from 'src/components/inputs/switch/base-ui/StyledSwitch'
import { PopoverSheet } from 'src/components/utils/popover/PopoverSheet'
import { Card } from '../Card'
import type { CardProps, CardType } from '../Card.types'
import { useCardContext } from '../cardModel'
import { CardControl } from '../CardParts'

/**
 * Ad Voca type presets, read from Figma 9Q7C7JYPgnUSsrX1L8v40t (card component set 4808:169482):
 * leading-edge colour and type-label colour per type. Consent's `shield-question` icon has no
 * ui-core counterpart yet, so the story uses the document outline icon in its place.
 */
export const AD_VOCA_TYPES = {
    module: { type: { label: 'Module 1', icon: <WidgetIcon />, color: '#8100AF', size: 'body' }, accentColor: '#D16BF6' },
    questionnaire: { type: { label: 'Questionnaire', icon: <CheckFactOutlineIcon />, color: '#350654' }, accentColor: '#E1BCFA' },
    task: { type: { label: 'Task', icon: <AssignmentOutlineIcon />, color: '#086B96' }, accentColor: '#9EDEFA' },
    event: { type: { label: 'Event', icon: <OutlineCalendarMonth />, color: '#295C2B' }, accentColor: '#BFE3C1' },
    consent: { type: { label: 'Consent', icon: <DescriptionOutlineIcon />, color: '#436E6E' }, accentColor: '#ACCECE' },
    document: { type: { label: 'Document', icon: <DescriptionOutlineIcon />, color: '#B25000' }, accentColor: '#FFC494' },
} satisfies Record<string, { type: CardType; accentColor: string }>

export type AdVocaTypeKey = keyof typeof AD_VOCA_TYPES

export const LONG_TITLE =
    'Achieve a 20% increase in monthly active users by the end of the sprint, and keep it up for the rest of the quarter.'

export const STATUS_NOT_STARTED = { label: 'Not started', squareColor: 'var(--colors-info-500)' }
export const STATUS_VIEW_ONLY = { label: 'View only', squareColor: 'var(--colors-info-500)' }
export const OVERDUE = { label: 'Overdue • 4 days' }
/** The reason a disabled card cannot be opened yet (Figma 7334:33933, DIS-1). */
export const STATUS_AVAILABLE_LATER = { label: 'Available later', squareColor: 'var(--colors-delta-500)' }

/** When a disabled card opens, in body text colour (Figma "Card date" 7134:153564). */
export const ScheduledFact = (): JSX.Element => (
    <p className='m-0 flex flex-wrap gap-x-1 text-sm leading-5 text-delta-700'>
        <span>Scheduled:</span>
        <span>19.01.2026 • 14:00</span>
    </p>
)

export const ModuleImage = (): JSX.Element => (
    <div
        aria-hidden='true'
        className='h-[5.25rem] w-[5.25rem] rounded-md border border-solid border-delta-100 bg-[linear-gradient(135deg,#7da7c4,#c9a27a_55%,#5b6b7a)]'
    />
)

export const ReceivedFact = ({ label = 'Received' }: { label?: string }): JSX.Element => (
    <p className='m-0 text-sm leading-5 text-delta-600'>{label}: 19.01.2026 • 14:00</p>
)

/** Card inside workspace: the sub-goal and its category as one helper line (Figma 4823:147915). */
export const SubGoalCategory = (): JSX.Element => <p className='m-0 text-sm leading-5 text-delta-600'>Sub-goal • Category</p>

export const EventFacts = (): JSX.Element => (
    <>
        {/* Figma "Card date" (7134:153566): the date and the time wrap as two parts, text-icon/primary in every state. */}
        <p data-card-event-date='' className='m-0 flex flex-wrap gap-x-1 text-base leading-6 text-gama-500'>
            <span>September 16, 2026 •</span>
            <span>14:00</span>
        </p>
        <p className='m-0 flex flex-wrap gap-x-2 text-sm leading-5 text-delta-600'>
            <span className='inline-flex items-center gap-1'>
                <ClockOutlineIcon aria-hidden='true' className='h-4 w-4' /> 30 min
            </span>
            <span className='inline-flex items-center gap-1'>
                <LocationIcon aria-hidden='true' className='h-4 w-4' /> Carasent
            </span>
        </p>
    </>
)

/** Body content of each Ad Voca type, as listed in ASMA-8318 §2. */
export const adVocaBody = (key: AdVocaTypeKey): ReactNode => {
    if (key === 'module') return <ReceivedFact label='Sent' />
    if (key === 'event') return <EventFacts />
    if (key === 'consent') return null
    return <ReceivedFact />
}

const CTA_BY_TYPE: Record<AdVocaTypeKey, string> = {
    module: 'Open',
    questionnaire: 'Answer',
    task: 'Open',
    event: 'Join',
    consent: 'Open',
    document: 'Open',
}

/** The Ad Voca call-to-action content an app passes to `cta`: the word and the chevron. */
export const ctaContent = (label: string): ReactNode => (
    <>
        {label}
        <ChevronRightIcon className='h-6 w-6' />
    </>
)

/** Props of one Ad Voca card of the given type, in its resting state. */
export const adVocaCardProps = (key: AdVocaTypeKey, dataTest: string): CardProps => ({
    ...AD_VOCA_TYPES[key],
    title: LONG_TITLE,
    headingLevel: 3,
    status: key === 'document' ? STATUS_VIEW_ONLY : STATUS_NOT_STARTED,
    open: { href: `#${key}` },
    cta: ctaContent(CTA_BY_TYPE[key]),
    subtitle: key === 'module' ? 'Pathway name' : undefined,
    media: key === 'module' ? <ModuleImage /> : undefined,
    children: adVocaBody(key),
    dataTest,
})

const SharedStatus = ({ canShare }: { canShare: boolean }): JSX.Element => {
    const { composeName } = useCardContext()
    const [isShared, setIsShared] = useState(false)
    const switchId = useId()

    if (!canShare) return <p className='m-0 py-1 text-base leading-6 text-delta-600'>Not shareable</p>

    return (
        <CardControl>
            <label htmlFor={switchId} className='cursor-pointer text-base font-semibold leading-6 text-delta-800'>
                Shared status
            </label>
            <StyledSwitch
                id={switchId}
                dataTest='shared-status'
                checked={isShared}
                onChange={(_event, checked) => setIsShared(checked)}
                aria-label={composeName('Shared status')}
            />
        </CardControl>
    )
}

/** "View details" as the CTA button: the app owns the button and its popover and passes them to `ctaAction`. */
const ViewDetails = ({ title, children }: { title: string; children: ReactNode }): JSX.Element => {
    const { composeName } = useCardContext()

    return (
        <PopoverSheet
            dataTest='view-details'
            variant='info'
            title={title}
            locale='en'
            renderTrigger={({ ref, triggerProps }) => (
                <StyledButton dataTest='view-details-trigger' refLink={ref} type='button' variant='text' aria-label={composeName('View details')} {...triggerProps}>
                    View details
                </StyledButton>
            )}
        >
            {children}
        </PopoverSheet>
    )
}

/** Ad Opus Workspace card as Figma 5055:168041 draws it: checkbox, unread, tag, ⋮, "View details" in the footer, and the Shared status switch or "Not shareable". */
export const WorkspaceCard = ({ canShare = true }: { canShare?: boolean }): JSX.Element => {
    const [checked, setChecked] = useState(false)

    return (
        <Card
            dataTest={canShare ? 'card-workspace' : 'card-workspace-not-shareable'}
            title='Basic data/Order'
            headingLevel={3}
            open={{ href: '#workspace' }}
            titleChevron
            checkbox={{ checked, onChange: setChecked }}
            unread
            tags={['Important']}
            menu={{
                actions: [
                    { label: 'Duplicate', onSelect: () => console.log('Duplicate') },
                    { label: 'Archive', onSelect: () => console.log('Archive'), disabledReason: 'Cannot be archived while it is shared' },
                    { label: 'Delete', onSelect: () => console.log('Delete'), danger: true },
                ],
            }}
            ctaAction={
                <ViewDetails title='Basic data/Order'>
                    <p className='m-0'>Created 12.01.2026 by Kari Nordmann.</p>
                </ViewDetails>
            }
        >
            <p className='m-0 text-base leading-6 text-delta-800'>
                <span className='mr-1 font-semibold'>Status:</span> Awaiting reply
            </p>
            <p className='m-0 text-base leading-6 text-delta-800'>
                <span className='mr-1 font-semibold'>State:</span> Active
            </p>
            <SharedStatus canShare={canShare} />
        </Card>
    )
}
