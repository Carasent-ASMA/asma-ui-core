import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'

import { SnackbarProvider } from 'src/components/feedback/snack-bar/SnackbarProvider'
import { StyledTable } from '../components/StyledTableIndex'

interface Report {
    id: string
    title: string
    owner: string
    status: string
    updated: string
}

const reports: Report[] = [
    { id: 'r-1', title: 'Report A', owner: 'Team 1', status: 'Open', updated: '2026-11-01' },
    { id: 'r-2', title: 'Report B', owner: 'Team 2', status: 'Closed', updated: '2026-10-28' },
    { id: 'r-3', title: 'Report C', owner: 'Team 1', status: 'Open', updated: '2026-10-30' },
    { id: 'r-4', title: 'Report D', owner: 'Team 3', status: 'Draft', updated: '2026-11-02' },
]

const columns: ColumnDef<Report>[] = [
    { accessorKey: 'title', header: 'Title', size: 180 },
    { accessorKey: 'owner', header: 'Owner', size: 160 },
    { accessorKey: 'status', header: 'Status', size: 140 },
    { accessorKey: 'updated', header: 'Updated', size: 140 },
    { id: 'notes', header: 'Notes', size: 160, enableSorting: false, cell: () => '-' },
]

const columnsWithControl: ColumnDef<Report>[] = [
    ...columns.slice(0, 4),
    {
        id: 'open',
        header: 'Open',
        size: 120,
        enableSorting: false,
        cell: ({ row }) => <button type='button'>{`Open ${row.original.title}`}</button>,
    },
    { id: 'last', header: 'Last', size: 120, enableSorting: false, cell: () => '-' },
]

const meta = {
    title: 'Table/Keyboard reach',
    component: StyledTable,
    args: { columns: [], data: [] },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof StyledTable>

export default meta
type Story = StoryObj<typeof meta>

/**
 * ASMA-8702: Tab goes from the button before the table through each sortable header and the column settings pin (in visual
 * order), then to the active row; Shift+Tab from a row comes back to the pin. Enter or Space on a header sorts it; Enter on
 * the pin opens the column settings, where Tab reaches *Reset columns* (it puts widths and order back, and shows a snackbar,
 * which the story mounts as an app does). The table resizes by default (ASMA-8597), and its resize handles are not tab
 * stops. Fake data.
 */
export const KeyboardReach: Story = {
    render: () => (
        <div className='flex w-[860px] flex-col items-start gap-3'>
            <button type='button'>Before the table</button>
            <StyledTable<Report> columns={columns} data={reports} hideFooter locale='en' uniqueKey='kbd-reach' />
            <button type='button'>After the table</button>
            <SnackbarProvider />
        </div>
    ),
}

/**
 * ASMA-8702: with `hideHeader` the header is hidden but stays in the accessibility tree, and it is not in the tab order: Tab
 * goes from the button before the table straight to the active row. Fake data.
 */
export const HiddenHeader: Story = {
    render: () => (
        <div className='flex w-[860px] flex-col items-start gap-3'>
            <button type='button'>Before the table</button>
            <StyledTable<Report> columns={columns} data={reports} hideFooter hideHeader locale='en' uniqueKey='kbd-hidden' />
            <button type='button'>After the table</button>
        </div>
    ),
}

/**
 * ASMA-8702: a table whose rows hold a control of their own. Tab from the last header control enters the active row, and
 * Shift+Tab from a row returns to that control. Shift+Tab from the button after the table follows the browser's order, so it
 * lands on the last control in the rows, not on the active row (the same as before ASMA-8702). Fake data.
 */
export const RowControls: Story = {
    render: () => (
        <div className='flex w-[860px] flex-col items-start gap-3'>
            <button type='button'>Before the table</button>
            <StyledTable<Report> columns={columnsWithControl} data={reports} hideFooter locale='en' uniqueKey='kbd-row-controls' />
            <button type='button'>After the table</button>
        </div>
    ),
}
