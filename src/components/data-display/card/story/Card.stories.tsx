import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type MouseEvent } from 'react'
import { MinimizableDialogV2 } from 'src/components/feedback/minimizable-dialog/v2'
import { ChevronRightIcon } from 'src/components/icons/chevron-right-icon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledPopover } from 'src/components/utils/popover/StyledPopover'
import { Card } from '../Card'
import type { CardProps } from '../Card.types'
import { CardList } from '../CardList'
import {
    adVocaCardProps,
    type AdVocaTypeKey,
    LONG_TITLE,
    OVERDUE,
    ReceivedFact,
    ScheduledFact,
    STATUS_AVAILABLE_LATER,
    STATUS_NOT_STARTED,
    SubGoalCategory,
    WorkspaceCard,
} from './cardStoryFixtures'

// A story link logs instead of navigating, so a click never leaves the story or the Docs page.
// Capture runs through portals too, so links in the ⋮ menu are covered.
const logLinkClick = (event: MouseEvent<HTMLElement>): void => {
    const link = (event.target as Element).closest('a[href]')
    if (!link) return
    event.preventDefault()
    console.log(`Card opens ${link.getAttribute('href')}`)
}

const meta = {
    title: 'DataDisplay/Card',
    component: Card,
    parameters: {
        layout: 'padded',
        // "Viewing now" and the Event date are gama-500 as Figma draws them (Figma keeps the date in
        // text-icon/primary in every state), ~4.3:1 on the selected and overdue tints: the CTA's accepted
        // Q14 risk (docs/a11y-contrast.md). Only those leave the colour-contrast rule; every other axe
        // rule and every other element stay enforced.
        a11y: { config: { rules: [{ id: 'color-contrast', selector: '*:not([data-card-viewing-now], [data-card-event-date] *)' }] } },
        docs: {
            description: {
                component: [
                    'Shared Card shell (ASMA-8318) — one base for every card type: fixed header and footer parts, a free body slot.',
                    'Contract: `_docs/ux/components/component-card.md`. Figma: Ad Voca concept `4808:169482`, `6070:46996`.',
                    '',
                    'The interaction model is derived, never passed: no `open`, or `readOnly` → **static**; any control',
                    '(checkbox, ⋮ menu, footer actions, a CTA button, a `CardControl` in the body) → **partially clickable**; otherwise **fully clickable**.',
                    'The card opens through one link in its title heading, stretched over the card; controls sit on top of it.',
                    'Open cues are independent props: `cta` (footer label, shown when passed) and `titleChevron` (chevron after the title).',
                ].join('\n'),
            },
        },
    },
    args: { dataTest: 'card', title: LONG_TITLE, headingLevel: 3 },
    // Single cards sit in a list-width column; `wide` stories lay out several cards themselves.
    decorators: [
        (Story, { parameters }) => (
            <div className={parameters['wide'] ? undefined : 'max-w-[37.5rem]'} onClickCapture={logLinkClick}>
                {Story()}
            </div>
        ),
    ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

/** One link, one tab stop; a click anywhere opens the item. Name: the title; description: type and status (Figma note 5021:142371). */
export const FullyClickable: Story = {
    args: adVocaCardProps('questionnaire', 'card-full'),
}

/**
 * Only the title row opens the item (Figma note 5021:142373); the checkbox, ⋮, "View details" and the switch are their own controls, each its
 * own tab stop named after the card. Shared status: the switch when it can be shared, the words when not.
 */
export const PartiallyClickable: Story = {
    render: () => (
        <div className='flex flex-col gap-2'>
            <WorkspaceCard />
            <WorkspaceCard canShare={false} />
        </div>
    ),
}

/** Read-only (`readOnly`): shows the item only. No link, no CTA, no footer buttons, no hover, not in the tab order (CARD-6). */
export const ReadOnly: Story = {
    args: { ...adVocaCardProps('module', 'card-read-only'), readOnly: true, status: undefined },
}

/**
 * Disabled (`disabled`, Figma 7334:33933): the item exists but cannot be opened yet. No CTA, no footer
 * buttons, grey fill and leading edge, the not-allowed cursor; still a tab stop with `aria-disabled`.
 * The status says why, the body says when (DIS-1).
 */
export const Disabled: Story = {
    args: { ...adVocaCardProps('module', 'card-disabled'), disabled: true, status: STATUS_AVAILABLE_LATER, children: <ScheduledFact /> },
}

const OpensDialogExample = (): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* While its dialog is open, the card is the item being viewed: `selected` ("Viewing now"). */}
            <Card {...adVocaCardProps('consent', 'card-dialog')} open={{ onOpen: () => setIsOpen(true) }} selected={isOpen} />
            <MinimizableDialogV2
                dataTest='card-dialog-consent'
                open={isOpen}
                onClose={() => setIsOpen(false)}
                title={LONG_TITLE}
                label='Consent'
                locale='en'
            >
                <p className='m-0 p-4 text-base leading-6 text-delta-800'>The consent opens here, on the same page.</p>
            </MinimizableDialogV2>
        </>
    )
}

/**
 * A card that opens a dialog on the same page holds a `<button aria-haspopup="dialog">` in its heading; here a
 * `MinimizableDialogV2`. While the dialog is open the card is `selected`.
 */
export const OpensDialog: Story = {
    render: () => <OpensDialogExample />,
}

/** Viewing now: `aria-current="true"` and a visible "Viewing now" in place of the CTA; never the focus colour. */
export const Selected: Story = {
    args: { ...adVocaCardProps('module', 'card-selected'), selected: true },
}

/** Overdue: warning tint and border, the overdue words in the status slot, CTA in warning-800. */
export const Overdue: Story = {
    args: { ...adVocaCardProps('questionnaire', 'card-overdue'), status: undefined, overdue: OVERDUE },
}

/** Unread: the Badge Dot with a visible "Unread"; "Unread" is also in the link's description. */
export const Unread: Story = {
    args: { ...adVocaCardProps('document', 'card-unread'), unread: { visibleLabel: true } },
}

/** Ad Opus title chevron, with and without the `titleChevron` prop. */
export const TitleChevronToggle: Story = {
    render: () => (
        <div className='flex flex-col gap-2'>
            {[true, false].map((titleChevron) => (
                <Card
                    key={String(titleChevron)}
                    dataTest={`card-chevron-${String(titleChevron)}`}
                    title='Basic data/Order'
                    headingLevel={3}
                    open={{ href: '#chevron' }}
                    titleChevron={titleChevron}
                >
                    <ReceivedFact />
                </Card>
            ))}
        </div>
    ),
}

/** A title cut to one line with CSS — only where the truncation pattern §8 records it (e.g. ASMA-8558). */
export const TitleClamp: Story = {
    args: { dataTest: 'card-clamp', title: LONG_TITLE, open: { href: '#clamp' }, titleChevron: true, titleClamp: 1, status: STATUS_NOT_STARTED },
}

/** An app's router link plugs in through `renderLink`; every prop is spread onto it. */
export const RouterLink: Story = {
    args: {
        ...adVocaCardProps('task', 'card-router'),
        open: { href: '/tasks/7', renderLink: (props) => <a {...props} data-router-link='' /> },
    },
}

/**
 * Footer buttons start the footer and make the card partially clickable; the CTA sits at the end.
 * Keep the footer to two actions in total (CARD-12).
 */
export const FooterAction: Story = {
    args: {
        ...adVocaCardProps('document', 'card-footer-action'),
        footerAction: (
            <StyledButton dataTest='sign' variant='outlined'>
                Sign
            </StyledButton>
        ),
    },
}

/**
 * `ctaAction`: a real button in the CTA's place (Figma 5021:142351, "button"), instead of the `cta` label.
 * It has its own action and tab stop and makes the card partially clickable; the title row opens the item.
 */
export const CtaButton: Story = {
    args: {
        ...adVocaCardProps('document', 'card-cta-button'),
        ctaAction: (
            <StyledButton dataTest='card-cta-button-open' variant='text' endIcon={<ChevronRightIcon />} onClick={() => console.log('CTA button')}>
                Open
            </StyledButton>
        ),
    },
}

/**
 * `menu.render`: the app draws its own popover, anchored to the card's ⋮ button, instead of the
 * design-system menu that `menu.actions` gives.
 */
export const CustomMenuPopover: Story = {
    args: {
        ...adVocaCardProps('document', 'card-custom-menu'),
        menu: {
            render: ({ anchorEl, open, close }) => (
                <StyledPopover open={open} anchorEl={anchorEl} onClose={close}>
                    <div className='flex max-w-72 flex-col gap-2 p-4'>
                        <p className='m-0 text-base leading-6 text-delta-800'>The document is shared with your therapist.</p>
                        <StyledButton dataTest='card-custom-menu-close' variant='outlined' onClick={close}>
                            Close
                        </StyledButton>
                    </div>
                </StyledPopover>
            ),
        },
    },
}

const ITEMS = ['Module 1', 'Module 2', 'Module 3', 'Module 4']

const SelectModeExample = (): JSX.Element => {
    const [checkedIds, setCheckedIds] = useState<string[]>([])

    // The count and the bulk-actions bar are the app's own, in its own design; the list only reports the checked ids.
    return (
        <div className='flex flex-col gap-2'>
            <p className='m-0 text-sm leading-5 text-delta-600'>{ITEMS.length} items</p>
            {checkedIds.length > 0 && (
                <div className='flex items-center gap-4 rounded-lg bg-delta-50 px-4 py-2 text-base text-delta-800'>
                    {checkedIds.length} selected
                    <StyledButton dataTest='bulk-archive' variant='outlined' size='small'>
                        Archive
                    </StyledButton>
                </div>
            )}
            <CardList
                dataTest='card-list-select'
                items={ITEMS}
                getId={(item) => item}
                cardHeadingLevel={3}
                selection={{
                    checkedIds,
                    onCheckedChange: (id, checked) =>
                        setCheckedIds((ids) => (checked ? [...ids, id] : ids.filter((value) => value !== id))),
                }}
                renderCard={(item) => (
                    <Card dataTest={`card-${item}`} title={item} open={{ href: `#${item}` }} titleChevron>
                        <SubGoalCategory />
                    </Card>
                )}
            />
        </div>
    )
}

/** Select mode (Ad Opus, Samhandling): a checkbox on every card; the app shows its bulk bar while one is checked; the title row opens the item. */
export const SelectMode: Story = {
    render: () => <SelectModeExample />,
}

const ListStatesExample = (): JSX.Element => {
    const [items, setItems] = useState(ITEMS)
    const [message, setMessage] = useState<string>()

    return (
        <CardList
            dataTest='card-list-states'
            items={items}
            getId={(item) => item}
            cardHeadingLevel={3}
            statusMessage={message}
            empty={<p className='m-0 text-base text-delta-700'>No modules yet. They show up here when your therapist sends them.</p>}
            renderCard={(item) => (
                <Card
                    dataTest={`card-${item}`}
                    title={item}
                    open={{ href: `#${item}` }}
                    titleChevron
                    footerAction={
                        <StyledButton
                            dataTest={`done-${item}`}
                            variant='outlined'
                            aria-label={`Complete, “${item}”`}
                            onClick={() => {
                                setItems((list) => list.filter((value) => value !== item))
                                setMessage(`${item} is complete and removed from the list`)
                            }}
                        >
                            Complete
                        </StyledButton>
                    }
                />
            )}
        />
    )
}

/** A card that leaves the list is announced, and focus moves to the next card (CARD-17). */
export const ListStates: Story = {
    render: () => <ListStatesExample />,
}

const OWN_LIST_KEYS: AdVocaTypeKey[] = ['module', 'document', 'questionnaire']

/**
 * A list the app draws itself, with no `CardList`: `ul`/`li`, a count above it, 8 px between cards and
 * the same heading level on every card (CARD-8, CARD-16, CARD-17). `CardList` is optional.
 */
export const OwnList: Story = {
    render: () => (
        <div className='flex flex-col gap-2'>
            <p className='m-0 text-sm leading-5 text-delta-600'>{OWN_LIST_KEYS.length} items</p>
            <ul className='m-0 flex list-none flex-col gap-2 p-0'>
                {OWN_LIST_KEYS.map((key) => (
                    <li key={key}>
                        <Card {...adVocaCardProps(key, `own-list-${key}`)} headingLevel={3} />
                    </li>
                ))}
            </ul>
        </div>
    ),
}

/** Loading keeps the card shape and marks the list busy. */
export const Loading: Story = {
    render: () => <CardList dataTest='card-list-loading' items={[]} getId={String} renderCard={() => null} cardHeadingLevel={3} loading />,
}

/** A pinned bar reserves its height as scroll padding, so a focused card is never hidden under it (PIN-8, 2.4.11). */
export const PinnedHeader: Story = {
    render: () => (
        <div className='h-[20rem] overflow-auto p-1 [scroll-padding-top:3.5rem]'>
            <div className='sticky top-0 z-10 flex h-14 items-center bg-white px-4 text-base font-semibold shadow'>My modules</div>
            <CardList
                dataTest='card-list-pinned'
                items={ITEMS}
                getId={(item) => item}
                cardHeadingLevel={3}
                renderCard={(item) => (
                    <Card {...adVocaCardProps('task', `card-${item}`)} title={item} headingLevel={undefined} />
                )}
            />
        </div>
    ),
}

// ─── Card types (ASMA-8318 §2) ──────────────────────────────────────────────

const AD_VOCA_KEYS: AdVocaTypeKey[] = ['module', 'document', 'questionnaire', 'task', 'event', 'consent']

const CardInsideWorkspace = ({ selectable }: { selectable: boolean }): JSX.Element => {
    const [checked, setChecked] = useState(false)

    return (
        <Card
            dataTest={`card-inside-workspace-${String(selectable)}`}
            title='Basic data/Order'
            open={{ href: '#inside-workspace' }}
            titleChevron
            checkbox={selectable ? { checked, onChange: setChecked } : undefined}
        >
            <SubGoalCategory />
        </Card>
    )
}

/**
 * The nine card types, each built from the shell with props and a body only (AC-1, AC-19): the Ad Voca
 * types with the CTA cue, My submissions with a title chevron as in Figma (F13), and the Ad Opus types
 * (Workspace, Card inside workspace with and without its checkbox).
 */
export const AllTypes: Story = {
    parameters: { wide: true },
    render: () => (
        <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),37.5rem))] gap-2 p-0'>
            {AD_VOCA_KEYS.map((key) => (
                <li key={key}>
                    <Card {...adVocaCardProps(key, `card-type-${key}`)} />
                </li>
            ))}
            <li>
                <Card dataTest='card-type-submissions' title='Basic data/Order' headingLevel={3} open={{ href: '#submission' }} titleChevron>
                    <ReceivedFact label='Sent' />
                </Card>
            </li>
            <li>
                <WorkspaceCard />
            </li>
            <li>
                <CardInsideWorkspace selectable />
            </li>
            <li>
                <CardInsideWorkspace selectable={false} />
            </li>
        </ul>
    ),
}

/** Every Ad Voca type at the 320 px floor and with long text: everything wraps, nothing is cut. */
export const Narrow320: Story = {
    parameters: { wide: true },
    render: () => (
        <ul className='m-0 flex w-[320px] list-none flex-col gap-2 p-0'>
            {AD_VOCA_KEYS.map((key) => (
                <li key={key}>
                    <Card {...adVocaCardProps(key, `card-narrow-${key}`)} title={`${LONG_TITLE} ${LONG_TITLE}`} />
                </li>
            ))}
        </ul>
    ),
}

// ─── Gallery (Figma 6070:46996) ─────────────────────────────────────────────

const GALLERY_COLUMNS: { key: string; label: string; props: Partial<CardProps> }[] = [
    { key: 'enabled', label: 'Enabled', props: {} },
    { key: 'hovered', label: 'Hovered', props: {} },
    { key: 'focused', label: 'Focused', props: {} },
    { key: 'selected', label: 'Selected (Viewing now)', props: { selected: true } },
    { key: 'selected-focused', label: 'Selected + Focused', props: { selected: true } },
    { key: 'selected-hovered', label: 'Selected + Hovered', props: { selected: true } },
    { key: 'overdue', label: 'Overdue', props: { status: undefined, overdue: OVERDUE } },
    { key: 'static', label: 'Read-only', props: { readOnly: true, status: undefined } },
    { key: 'disabled', label: 'Disabled', props: { disabled: true, status: STATUS_AVAILABLE_LATER } },
    { key: 'pressed', label: 'Pressed', props: {} },
]

/** A disabled Module says when it opens instead of when it was sent (Figma 7334:33933); other types keep their body, e.g. the Event date. */
const disabledBody = (row: AdVocaTypeKey, column: string): Partial<CardProps> =>
    column === 'disabled' && row === 'module' ? { children: <ScheduledFact /> } : {}

/**
 * Static matrix replicating Figma 6070:46996 (Ad Voca card states). Hover, focus and pressed are
 * forced with `storybook-addon-pseudo-states` on the card and its link.
 *
 * Where the contract differs from the Figma concept, the contract is drawn (§10):
 * - Selected keeps Figma's 2px `border/selected` edge and adds "Viewing now" (Q4).
 * - F4: titles wrap in full, no two-line clamp.
 * - Read-only is "Static": no cue, no hover.
 * - Disabled (Figma 7334:33933): opens nothing and shows no CTA; grey fill and leading edge.
 */
export const Gallery: Story = {
    parameters: {
        wide: true,
        pseudo: {
            // Hover follows the link's hit area, so the pointer is forced on the link (and the card it sits in).
            hover: [
                '[data-state="hovered"] > div',
                '[data-state="hovered"] [data-card-link]',
                '[data-state="selected-hovered"] > div',
                '[data-state="selected-hovered"] [data-card-link]',
            ],
            focusVisible: ['[data-state="focused"] [data-card-link]', '[data-state="selected-focused"] [data-card-link]'],
            active: ['[data-state="pressed"] [data-card-link]'],
        },
    },
    render: () => (
        <table className='w-max border-collapse'>
            <thead>
                <tr>
                    <th className='p-2 text-left text-sm text-delta-600'>Type</th>
                    {GALLERY_COLUMNS.map((column) => (
                        <th key={column.key} className='p-2 text-left text-sm text-delta-600'>
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {AD_VOCA_KEYS.map((row) => (
                    <tr key={row}>
                        <th className='p-2 text-left align-top text-sm text-delta-600'>{row}</th>
                        {GALLERY_COLUMNS.map((column) => (
                            <td key={column.key} className='min-w-[22rem] p-2 align-top' data-state={column.key}>
                                <Card {...adVocaCardProps(row, `gallery-${row}-${column.key}`)} {...column.props} {...disabledBody(row, column.key)} headingLevel={4} />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    ),
}
