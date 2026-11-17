import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
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

const rowActions = (): { label: string; onClick: () => void }[] => [
    { label: 'Open', onClick: () => undefined },
    { label: 'Archive', onClick: () => undefined },
]

/** 30 centre columns (virtualised above 20), with a button in columns 1, 12, 25 and 30. */
const wideColumns: ColumnDef<Report>[] = Array.from({ length: 30 }, (_, index) => {
    const column = index + 1

    return {
        id: `c${String(column)}`,
        header: `Column ${String(column)}`,
        size: 150,
        accessorFn: (report: Report) => report.title,
        cell: ({ row }) =>
            [1, 12, 25, 30].includes(column) ? (
                <button type='button'>{`Act ${String(column)} ${row.original.title}`}</button>
            ) : (
                `${row.original.title} · ${String(column)}`
            ),
    }
})

/** Every story frames its table with a button before and after it, to Tab into and out of. */
const betweenButtons: Decorator = (Story) => (
    <div className='flex w-[860px] flex-col items-start gap-3'>
        <button type='button'>Before the table</button>
        <Story />
        <button type='button'>After the table</button>
    </div>
)

const meta = {
    title: 'Table/Keyboard reach',
    component: StyledTable,
    args: { columns: [], data: [] },
    parameters: { layout: 'centered' },
    decorators: [betweenButtons],
} satisfies Meta<typeof StyledTable>

export default meta
type Story = StoryObj<typeof meta>

/**
 * ASMA-8875 (WAI-ARIA Grid): Tab enters and leaves the table, the arrow keys move inside. Tab from the button before the table
 * reaches the header row, which works like a row: Right walks the sortable headers and the column settings pin, Left from the
 * first comes back to the row, Home/End jump, Enter or Space sorts. Tab from the header goes to the active row, Up/Down/Home/End
 * move between rows, and Tab from a row goes to the button after the table; Shift+Tab from a row comes back to the header row.
 * Enter on the pin opens the column settings, where Tab reaches *Reset columns* (it puts widths and order back, and shows a
 * snackbar, which the story mounts as an app does). The table resizes by default (ASMA-8597), and its resize handles are not
 * tab stops. Fake data.
 */
export const KeyboardReach: Story = {
    render: () => (
        <>
            <StyledTable<Report> columns={columns} data={reports} hideFooter locale='en' uniqueKey='kbd-reach' />
            <SnackbarProvider />
        </>
    ),
}

/**
 * ASMA-8702, ASMA-8875: with `hideHeader` the header is hidden but stays in the accessibility tree, and it has no tab stop:
 * Tab goes from the button before the table straight to the active row. Fake data.
 */
export const HiddenHeader: Story = {
    render: () => (
        <StyledTable<Report> columns={columns} data={reports} hideFooter hideHeader locale='en' uniqueKey='kbd-hidden' />
    ),
}

/**
 * ASMA-8875: a table whose rows hold a control of their own. The control is not a tab stop: Right Arrow from a row reaches
 * it, Left Arrow goes back to the row, and Up/Down move to the next row from either. Tab from the row or the control leaves
 * the table; Shift+Tab from the button after the table enters at the active row, and from there goes to the header. Fake
 * data.
 */
export const RowControls: Story = {
    render: () => (
        <StyledTable<Report> columns={columnsWithControl} data={reports} hideFooter locale='en' uniqueKey='kbd-row-controls' />
    ),
}

/** Anonymous questionnaires: a template, and the questionnaires sent from it that have answers. */
interface Template {
    id: string
    title: string
    validTo: string
    variants: number
    answers: number
}

interface SentQuestionnaire {
    id: string
    title: string
    label: string
    code: string
    validTo: string
}

const templates: Template[] = [
    { id: 't-1', title: 'Visit feedback', validTo: '02.12.2026', variants: 6, answers: 2 },
    { id: 't-2', title: 'Staff survey', validTo: '-', variants: 2, answers: 0 },
    { id: 't-3', title: 'General questions', validTo: '22.03.2027', variants: 1, answers: 1 },
    { id: 't-4', title: 'Waiting room', validTo: '-', variants: 0, answers: 0 },
]

const sentFrom = (template: Template): SentQuestionnaire[] =>
    [
        { label: 'Alabama', code: 'DC3E3' },
        { label: 'Oslo', code: 'K7P2Q' },
    ]
        .slice(0, template.answers)
        .map((sent, index) => ({ ...sent, id: `${template.id}-s${String(index + 1)}`, title: template.title, validTo: '01.06.2026' }))

const templateColumns: ColumnDef<Template>[] = [
    { accessorKey: 'title', header: 'Title', size: 220 },
    { accessorKey: 'validTo', header: 'Valid to', size: 130 },
    { accessorKey: 'variants', header: 'Variants', size: 110 },
    { accessorKey: 'answers', header: 'Answers', size: 110 },
]

const sentColumns: ColumnDef<SentQuestionnaire>[] = [
    { accessorKey: 'title', header: 'Title', size: 200 },
    { accessorKey: 'label', header: 'Invitation label', size: 150 },
    { accessorKey: 'code', header: 'Invitation code', size: 140 },
    { accessorKey: 'validTo', header: 'Valid to', size: 130 },
]

/**
 * ASMA-8875: sub-rows as the apps use them, after a real screen (asma-app-artifact's Anonymous questionnaires,
 * `/all-qnrs/anonymous-qnrs`). Rows start collapsed; only a template with answers has a chevron, which expands it. Its
 * sub-row holds a nested StyledTable with no header and no footer, listing the questionnaires sent from it, each with its
 * own checkbox and ⋮.
 *
 * The body is one tab stop. Up/Down walk the templates and the nested rows, in visual order; Left/Right walk the focused
 * row's own controls (the chevron, the checkbox, the ⋮). Enter or Space on a chevron, or Space on a template, expands or
 * collapses it; Space on a nested row ticks its checkbox. Fake data.
 */
export const SubRows: Story = {
    render: () => (
        <StyledTable<Template, SentQuestionnaire>
            columns={templateColumns}
            data={templates}
            hideFooter
            locale='en'
            uniqueKey='kbd-sub-rows-anonymous'
            expandArrow
            getRowCanExpand={(row) => row.original.answers > 0}
            actions={rowActions}
            customSubRowData={new Map(templates.map((template) => [template.id, sentFrom(template)]))}
            renderSubRows={({ rows, row }) => (
                <tr>
                    <td colSpan={6} className='p-0'>
                        <StyledTable<SentQuestionnaire>
                            columns={sentColumns}
                            data={rows}
                            hideHeader
                            hideFooter
                            headerPin={false}
                            locale='en'
                            uniqueKey={`kbd-sub-rows-sent-${row.id}`}
                            enableRowSelection
                            initialState={{ columnVisibility: { select: true } }}
                            actions={rowActions}
                        />
                    </td>
                </tr>
            )}
        />
    ),
}

/**
 * ASMA-8875: a wide table, 30 columns, so only a window of them is rendered. Right and Left still go to the next control
 * in visual order — a button in column 1, 12, 25 or 30, then the ⋮ — scrolling a column that is not rendered yet into
 * view first. The same in the header, from the header row to the first column, on to the pin, and back. Fake data.
 */
export const WideTable: Story = {
    render: () => (
        <StyledTable<Report> columns={wideColumns} data={reports} hideFooter locale='en' uniqueKey='kbd-wide' actions={rowActions} />
    ),
}

/**
 * ASMA-8875: the context-menu key (or Shift+F10) on a row, or on a control in it, opens that row's ⋮ menu with the focus on
 * its first item; Escape returns to the ⋮. Report B's actions are disabled: the key puts the focus on its ⋮, which shows
 * why. A right-click keeps the browser's own menu. Fake data.
 */
export const RowMenus: Story = {
    render: () => (
        <StyledTable<Report>
            columns={columns}
            data={reports}
            hideFooter
            locale='en'
            uniqueKey='kbd-row-menus'
            enableRowSelection
            initialState={{ columnVisibility: { select: true } }}
            actions={rowActions}
            rowActionsState={(row) =>
                row.original.id === 'r-2' ? { state: 'disabled', tooltipTitle: 'Closed reports cannot be changed' } : undefined
            }
        />
    ),
}
