import type { Meta, StoryObj } from '@storybook/react-vite'

import { StyledBadge } from './StyledBadge'

const meta: Meta = {
    title: 'DataDisplay/Badge',
    component: StyledBadge,
    tags: [],
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
                                <div className='inline-block h-2 w-2 rounded-full bg-gama-400' />
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
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
