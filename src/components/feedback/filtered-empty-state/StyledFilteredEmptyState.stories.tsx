import type { Meta, StoryObj } from '@storybook/react-vite'

import { Stack } from 'src/components/mui-compat'

import { StyledFilteredEmptyState } from './StyledFilteredEmptyState'

const meta = {
    title: 'Feedback/Filtered Empty State',
    component: StyledFilteredEmptyState,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Filters empty state](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=37513-171511) — empty text delta-500 (14/20); title Helper Semibold 14/20 delta-800; description Helper 14/20 delta-600; reset = medium Tertiary button (gama-500).',
            },
        },
    },
    args: {
        dataTest: 'filtered-empty-state',
        isFiltered: true,
    },
} satisfies Meta<typeof StyledFilteredEmptyState>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
    // axe: color-contrast (text/background contrast below the 4.5:1 threshold). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: {
        onResetFilters: () => undefined,
    },
}

export const Variants: Story = {
    // axe: color-contrast (text/background contrast below the 4.5:1 threshold). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
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
