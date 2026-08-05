import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'
import { PathfinderCard, type PathfinderCardItem } from '../PathfinderCard'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { StyledButton } from 'src/components/inputs/button'
import { EditSquareIcon } from 'src/components/icons'
import clsx from 'clsx'

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

type StoryArgs = {
    breakpoint: Breakpoint
    withAvatar: boolean
    expanded: boolean
    items: PathfinderCardItem[]
    onToggleExpanded: () => void
}

const FRAME_WIDTHS: Record<Breakpoint, number> = {
    mobile: 743,
    tablet: 744,
    desktop: 1024,
}

const AVATAR_SRC = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80'

function Avatar({ withAvatar }: { withAvatar: boolean }) {
    if (!withAvatar) return null

    return <img src={AVATAR_SRC} alt='Recipient avatar' className='size-10 rounded-full object-cover' />
}

function Lead({ withAvatar }: { withAvatar: boolean }) {
    return (
        <div className={clsx('flex min-w-0 items-center gap-4', withAvatar ? 'pl-0' : 'pl-4')}>
            <Avatar withAvatar={withAvatar} />
            <div className='min-w-0'>
                <div className='truncate text-lg font-semibold text-delta-900'>Ola Nordmann</div>
            </div>
        </div>
    )
}

function FieldChip({ label, value }: { label: string; value: string; compact: boolean }) {
    return (
        <div className='inline-flex max-w-full items-center whitespace-nowrap text-sm text-delta-700'>
            <span className='text-delta-600'>{label}:</span>
            <span className='ml-1 font-semibold text-delta-800'>{value}</span>
        </div>
    )
}

function buildItems(): PathfinderCardItem[] {
    return [
        {
            id: 'lopenummer',
            order: 1,
            // estimatedWidth: 110,
            render: ({ compact }) => <FieldChip label='Løpenummer' value='12498' compact={compact} />,
        },
        {
            id: 'start',
            order: 2,
            // estimatedWidth: 110,
            render: ({ compact }) => <FieldChip label='Start' value='12.03.2025' compact={compact} />,
        },
        {
            id: 'slutt',
            order: 3,
            // estimatedWidth: 110,
            render: ({ compact }) => <FieldChip label='Slutt' value='12.09.2025' compact={compact} />,
        },
        {
            id: 'tiltak',
            order: 4,
            // estimatedWidth: 260,
            render: ({ compact }) => (
                <FieldChip label='Tiltak' value='ASVL Arbeidsforberedende trening' compact={compact} />
            ),
        },
        {
            id: 'fodselsdato',
            order: 5,
            // estimatedWidth: 130,
            render: ({ compact }) => <FieldChip label='Fødselsdato' value='24.01.1990' compact={compact} />,
        },
        {
            id: 'telefon',
            order: 6,
            // estimatedWidth: 140,
            render: ({ compact }) => <FieldChip label='Tlf.' value='+47 999 99 999' compact={compact} />,
        },
        {
            id: 'nav-email',
            order: 7,
            // estimatedWidth: 240,
            render: ({ compact }) => (
                <FieldChip label='NAV contact email' value='ola.nordmann@nav.no' compact={compact} />
            ),
        },
        {
            id: 'label-1',
            order: 8,
            // estimatedWidth: 170,
            render: ({ compact }) => <FieldChip label='Label' value='Data tag: Aktiv' compact={compact} />,
        },
        {
            id: 'label-2',
            order: 9,
            // estimatedWidth: 190,
            render: ({ compact }) => <FieldChip label='Label' value='Data tag: Oppfølging' compact={compact} />,
        },
    ]
}

function StoryShell({
    breakpoint,
    withAvatar,
    expanded,
}: {
    breakpoint: Breakpoint
    withAvatar: boolean
    expanded: boolean
}) {
    const [open, setOpen] = useState(expanded)

    const items = useMemo(() => buildItems(), [])

    const frameWidth = FRAME_WIDTHS[breakpoint]

    return (
        <div className='space-y-4 p-4'>
            <div className='rounded-xl border border-gama-300 bg-white p-3 text-sm text-delta-700'>
                {breakpoint} · {withAvatar ? 'with avatar' : 'without avatar'} · {open ? 'expanded' : 'collapsed'}
            </div>

            <div style={{ width: frameWidth }} className='max-w-full'>
                <PathfinderCard
                    items={items}
                    expanded={open}
                    onToggleExpanded={() => setOpen((v) => !v)}
                    leadSlot={<Lead withAvatar={withAvatar} />}
                    // leadReservePx={withAvatar ? 180 : 132}
                    actionSlot={
                        open ? (
                            <StyledTooltip title={'test'} arrow>
                                <div>
                                    <StyledButton
                                        disabled={false}
                                        dataTest='pathfinder-bar-edit-button'
                                        size='small'
                                        variant='text'
                                        startIcon={<EditSquareIcon width={20} height={20} />}
                                        onClick={() => console.log('handle edit')}
                                    >
                                        Edit
                                    </StyledButton>
                                </div>
                            </StyledTooltip>
                        ) : null
                    }
                    // actionReservePx={open ? 140 : 42}
                />
            </div>
        </div>
    )
}

const meta = {
    title: 'DataDisplay/Pathfinder Card',
    component: PathfinderCard,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Responsive one-row participant bar that packs as many fields as fit in collapsed mode and reveals the rest when expanded.',
            },
        },
    },
    argTypes: {
        breakpoint: {
            control: 'radio',
            options: ['mobile', 'tablet', 'desktop'],
        },
        withAvatar: {
            control: 'boolean',
        },
        expanded: {
            control: 'boolean',
        },
    },
    args: {
        breakpoint: 'desktop',
        withAvatar: false,
        expanded: false,
    },
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<StoryArgs>

export const DesktopCollapsedWithoutAvatar: Story = {
    args: {
        breakpoint: 'desktop',
        withAvatar: false,
        expanded: false,
    },
    render: (args) => <StoryShell {...args} />,
}

export const DesktopExpandedWithoutAvatar: Story = {
    args: {
        breakpoint: 'desktop',
        withAvatar: false,
        expanded: true,
    },
    render: (args) => <StoryShell {...args} />,
}

export const DesktopCollapsedWithAvatar: Story = {
    args: {
        breakpoint: 'desktop',
        withAvatar: true,
        expanded: false,
    },
    render: (args) => <StoryShell {...args} />,
}

export const DesktopExpandedWithAvatar: Story = {
    args: {
        breakpoint: 'desktop',
        withAvatar: true,
        expanded: true,
    },
    render: (args) => <StoryShell {...args} />,
}

export const BreakpointMatrixWithoutAvatar: Story = {
    render: () => (
        <div className='grid gap-6 p-4'>
            <StoryShell breakpoint='mobile' withAvatar={false} expanded={false} />
            <StoryShell breakpoint='mobile' withAvatar={false} expanded={true} />
            <StoryShell breakpoint='tablet' withAvatar={false} expanded={false} />
            <StoryShell breakpoint='tablet' withAvatar={false} expanded={true} />
            <StoryShell breakpoint='desktop' withAvatar={false} expanded={false} />
            <StoryShell breakpoint='desktop' withAvatar={false} expanded={true} />
        </div>
    ),
}

export const BreakpointMatrixWithAvatar: Story = {
    render: () => (
        <div className='grid gap-6 p-4'>
            <StoryShell breakpoint='mobile' withAvatar={true} expanded={false} />
            <StoryShell breakpoint='mobile' withAvatar={true} expanded={true} />
            <StoryShell breakpoint='tablet' withAvatar={true} expanded={false} />
            <StoryShell breakpoint='tablet' withAvatar={true} expanded={true} />
            <StoryShell breakpoint='desktop' withAvatar={true} expanded={false} />
            <StoryShell breakpoint='desktop' withAvatar={true} expanded={true} />
        </div>
    ),
}

export const InteractiveDemo: Story = {
    render: () => {
        const Demo = () => {
            const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop')
            const [withAvatar, setWithAvatar] = useState(true)
            const [expanded, setExpanded] = useState(false)

            return (
                <div className='space-y-4 p-4'>
                    <div className='flex flex-wrap items-center gap-3 rounded-xl border border-gama-300 bg-white p-3'>
                        <label className='flex items-center gap-2 text-sm'>
                            <span>Breakpoint</span>
                            <select
                                value={breakpoint}
                                onChange={(e) => setBreakpoint(e.target.value as Breakpoint)}
                                className='rounded-md border border-gama-300 bg-white px-2 py-1 text-sm'
                            >
                                <option value='mobile'>Mobile</option>
                                <option value='tablet'>Tablet</option>
                                <option value='desktop'>Desktop</option>
                            </select>
                        </label>

                        <label className='flex items-center gap-2 text-sm'>
                            <input
                                type='checkbox'
                                checked={withAvatar}
                                onChange={(e) => setWithAvatar(e.target.checked)}
                            />
                            With avatar
                        </label>

                        <label className='flex items-center gap-2 text-sm'>
                            <input type='checkbox' checked={expanded} onChange={(e) => setExpanded(e.target.checked)} />
                            Expanded
                        </label>
                    </div>

                    <StoryShell breakpoint={breakpoint} withAvatar={withAvatar} expanded={expanded} />
                </div>
            )
        }

        return <Demo />
    },
}
