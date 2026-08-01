import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { VirtualizedList, type VirtualizedListProps } from './VirtualizedList'

interface DemoRow {
    id: string
    label: string
}

const rows = (count: number): DemoRow[] =>
    Array.from({ length: count }, (_, index) => ({ id: `row-${index}`, label: `Rad ${index + 1}` }))

const DemoRowView = ({ row }: { row: DemoRow }) => (
    <div className='flex items-center border-b border-gray-200 px-4 py-3 text-sm'>{row.label}</div>
)

const meta = {
    title: 'DataDisplay/VirtualizedList',
    component: VirtualizedList,
    tags: [],
    argTypes: {},
    args: {
        className: 'h-[400px] overflow-auto rounded-lg border border-gray-200',
        getItemKey: (row: DemoRow) => row.id,
        items: rows(5_000),
        renderItem: (row: DemoRow) => <DemoRowView row={row} />,
    },
} satisfies Meta<typeof VirtualizedList<DemoRow>>

export default meta

type Story = StoryObj<VirtualizedListProps<DemoRow>>

/** 5,000 rows — the point being that only the visible handful are ever in the DOM. */
export const FiveThousandRows: Story = {
    args: { dataTest: 'virtualized-list-demo' },
    play: async ({ canvas }) => {
        const list = canvas.getByTestId('virtualized-list-demo')

        // The component's whole value in one assertion: 5,000 items, a tiny fraction mounted.
        const mounted = list.querySelectorAll('[data-index]').length
        await expect(mounted).toBeGreaterThan(0)
        await expect(mounted).toBeLessThan(60)

        // The spacer still carries the full height, so the scrollbar reflects all 5,000 rows rather
        // than only the mounted ones — the mistake this component exists to prevent.
        const spacer = list.firstElementChild as HTMLElement
        await expect(Number.parseInt(spacer.style.height, 10)).toBeGreaterThan(5_000)
    },
}

/** Variable heights need no configuration — the estimate only seeds the first paint. */
export const VariableHeights: Story = {
    args: {
        estimatedItemHeight: 48,
        items: rows(500),
        renderItem: (row: DemoRow, index: number) => (
            <div className='border-b border-gray-200 px-4 py-3 text-sm' style={{ height: 40 + (index % 5) * 24 }}>
                {row.label}
            </div>
        ),
    },
}

export const Empty: Story = {
    args: {
        className: undefined,
        emptyState: <p className='p-8 text-center text-sm text-gray-500'>Ingen rader</p>,
        items: [],
    },
}
