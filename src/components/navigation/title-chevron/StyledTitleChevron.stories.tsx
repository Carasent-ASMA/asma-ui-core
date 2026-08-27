import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StyledTitleChevron } from './StyledTitleChevron'

const meta = {
    title: 'Navigation/Title Chevron',
    component: StyledTitleChevron,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: [
                    'Figma: [Title + Chevron](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=32027-180872) —',
                    'a clickable title row indicating that a card or list-item header navigates to another page, dialog or section',
                    '(calendars, network cards, pathfinder lists).',
                    '',
                    'Behavior contract:',
                    '',
                    '- The chevron is **always visible** — never revealed on hover.',
                    '- On hover/focus the row turns `gama-500` and the chevron shifts **+4px right** with no layout shift (transform only).',
                    '- The **entire row** (text + chevron) is one native `<button>` with a minimum **44px** tap target,',
                    '  full keyboard support (Enter/Space) and a visible `gama-400` focus ring.',
                    '- Long titles truncate to one line; the chevron never wraps or shrinks.',
                    '- Identical on desktop and mobile — the row spans its container, so the tap target grows with it.',
                ].join('\n'),
            },
        },
    },
} satisfies Meta<typeof StyledTitleChevron>

export default meta
type Story = StoryObj<typeof StyledTitleChevron>

const noop = () => undefined

export const Default: Story = {
    render: () => (
        <div className='w-80'>
            <StyledTitleChevron dataTest='title-chevron-default' onClick={noop}>
                Kartlegginger
            </StyledTitleChevron>
        </div>
    ),
}

/** All interaction states side by side (forced via the pseudo-states addon's `pseudo-*` classes). */
export const States: Story = {
    render: () => (
        <div className='flex w-96 flex-col gap-2'>
            {(
                [
                    ['Default', ''],
                    ['Hovered', 'pseudo-hover'],
                    ['Focused', 'pseudo-focus-visible'],
                    ['Active', 'pseudo-active'],
                ] as const
            ).map(([label, pseudoClass]) => (
                <div key={label} className='flex items-center gap-6'>
                    <span className='w-20 shrink-0 text-sm text-delta-600'>{label}</span>
                    <div className='min-w-0 flex-1'>
                        <StyledTitleChevron
                            dataTest={`title-chevron-${label}`}
                            onClick={noop}
                            className={pseudoClass}
                        >
                            Nettverk
                        </StyledTitleChevron>
                    </div>
                </div>
            ))}
        </div>
    ),
}

/** A long title truncates to one line — the chevron keeps its size and position in the row. */
export const Truncation: Story = {
    render: () => (
        <div className='w-64'>
            <StyledTitleChevron dataTest='title-chevron-truncated' onClick={noop}>
                En veldig lang tittel som ikke får plass på én linje i kortet
            </StyledTitleChevron>
        </div>
    ),
}

/** `size='large'` (18/28, 24px chevron) for widget headings; default `medium` (16/24, 20px). */
export const Sizes: Story = {
    render: () => (
        <div className='flex w-80 flex-col gap-2'>
            <StyledTitleChevron dataTest='title-chevron-medium' onClick={noop}>
                Medium heading
            </StyledTitleChevron>
            <StyledTitleChevron dataTest='title-chevron-large' size='large' onClick={noop}>
                Large heading
            </StyledTitleChevron>
        </div>
    ),
}

/** Real usage: card and list-item headers where the title leads to a detail view. */
export const PlacementInContext: Story = {
    render: () => (
        <div className='flex w-96 flex-col gap-4'>
            <div className='rounded-lg border border-solid border-delta-200 bg-white px-4 py-3'>
                <StyledTitleChevron dataTest='card-title' onClick={noop}>
                    Ola Nordmann
                </StyledTitleChevron>
                <div className='text-sm text-delta-600'>Vernepleier · Avdeling Nord</div>
            </div>
            <ul className='m-0 list-none rounded-lg border border-solid border-delta-200 bg-white p-0'>
                {['Kartlegginger', 'Aktiviteter', 'Dokumenter'].map((label, index) => (
                    <li key={label} className={index > 0 ? 'border-0 border-t border-solid border-delta-200' : ''}>
                        <StyledTitleChevron dataTest={`list-title-${label}`} onClick={noop} className='px-4'>
                            {label}
                        </StyledTitleChevron>
                    </li>
                ))}
            </ul>
        </div>
    ),
}

const InteractiveExample = () => {
    const [lastClicked, setLastClicked] = useState('—')
    return (
        <div className='flex w-96 flex-col gap-3'>
            {['Kalender', 'Nettverk', 'Stifinner'].map((label) => (
                <div key={label} className='rounded-lg border border-solid border-delta-200 bg-white px-4 py-1'>
                    <StyledTitleChevron dataTest={`interactive-${label}`} onClick={() => setLastClicked(label)}>
                        {label}
                    </StyledTitleChevron>
                </div>
            ))}
            <div className='text-sm text-delta-600'>
                Navigated to: <span className='font-semibold text-delta-800'>{lastClicked}</span>
            </div>
        </div>
    )
}

/** Interactive demo — click or Tab + Enter/Space to "navigate". */
export const Interactive: Story = {
    render: () => <InteractiveExample />,
}
