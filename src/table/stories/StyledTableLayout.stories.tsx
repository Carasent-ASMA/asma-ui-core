import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'
import { expect } from 'storybook/test'

import { StyledTable } from '../components/StyledTableIndex'

interface Report {
    id: string
    title: string
    owner: string
    status: string
    notes: string
}

const reports: Report[] = [
    { id: 'r-1', title: 'Report A', owner: 'Team 1', status: 'Open', notes: 'Internal' },
    { id: 'r-2', title: 'Report B', owner: 'Team 2', status: 'Closed', notes: 'Internal' },
    { id: 'r-3', title: 'Report C', owner: 'Team 1', status: 'Open', notes: 'Internal' },
]

const columns: ColumnDef<Report>[] = [
    { accessorKey: 'title', header: 'Title', size: 180 },
    { accessorKey: 'owner', header: 'Owner', size: 160 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'notes', header: 'Notes', size: 160 },
]

const meta = {
    title: 'Table/Column layout',
    component: StyledTable,
    args: { columns: [], data: [] },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof StyledTable>

export default meta
type Story = StoryObj<typeof meta>

/**
 * ASMA-8695: a table that sets `persistColumnLayout` saves each user's column order and hidden columns under their own
 * `uniqueKey` (`${uniqueKey}:column-order` and `${uniqueKey}:column-visibility`), never shared with another user, tenant or
 * table. The defaults are what the app declares in `initialState`: here *Notes* is hidden by default. A column that is hidden by
 * default does not light the dot on the column settings pin, which only marks a layout that differs from the defaults: hide
 * *Title*, show *Notes* or move a column to see it, and *Reset columns* puts the order and the visibility back (and the dot
 * goes). Fake data; the story clears its saved entries before it renders.
 */
export const PerUserColumnLayout: Story = {
    loaders: [
        () => {
            localStorage.removeItem('layout-story:column-order')
            localStorage.removeItem('layout-story:column-visibility')
            return {}
        },
    ],
    render: () => (
        <div className='w-[760px]'>
            <StyledTable<Report>
                columns={columns}
                data={reports}
                hideFooter
                initialState={{ columnVisibility: { notes: false } }}
                locale='en'
                persistColumnLayout
                uniqueKey='layout-story'
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const headers = [...canvasElement.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim() ?? '')

        // Notes is hidden by default: it is not shown, and the pin carries no dot and does not say "changed".
        await expect(headers).toContain('Title')
        await expect(headers).not.toContain('Notes')
        await expect(canvasElement.querySelector('[data-testid="column-settings-dot"]')).toBeNull()
        await expect(canvasElement.querySelector('button[aria-haspopup="true"]')?.getAttribute('aria-label')).not.toMatch(
            /changed/i,
        )
    },
}
