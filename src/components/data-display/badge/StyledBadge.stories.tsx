import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { StyledBadge } from './StyledBadge'

const meta: Meta = {
    title: 'DataDisplay/Badge',
    component: StyledBadge,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Badge](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=15181-43817). Use a count when the quantity changes the action; use a dot when only unseen activity matters. The host control owns the accessible name.',
            },
        },
    },
    args: {},
    argTypes: {
        color: {
            control: 'select',
            options: ['primary', 'secondary', 'default', 'info', 'success', 'error', 'warning'],
        },
    },
} satisfies Meta<typeof StyledBadge>

export default meta
type Story = StoryObj<typeof StyledBadge>

const BADGE_TABLE_ROWS = ['Notification', 'Unread (table)', 'Filters applied'] as const

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'The two shapes side by side: a count when the quantity changes what you would do, a dot when only the fact of unseen activity matters.',
            },
        },
    },
    render: () => (
        <table className='table-fixed border-collapse text-delta-700'>
            <colgroup>
                <col className='w-[140px]' />
                <col className='w-[232px]' />
            </colgroup>
            <tbody>
                {BADGE_TABLE_ROWS.map((label, index) => (
                    <tr key={label}>
                        <td className='border border-solid border-delta-200 p-4 text-sm font-medium'>{label}</td>
                        <td className='border border-solid border-delta-200 p-4 text-center text-sm'>
                            {index === 0 ? (
                                <StyledBadge dataTest={`badge-table-${index}`} badgeContent={3} />
                            ) : (
                                <StyledBadge dataTest={`badge-table-${index}`} variant='dot' />
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    ),
}

/**
 * Each badge sits in a dashed box cut to the size Figma specifies, so a sizing regression shows
 * up here as a badge that no longer fills or no longer fits its box.
 */
const SpecBox = ({ label, width, height, children }: SpecBoxProps) => (
    <div className='flex flex-col items-center gap-2'>
        {/* `box-content` keeps the dashed rule outside the measured area, so the box is exactly
            the Figma size and the badge either fills it or visibly does not. */}
        <div
            className={`box-content flex items-center justify-center border border-dashed border-[#8747E6] ${width} ${height}`}
        >
            {children}
        </div>
        <span className='text-xs text-delta-700'>{label}</span>
    </div>
)

interface SpecBoxProps {
    label: string
    width: string
    height: string
    children: React.ReactNode
}

export const FigmaSizing: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'Figma strokes both rings on the inside, so they cost no layout space: a count is its label plus 6px either side and nothing more. That makes one digit a 20px circle and two digits a 28px pill. Drawing the ring as a CSS border instead charged 2px on top of each, which is why a one-digit count used to come out an oval.',
            },
        },
    },
    render: () => (
        <div className='flex items-end gap-6'>
            <SpecBox label='1 digit — 20×20' width='w-[20px]' height='h-[20px]'>
                <StyledBadge dataTest='sizing-one-digit' badgeContent={1} />
            </SpecBox>

            <SpecBox label='2 digits — 28×20' width='w-[28px]' height='h-[20px]'>
                <StyledBadge dataTest='sizing-two-digits' badgeContent={28} />
            </SpecBox>

            <SpecBox label='capped — label + 12' width='w-[36px]' height='h-[20px]'>
                <StyledBadge dataTest='sizing-capped' badgeContent={100} />
            </SpecBox>

            <SpecBox label='notification dot — 12×12' width='w-[12px]' height='h-[12px]'>
                <StyledBadge dataTest='sizing-dot' variant='dot' />
            </SpecBox>

            <SpecBox label='unread dot — 8×8' width='w-[8px]' height='h-[8px]'>
                <StyledBadge dataTest='sizing-unread-dot' variant='dot' purpose='unread' />
            </SpecBox>
        </div>
    ),
}

export const StandaloneDot: Story = {
    parameters: {
        docs: {
            description: {
                story: 'The same `dot` with no children, for places with no host to anchor to. It keeps its 12px box in normal flow, so neighbours lay out around it. Give it an `aria-label` when nothing nearby already announces the state.',
            },
        },
    },
    render: () => (
        <div className='flex flex-col gap-4 text-delta-700'>
            <div className='flex items-center gap-2'>
                <StyledBadge dataTest='standalone-dot-row' variant='dot' />
                <span className='text-sm'>Unread message</span>
            </div>

            <table className='table-fixed border-collapse text-sm'>
                <colgroup>
                    <col className='w-[140px]' />
                    <col className='w-[60px]' />
                </colgroup>
                <tbody>
                    <tr>
                        <td className='border border-solid border-delta-200 p-4'>Report 2024</td>
                        <td className='border border-solid border-delta-200 p-4 text-center'>
                            <StyledBadge dataTest='standalone-dot-cell' variant='dot' aria-label='Unread' />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    ),
}

export const UnreadAndFilterDots: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Figma `Parent=Unread` and `Parent=Filter`: an 8px solid `gama/500-primary` dot with no ring, smaller than the 12px notification dot above it. The two differ in meaning only, so pick the one that says why the dot is there.',
            },
        },
    },
    render: () => (
        <div className='flex flex-col gap-4 text-delta-700'>
            <div className='flex items-center gap-2'>
                <StyledBadge dataTest='unread-dot' variant='dot' purpose='unread' aria-label='Unread' />
                <span className='text-sm'>Unread message</span>
            </div>

            <div className='flex items-center gap-2'>
                <StyledBadge dataTest='notification-dot' variant='dot' />
                <span className='text-sm'>Notification dot, for size comparison</span>
            </div>

            <div className='relative inline-flex w-fit rounded border border-solid border-delta-200 px-3 py-2 text-sm'>
                Filter
                <StyledBadge
                    dataTest='filter-dot'
                    variant='dot'
                    purpose='filter'
                    className='absolute right-1 top-1'
                />
            </div>
        </div>
    ),
}

export const BadgeColorVariants: Story = {
    render: () => (
        <div className='inline-flex items-center gap-4 rounded border border-dashed border-[#8747E6] px-3 py-2'>
            <div className='flex w-5 justify-center'>
                <StyledBadge dataTest='badge-block-0' badgeContent={3} />
            </div>

            <div className='flex w-4 justify-center'>
                <StyledBadge dataTest='badge-block-1' badgeContent={3} size='small' />
            </div>

            <div className='h-2 w-2 rounded-full bg-[#CBF300]' />

            <div className='flex w-5 justify-center'>
                <StyledBadge
                    dataTest='badge-block-2'
                    badgeContent={3}
                    color='default'
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: '#E6F1B1',
                        },
                    }}
                />
            </div>

            <div className='h-2 w-2 rounded-full bg-gama-400' />
            <div className='h-2 w-2 rounded-full bg-gama-400' />
            <div className='h-2 w-2 rounded-full bg-error-500' />

            <div className='flex w-5 justify-center'>
                <StyledBadge
                    dataTest='badge-block-3'
                    badgeContent={28}
                    color='default'
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: 'var(--colors-gama-500)',
                            color: '#FFFFFF',
                        },
                    }}
                />
            </div>

            <div className='flex w-5 justify-center'>
                <StyledBadge
                    dataTest='badge-block-4'
                    badgeContent={28}
                    color='default'
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: 'var(--colors-error-100)',
                            color: 'var(--colors-error-600)',
                        },
                    }}
                />
            </div>

            {['D', 'S', 'T'].map((letter) => (
                <div className='flex w-4 justify-center' key={letter}>
                    <StyledBadge
                        dataTest={`badge-block-letter-${letter}`}
                        badgeContent={letter}
                        color='default'
                        size='small'
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: 'var(--colors-info-300)',
                                color: 'var(--colors-delta-800)',
                                width: '20px',
                            },
                        }}
                    />
                </div>
            ))}

            <div className='h-3 w-3 rounded-full bg-[#95D098]' />
        </div>
    ),
}

export const BadgeOverflowRule: Story = {
    parameters: {
        docs: {
            description: {
                story:
                    'A count always caps at `99+`; `max` is ignored. The pill grows with its label — 20px at one digit, 28px at two — because the ring is stroked inside and only the 6px side padding adds to the text.',
            },
        },
    },
    render: () => (
        <div className='flex items-center gap-4'>
            <div className='flex w-5 justify-center'>
                <StyledBadge dataTest='badge-block-overflow-1' badgeContent={1} />
            </div>

            <div className='flex w-6 justify-center'>
                <StyledBadge dataTest='badge-block-overflow-58' badgeContent={58} />
            </div>

            <div className='flex w-7 justify-center'>
                <StyledBadge dataTest='badge-block-overflow-100' badgeContent={100} />
            </div>

            <div className='flex w-7 justify-center'>
                <StyledBadge dataTest='badge-block-overflow-100-small' badgeContent={100} size='small' />
            </div>
        </div>
    ),
}

const LiveCountExample = () => {
    const [count, setCount] = useState(98)

    return (
        <StyledBadge
            dataTest='live-notification-count'
            badgeContent={count}
            statusMessage={`${count} unread notifications`}
        >
            <button
                type='button'
                aria-label={`Notifications, ${count} unread`}
                className='rounded border border-solid border-delta-400 px-4 py-2'
                onClick={() => setCount((currentCount) => currentCount + 1)}
            >
                Add notification
            </button>
        </StyledBadge>
    )
}

export const LiveCount: Story = {
    render: () => <LiveCountExample />,
}
