import type { Meta, StoryObj } from '@storybook/react-vite'

import { Stack } from '@mui/material'

import { StyledFilteredEmptyState } from './StyledFilteredEmptyState'

const meta = {
    title: 'Feedback/Filtered Empty State',
    component: StyledFilteredEmptyState,
    tags: ['autodocs'],
    args: {
        dataTest: 'filtered-empty-state',
        isFiltered: true,
    },
} satisfies Meta<typeof StyledFilteredEmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
    args: {
        onResetFilters: () => undefined,
    },
}

export const Variants: Story = {
    render: (args) => (
        <Stack spacing={6}>
            <StyledFilteredEmptyState
                {...args}
                filteredByDefault
                onResetFilters={() => undefined}
                className='min-h-[220px]'
            />

            <StyledFilteredEmptyState
                {...args}
                filteredByDefault={false}
                onResetFilters={() => undefined}
                className='min-h-[220px]'
            />
        </Stack>
    ),
}

export const Norwegian: Story = {
    args: {
        dataTest: 'filtered-empty-state-no',
        locale: 'no',
        isFiltered: true,
        onResetFilters: () => undefined,
    },
}

export const CustomEmptyText: Story = {
    args: {
        dataTest: 'filtered-empty-state-custom-empty-text',
        emptyText: 'No work records',
        isFiltered: true,
        onResetFilters: () => undefined,
    },
}

export const WithoutFilters: Story = {
    args: {
        dataTest: 'filtered-empty-state-no-filter',
        isFiltered: false,
        onResetFilters: undefined,
    },
}
