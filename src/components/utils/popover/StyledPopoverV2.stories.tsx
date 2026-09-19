import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { FilterIcon } from 'src/components/icons/filter-icon/FilterIcon'
import { InfoOutlineIcon } from 'src/components/icons/info-outline-icon/InfoOutlineIcon'
import { StyledPopoverV2 } from './StyledPopoverV2'
import { PopoverGallery } from './story/PopoverGallery'
import { PopoverPlayground } from './story/PopoverPlayground'
import {
    ChipGroup,
    countActive,
    EGENRAPPORTERING,
    EMPTY_FILTER,
    KARTLEGGING,
    matchCountFor,
    noop,
    toggleInList,
    type FilterState,
} from './story/popoverStoryFixtures'

const meta = {
    title: 'Utils/Styled Popover V2',
    component: StyledPopoverV2,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: [
                    'Figma: [Popover](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=44531-233781)',
                    '· Spec: [ASMA-8183](https://carasent.atlassian.net/browse/ASMA-8183)',
                    '',
                    'The Design System popover: an anchored surface with an optional title, a close control',
                    'and two optional footer rows. One implementation, two variants chosen by **content**,',
                    'not by breakpoint.',
                    '',
                    '- **info** — read-only. A plain container referenced by `aria-describedby`; focus moves',
                    '  to the container on open and `Tab` leaves and closes it.',
                    '- **action** — interactive, `role="dialog"`, focus trapped, focus moves to the first',
                    '  control. Covers the **Filter** pattern (every change applies immediately, `Nullstill`',
                    '  clears) and the **Actions** pattern (a list of buttons; activation closes the surface',
                    '  via the `close()` render-prop argument).',
                    '',
                    'Deliberately **no `role="menu"` and no arrow-key navigation** — menu semantics cannot',
                    'coexist with the dialog model Filter uses, so everything inside is reached with `Tab`.',
                    'Deliberately **no arrow/anchor pointer** either: the surface is edge-aligned at an 8px',
                    'offset and proximity carries the relationship.',
                    '',
                    '**Sizing** — min-width 240px, max-width 360px (info) / 400px (action), max-height 60vh',
                    'with the body scrolling while the title and footers stay put. Below 744px the surface',
                    'takes `100vw - 32px` and an info popover is pinned below its trigger.',
                    '',
                    '**Footer rows** come straight from Figma. The *Reset filter* row is `space-between`:',
                    '`viewResultsAction` on the left (the live match count, which closes the surface — the',
                    'filter already applied) and `resetAction` on the right. The *Actions* row',
                    '(`footerActions`) is one right-aligned outlined button. Each of those slots, like',
                    '`children`, may be a render-prop receiving `close()`.',
                    '',
                    '**Where to look first** — `Gallery` shows every anatomy side by side; `Playground` lets',
                    'you switch the same properties on a real popover and operate it.',
                    '',
                    '**The consumer owns**: the trigger element (spread `triggerProps`, wire `ref`), the',
                    'filter state, the `aria-live` region announcing the new result count, and a 300ms',
                    'debounce on text filtering. Below 744px Filter/Actions should become a Bottom Sheet',
                    '(ASMA-8184) — not yet available, so they stay anchored for now.',
                ].join('\n'),
            },
        },
    },
} satisfies Meta<typeof StyledPopoverV2>

export default meta
type Story = StoryObj<typeof StyledPopoverV2>

/**
 * Opens the surface so the story renders what it is actually about. This is what puts the open
 * popover in front of the axe run (the `storybook` vitest project) and in the VRT baseline — the
 * closed trigger alone would exercise neither.
 */
const openFrom = (triggerName: string | RegExp) =>
    async ({ canvasElement }: { canvasElement: HTMLElement }): Promise<void> => {
        const trigger = await within(canvasElement).findByRole('button', { name: triggerName })
        await userEvent.click(trigger)
        await waitFor(async () => {
            await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        })
    }

/*
 * Action triggers below are `contained` rather than the more natural `outlined`.
 * `StyledButton`'s `aria-expanded='true'` state paints `gama-500` text on a `gama-50` fill, which is
 * 4.05:1 (default) / 4.23:1 (fretex) / 4.22:1 (jade) — under the 4.5:1 WCAG 1.4.3 AA floor — for the
 * `outlined`, `text` and `textGray` variants alike. That is a pre-existing defect in the shared
 * button tokens, not in this component, and fixing it is a fleet-wide design-token change (every
 * menu/select/filter trigger) that needs its own ticket. `contained` clears the bar at 4.62:1.
 */

/**
 * Every anatomy the Figma component can produce, side by side — the reference matrix of its three
 * boolean properties (Title, Reset filter, Actions) plus both widths and the scrolling case.
 * Static on purpose; use `Playground` to operate them.
 */
export const Gallery: Story = {
    parameters: { layout: 'fullscreen' },
    render: () => <PopoverGallery />,
}

/**
 * Switch the Figma properties on and off and operate a real popover in every combination —
 * keyboard, focus return, Escape, outside press, immediate-apply filtering and 60vh scrolling.
 * The event log shows what the component reported.
 */
export const Playground: Story = {
    parameters: { layout: 'fullscreen' },
    render: () => <PopoverPlayground />,
}

const InfoExample = ({ withTitle }: { withTitle: boolean }): JSX.Element => (
    <StyledPopoverV2
        dataTest='info-popover'
        title={withTitle ? 'Løpenummer' : undefined}
        renderTrigger={({ ref, triggerProps }) => (
            <StyledButton
                dataTest='info-popover-trigger'
                refLink={ref}
                type='button'
                variant='textGray'
                // The name says what opens, not what the glyph looks like.
                aria-label='Om løpenummer'
                startIcon={<InfoOutlineIcon aria-hidden focusable='false' />}
                {...triggerProps}
            />
        )}
    >
        Løpenummeret tildeles automatisk når søknaden registreres, og kan ikke endres i ettertid. Det er unikt per
        virksomhet og brukes som referanse i all korrespondanse.
    </StyledPopoverV2>
)

/** Read-only explanation anchored to an inline ⓘ — the most common use. */
export const InfoWithTitle: Story = {
    render: () => <InfoExample withTitle />,
    play: openFrom('Om løpenummer'),
}

/** Short explanations do not need a heading; the close control is still required. */
export const InfoWithoutTitle: Story = {
    render: () => <InfoExample withTitle={false} />,
    play: openFrom('Om løpenummer'),
}

const FilterExample = (): JSX.Element => {
    const [filter, setFilter] = useState<FilterState>(EMPTY_FILTER)
    const activeCount = countActive(filter)
    const matchCount = matchCountFor(activeCount)

    return (
        <div className='flex flex-col items-start gap-4'>
            <StyledPopoverV2
                dataTest='filter-popover'
                variant='action'
                title='Small set of controls'
                renderTrigger={({ ref, triggerProps }) => (
                    <StyledButton
                        dataTest='filter-popover-trigger'
                        refLink={ref}
                        type='button'
                        variant='contained'
                        startIcon={<FilterIcon />}
                        {...triggerProps}
                    >
                        {activeCount > 0 ? `Filter (${activeCount})` : 'Filter'}
                    </StyledButton>
                )}
                viewResultsAction={({ close }) => (
                    <StyledButton dataTest='filter-popover-view' type='button' variant='text' onClick={close}>
                        {`Vis resultater (${matchCount})`}
                    </StyledButton>
                )}
                resetAction={
                    <StyledButton
                        dataTest='filter-popover-reset'
                        type='button'
                        variant='text'
                        disabled={activeCount === 0}
                        onClick={() => {
                            setFilter(EMPTY_FILTER)
                        }}
                    >
                        Nullstill
                    </StyledButton>
                }
            >
                <ChipGroup
                    heading='Kartlegging før oppstart'
                    options={KARTLEGGING}
                    type='checkbox'
                    isSelected={(option) => filter.kartlegging.includes(option)}
                    onToggle={(option) => {
                        setFilter((previous) => ({
                            ...previous,
                            kartlegging: toggleInList(previous.kartlegging, option),
                        }))
                    }}
                />
                <ChipGroup
                    heading='Daglig egenrapportering under opphold'
                    options={EGENRAPPORTERING}
                    type='radio'
                    isSelected={(option) => filter.egenrapportering === option}
                    onToggle={(option) => {
                        setFilter((previous) => ({ ...previous, egenrapportering: option }))
                    }}
                />
            </StyledPopoverV2>
            {/* The list behind the popover owns the announcement — applying a filter changes the
                result set, and without this nothing confirms it to a screen reader user. */}
            <p aria-live='polite' className='m-0 text-base leading-6 text-delta-700'>
                {`${matchCount} søknader`}
            </p>
        </div>
    )
}

/**
 * Filter pattern: every change applies immediately to the list behind — there is no apply step.
 * `Nullstill` clears every criterion, and the trigger label carries the active count so the state
 * is readable without opening the popover.
 */
export const ActionFilter: Story = {
    render: () => <FilterExample />,
    play: openFrom('Filter'),
}

const ActionsExample = (): JSX.Element => {
    const [lastAction, setLastAction] = useState<string>()

    return (
        <div className='flex flex-col items-start gap-4'>
            <StyledPopoverV2
                dataTest='actions-popover'
                variant='action'
                ariaLabel='Handlinger for søknaden'
                renderTrigger={({ ref, triggerProps }) => (
                    <StyledButton
                        dataTest='actions-popover-trigger'
                        refLink={ref}
                        type='button'
                        variant='contained'
                        {...triggerProps}
                    >
                        Handlinger
                    </StyledButton>
                )}
            >
                {({ close }) =>
                    ['Arkiver', 'Dupliser', 'Eksporter'].map((action) => (
                        <StyledButton
                            key={action}
                            dataTest={`action-${action}`}
                            type='button'
                            variant='textGray'
                            onClick={() => {
                                setLastAction(action)
                                close()
                            }}
                        >
                            {action}
                        </StyledButton>
                    ))
                }
            </StyledPopoverV2>
            <p className='m-0 text-base leading-6 text-delta-700'>{lastAction ?? 'Ingen handling valgt'}</p>
        </div>
    )
}

/**
 * Actions pattern: a plain list of buttons, reached with `Tab`. Activating one applies it and
 * closes the surface through the `close()` argument of the children render-prop. No `role="menu"`,
 * so arrow keys deliberately do nothing.
 */
export const ActionsList: Story = {
    render: () => <ActionsExample />,
    play: openFrom('Handlinger'),
}

const ScrollingExample = (): JSX.Element => (
    <StyledPopoverV2
        dataTest='scrolling-popover'
        variant='action'
        title='Content taller than 60vh'
        renderTrigger={({ ref, triggerProps }) => (
            <StyledButton
                dataTest='scrolling-popover-trigger'
                refLink={ref}
                type='button'
                variant='contained'
                {...triggerProps}
            >
                Tall filter
            </StyledButton>
        )}
        viewResultsAction={
            <StyledButton dataTest='scrolling-popover-view' type='button' variant='text'>
                Vis resultater (12)
            </StyledButton>
        }
        resetAction={
            <StyledButton dataTest='scrolling-popover-reset' type='button' variant='text'>
                Nullstill
            </StyledButton>
        }
        footerActions={
            <StyledButton dataTest='scrolling-popover-action' type='button' variant='outlined'>
                Action
            </StyledButton>
        }
    >
        {Array.from({ length: 8 }, (_unused, index) => (
            <ChipGroup
                key={index}
                heading={`Gruppe ${index + 1}`}
                options={KARTLEGGING}
                type='checkbox'
                isSelected={() => false}
                onToggle={noop}
            />
        ))}
    </StyledPopoverV2>
)

/** The body scrolls past 60vh while the title, the close control and both footer rows stay put. */
export const LongContentScrolls: Story = {
    render: () => <ScrollingExample />,
    play: openFrom('Tall filter'),
}

/** Opening a second popover closes the first — the outside press that opens B dismisses A. */
export const OnlyOneOpenAtATime: Story = {
    render: () => (
        <div className='flex w-[900px] justify-between'>
            <StyledPopoverV2
                dataTest='first-popover'
                title='Første'
                renderTrigger={({ ref, triggerProps }) => (
                    <StyledButton dataTest='first-popover-trigger' refLink={ref} type='button' {...triggerProps}>
                        Første
                    </StyledButton>
                )}
            >
                Åpne den andre — denne lukkes.
            </StyledPopoverV2>
            <StyledPopoverV2
                dataTest='second-popover'
                title='Andre'
                renderTrigger={({ ref, triggerProps }) => (
                    <StyledButton dataTest='second-popover-trigger' refLink={ref} type='button' {...triggerProps}>
                        Andre
                    </StyledButton>
                )}
            >
                Bare én popover er åpen om gangen.
            </StyledPopoverV2>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const first = await canvas.findByRole('button', { name: 'Første' })
        const second = await canvas.findByRole('button', { name: 'Andre' })

        await userEvent.click(first)
        await expect(first).toHaveAttribute('aria-expanded', 'true')

        // The press that opens the second is an outside press for the first, which dismisses it.
        await userEvent.click(second)
        await waitFor(async () => {
            await expect(first).toHaveAttribute('aria-expanded', 'false')
        })
        await expect(second).toHaveAttribute('aria-expanded', 'true')
    },
}
