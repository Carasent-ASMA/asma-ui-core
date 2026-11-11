import { useEffect, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef, Table } from '@tanstack/react-table'
import { expect, userEvent, waitFor } from 'storybook/test'

import { StyledTable } from '../components/StyledTableIndex'

const TABLE_KEY = 'styled-table-sizing-regression'
const COLUMN_SIZING_KEY = `${TABLE_KEY}:column-sizing`

interface TableRow {
    id: string
    name: string
    role: string
    description: string
    updatedDate: string
    updatedBy: string
    added: string
    offers: string
}

const data: TableRow[] = [
    {
        id: '1',
        name: 'First row with text that can expand without moving its control',
        role: 'Admin',
        description: 'Description',
        updatedDate: '14.07.2026 · 14:22',
        updatedBy: 'User',
        added: '30.12.2025 · 14:43',
        offers: 'Offer',
    },
    {
        id: '2',
        name: 'Second row',
        role: 'User',
        description: 'Description',
        updatedDate: '14.07.2026 · 14:21',
        updatedBy: 'User',
        added: '19.09.2025 · 17:17',
        offers: 'Offer',
    },
]

const consumerColumns: ColumnDef<TableRow>[] = [
    {
        accessorKey: 'name',
        header: 'Workspace name',
        fixedLeft: true,
        size: 280,
        // consumer-style 12px gutters: 12 + 24 + 12 = 48 collapsed, grows on wrap
        cell: ({ row }) => <div className='py-[12px]'>{row.original.name}</div>,
    },
    {
        accessorKey: 'description',
        header: 'Description',
        size: 160,
        cell: ({ row }) => <div>{row.original.description}</div>,
    },
    { accessorKey: 'role', header: 'Role', size: 300 },
    { accessorKey: 'updatedDate', header: 'Updated date', size: 160 },
    { accessorKey: 'updatedBy', header: 'Updated by', size: 180 },
    { accessorKey: 'added', header: 'Added', size: 160 },
    { accessorKey: 'offers', header: 'Offers', size: 280 },
]

const capturedTables: Table<TableRow>[] = []

const TableFixture = (): JSX.Element => {
    const tableRef = useRef<Table<TableRow>>(null)

    useEffect(() => {
        if (tableRef.current) capturedTables.push(tableRef.current)
    })

    return (
        <div className='w-[600px]'>
            <div className='mb-2 flex gap-2'>
                <button type='button' onClick={() => tableRef.current?.setColumnSizing({ name: 50 })}>
                    Set below minimum
                </button>
                <button type='button' onClick={() => tableRef.current?.setColumnSizing({ name: 1000 })}>
                    Set large width
                </button>
            </div>
            <StyledTable
                columns={consumerColumns}
                customActionsColumnProps={{ size: 80, enableResizing: false }}
                data={data}
                enableColumnResizing
                enableRowSelection
                expandArrow
                headerPin
                hideFooter
                initialState={{ columnVisibility: { select: true } }}
                rowHeight={48}
                tableClassName='flex-1 overflow-auto'
                tableInstanceRef={tableRef}
                textExpandArrow
                uniqueKey={TABLE_KEY}
            />
        </div>
    )
}

const meta = {
    title: 'Data display/StyledTable',
    component: StyledTable,
    args: { columns: [], data: [] },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof StyledTable>

export default meta
type Story = StoryObj<typeof meta>

export const SizingPersistenceAndControlAlignment: Story = {
    // axe: empty-table-header (table header cell has no text). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    loaders: [
        () => {
            // A flat map saved before ASMA-8597, with a column that no longer exists and a value that is not a
            // width: the width still loads, the removed column's id has no effect and the bad value is dropped (AC 4, AC 7).
            localStorage.setItem(
                COLUMN_SIZING_KEY,
                JSON.stringify({ name: 240, 'column-that-was-removed': 500, description: 'wide' }),
            )
            return {}
        },
    ],
    render: () => <TableFixture />,
    play: async ({ canvasElement }) => {
        const nameHeader = Array.from(canvasElement.querySelectorAll<HTMLElement>('th')).find(
            (header) => header.textContent === 'Workspace name',
        )
        const descriptionHeader = Array.from(canvasElement.querySelectorAll<HTMLElement>('th')).find(
            (header) => header.textContent === 'Description',
        )

        await expect(nameHeader).toBeDefined()
        await expect(nameHeader?.style.width).toBe('240px')
        // Declared 160 px, and sortable: 20 px wider by default since ASMA-8597's UX round 4 (D16).
        await expect(descriptionHeader?.style.width).toBe('180px')
        // Mounting writes nothing: the legacy entry is still exactly what was saved.
        await expect(localStorage.getItem(COLUMN_SIZING_KEY)).toBe(
            JSON.stringify({ name: 240, 'column-that-was-removed': 500, description: 'wide' }),
        )
        // The removed column's id is kept in the table state, so the next write carries it along, and it is not
        // applied to anything; the bad value is dropped (AC 4, AC 7, DEC-W).
        const mountedSizing = capturedTables.at(-1)?.getState().columnSizing
        await expect(mountedSizing).toMatchObject({ name: 240, 'column-that-was-removed': 500 })
        await expect(mountedSizing?.['description']).toBeUndefined()
        await expect(consumerColumns).toHaveLength(7)

        const checkboxes = Array.from(canvasElement.querySelectorAll<HTMLElement>('[role="checkbox"]'))
        const checkboxGlyphs = Array.from(
            canvasElement.querySelectorAll<HTMLElement>('[data-test="cell-select-all"], [data-test="cell-select"]'),
        )

        // Regression: in the shell every micro-app injects its own purged Tailwind sheet, and a
        // late `.p-0 { padding: 0 !important }` used to strip the row wrapper's `pl-2` while the
        // header kept its own — an 8px offset that depended on which apps loaded first. The select
        // wrappers must stay aligned even with such a sheet present (scoped CSS-module geometry).
        const hostileAppSheet = document.createElement('style')
        hostileAppSheet.textContent = '.p-0{padding:0!important}'
        document.head.appendChild(hostileAppSheet)
        try {
            const checkboxGlyphLefts = checkboxGlyphs.map((glyph) => glyph.getBoundingClientRect().left)

            await expect(checkboxGlyphLefts.length).toBeGreaterThan(1)
            checkboxGlyphLefts
                .slice(1)
                .forEach((left) => expect(Math.abs(left - checkboxGlyphLefts[0]!)).toBeLessThanOrEqual(0.5))
        } finally {
            hostileAppSheet.remove()
        }

        const rowCheckboxBox = checkboxes[1]?.querySelector<HTMLElement>('[data-test="cell-select"] > span:last-child')
        await expect(rowCheckboxBox).not.toBeNull()
        const initialCheckboxBounds = rowCheckboxBox!.getBoundingClientRect()

        await userEvent.click(checkboxes[1]!)

        const checkedCheckboxBounds = rowCheckboxBox!.getBoundingClientRect()
        await expect(checkedCheckboxBounds.left).toBe(initialCheckboxBounds.left)
        await expect(checkedCheckboxBounds.top).toBe(initialCheckboxBounds.top)
        await expect(checkedCheckboxBounds.width).toBe(initialCheckboxBounds.width)
        await expect(checkedCheckboxBounds.height).toBe(initialCheckboxBounds.height)

        const bodyRows = Array.from(canvasElement.querySelectorAll<HTMLElement>('tbody tr'))
        await expect(bodyRows.length).toBeGreaterThanOrEqual(2)
        // Collapsed rows stay 48 (Body Base 16/24 + 12px gutters). Rows after
        // the first carry the 0.5px separator border, which snaps to 1px.
        for (const [index, row] of bodyRows.entries()) {
            const height = row.getBoundingClientRect().height
            await expect(height, `collapsed row ${index} height`).toBeGreaterThanOrEqual(48)
            await expect(height, `collapsed row ${index} height`).toBeLessThanOrEqual(49)
        }
        const shortRow = bodyRows[1]!
        const shortRowArrow = shortRow.querySelector<HTMLElement>('[data-test="expand-text-button"]')
        await expect(shortRowArrow).not.toBeNull()
        const shortRowArrowIcon = shortRowArrow!.querySelector<SVGElement>('svg')!
        const shortRowCheckbox = shortRow.querySelector<HTMLElement>('[data-test="cell-select"]')!
        const beforeToggle = {
            rowRect: shortRow.getBoundingClientRect(),
            arrowCenter: (() => {
                const bounds = shortRowArrowIcon.getBoundingClientRect()
                return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
            })(),
            checkboxRect: shortRowCheckbox.getBoundingClientRect(),
        }

        await userEvent.click(shortRowArrow!)

        const afterToggle = {
            rowRect: shortRow.getBoundingClientRect(),
            arrowCenter: (() => {
                const bounds = shortRowArrowIcon.getBoundingClientRect()
                return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
            })(),
            checkboxRect: shortRowCheckbox.getBoundingClientRect(),
        }
        await expect(afterToggle.rowRect.top).toBe(beforeToggle.rowRect.top)
        await expect(afterToggle.rowRect.height).toBe(beforeToggle.rowRect.height)
        await expect(Math.abs(afterToggle.arrowCenter.x - beforeToggle.arrowCenter.x)).toBeLessThanOrEqual(0.5)
        await expect(Math.abs(afterToggle.arrowCenter.y - beforeToggle.arrowCenter.y)).toBeLessThanOrEqual(0.5)
        await expect(afterToggle.checkboxRect.top).toBe(beforeToggle.checkboxRect.top)
        await expect(afterToggle.checkboxRect.left).toBe(beforeToggle.checkboxRect.left)

        await userEvent.click(shortRowArrow!)

        const expandButton = canvasElement.querySelector<HTMLElement>('[data-test="expand-text-button"]')
        await expect(expandButton).not.toBeNull()
        const initialExpandBounds = expandButton!.getBoundingClientRect()
        const firstRow = expandButton!.closest('tr')!
        const measureRowSnapshot = () => {
            const cells = Array.from(firstRow.querySelectorAll('td'))
            return {
                rowHeight: firstRow.getBoundingClientRect().height,
                checkboxCenterY: (() => {
                    const glyph = firstRow.querySelector<HTMLElement>('[data-test="cell-select"]')!
                    const bounds = glyph.getBoundingClientRect()
                    return bounds.top + bounds.height / 2
                })(),
                plainCellCenters: cells.slice(4).map((cell) => {
                    const content = cell.firstElementChild!.getBoundingClientRect()
                    return content.top + content.height / 2
                }),
            }
        }
        const collapsedSnapshot = measureRowSnapshot()
        const collapsedNameBand = Array.from(firstRow.querySelectorAll('td'))
            .find((cell) => cell.textContent?.includes('First row with text'))!
            .firstElementChild!.getBoundingClientRect()
        const collapsedDescriptionBand = Array.from(firstRow.querySelectorAll('td'))
            .find((cell) => cell.textContent === 'Description')!
            .firstElementChild!.getBoundingClientRect()
        const expandIcon = expandButton!.querySelector<SVGElement>('svg')
        await expect(expandIcon).not.toBeNull()
        const initialIconBounds = expandIcon!.getBoundingClientRect()
        const initialHeaders = Array.from(canvasElement.querySelectorAll('th')).map((header) => header.textContent)
        const initialScrollPositions = Array.from(canvasElement.querySelectorAll<HTMLElement>('div'))
            .filter((element) => element.scrollWidth > element.clientWidth)
            .map((element) => element.scrollLeft)
        const expectedHeaders = ['Workspace name', 'Description', 'Role', 'Updated date', 'Updated by', 'Added', 'Offers']
        expectedHeaders.forEach((header) =>
            expect(initialHeaders).toContain(header),
        )

        await userEvent.click(expandButton!)

        const expandedButton = canvasElement.querySelector<HTMLElement>('[data-test="expand-text-button"]')
        await expect(expandedButton).not.toBeNull()
        const expandedBounds = expandedButton!.getBoundingClientRect()
        const expandedIcon = expandedButton!.querySelector<SVGElement>('svg')
        await expect(expandedIcon).not.toBeNull()
        const expandedIconBounds = expandedIcon!.getBoundingClientRect()
        const expandedHeaders = Array.from(canvasElement.querySelectorAll('th')).map((header) => header.textContent)
        const expandedScrollPositions = Array.from(canvasElement.querySelectorAll<HTMLElement>('div'))
            .filter((element) => element.scrollWidth > element.clientWidth)
            .map((element) => element.scrollLeft)
        const expandedSnapshot = measureRowSnapshot()
        await expect(expandedSnapshot.rowHeight, 'wrapped expand grows downward').toBeGreaterThan(
            collapsedSnapshot.rowHeight,
        )
        const wrappingCell = Array.from(firstRow.querySelectorAll('td')).find((cell) =>
            cell.textContent?.includes('First row with text'),
        )
        await expect(wrappingCell).toBeDefined()
        await expect(wrappingCell!.getBoundingClientRect().height).toBeGreaterThan(48)
        const wrappingBand = wrappingCell!.firstElementChild as HTMLElement
        await expect(Math.abs(wrappingBand.getBoundingClientRect().top - collapsedNameBand.top)).toBeLessThanOrEqual(
            0.5,
        )
        const descriptionCell = Array.from(firstRow.querySelectorAll('td')).find(
            (cell) => cell.textContent === 'Description',
        )
        await expect(descriptionCell).toBeDefined()
        const descriptionBand = descriptionCell!.firstElementChild as HTMLElement
        const descriptionBandRect = descriptionBand.getBoundingClientRect()
        await expect(descriptionBandRect.height, 'short cell must not stretch to the expanded row').toBeLessThanOrEqual(
            48.5,
        )
        await expect(Math.abs(descriptionBandRect.top - collapsedDescriptionBand.top)).toBeLessThanOrEqual(0.5)
        await expect(expandedSnapshot.checkboxCenterY).toBe(collapsedSnapshot.checkboxCenterY)
        expandedSnapshot.plainCellCenters.forEach((center, index) =>
            expect(Math.abs(center - collapsedSnapshot.plainCellCenters[index]!)).toBeLessThanOrEqual(0.5),
        )
        await expect(expandedBounds.left).toBe(initialExpandBounds.left)
        await expect(expandedBounds.top).toBe(initialExpandBounds.top)
        await expect(expandedBounds.width).toBe(initialExpandBounds.width)
        await expect(expandedBounds.height).toBe(initialExpandBounds.height)
        const expandedCheckboxBox = canvasElement.querySelector<HTMLElement>(
            '[role="checkbox"] [data-test="cell-select"] > span:last-child',
        )
        await expect(expandedCheckboxBox).not.toBeNull()
        const expandedCheckboxBounds = expandedCheckboxBox!.getBoundingClientRect()
        await expect(
            Math.abs(
                expandedCheckboxBounds.top +
                    expandedCheckboxBounds.height / 2 -
                    (expandedBounds.top + expandedBounds.height / 2),
            ),
        ).toBeLessThanOrEqual(0.5)
        await expect(
            Math.abs(expandedIconBounds.left + expandedIconBounds.width / 2 - (initialIconBounds.left + initialIconBounds.width / 2)),
        ).toBeLessThanOrEqual(0.5)
        await expect(
            Math.abs(expandedIconBounds.top + expandedIconBounds.height / 2 - (initialIconBounds.top + initialIconBounds.height / 2)),
        ).toBeLessThanOrEqual(0.5)
        await expect(expandedHeaders).toEqual(initialHeaders)
        await expect(expandedScrollPositions).toEqual(initialScrollPositions)

        await userEvent.click(canvasElement.querySelector('button:nth-of-type(1)')!)
        await waitFor(() => expect(nameHeader?.style.width).toBe('100px'))
        const headerLayout = nameHeader?.firstElementChild as HTMLElement
        const headerContent = headerLayout.firstElementChild as HTMLElement
        const resizeHandle = headerLayout.lastElementChild as HTMLElement
        await expect(headerContent.scrollWidth).toBeGreaterThan(headerContent.clientWidth)
        await expect(getComputedStyle(headerContent).textOverflow).toBe('ellipsis')
        await expect(
            Math.abs(resizeHandle.getBoundingClientRect().right - nameHeader!.getBoundingClientRect().right),
        ).toBeLessThanOrEqual(0.5)

        await userEvent.click(canvasElement.querySelector('button:nth-of-type(2)')!)
        await waitFor(() => {
            expect(nameHeader?.style.width).toBe('1000px')
            expect(JSON.parse(localStorage.getItem(COLUMN_SIZING_KEY) ?? '{}')).toMatchObject({ name: 1000 })
        })

        const scrollContainer = Array.from(canvasElement.querySelectorAll<HTMLElement>('div')).find(
            (element) => getComputedStyle(element).overflowX === 'auto' && element.scrollWidth > element.clientWidth,
        )
        await expect(scrollContainer).toBeDefined()
        const pinButton = canvasElement.querySelector<HTMLElement>('[aria-label="Column settings"]')
        const actionsHeader = pinButton?.closest('th')
        const actionsCell = canvasElement.querySelector<HTMLElement>('tbody tr td:last-child')
        await expect(pinButton).not.toBeNull()
        await expect(actionsHeader).not.toBeNull()
        await expect(actionsCell).not.toBeNull()
        const initialActionsHeaderBounds = actionsHeader!.getBoundingClientRect()
        const initialActionsCellBounds = actionsCell!.getBoundingClientRect()
        const pinBounds = pinButton!.getBoundingClientRect()
        await expect(
            Math.abs(
                pinBounds.left +
                    pinBounds.width / 2 -
                    (initialActionsHeaderBounds.left + initialActionsHeaderBounds.width / 2),
            ),
        ).toBeLessThanOrEqual(0.5)

        scrollContainer!.scrollLeft = 300
        scrollContainer!.dispatchEvent(new Event('scroll'))
        await waitFor(() => expect(scrollContainer!.scrollLeft).toBe(300))
        await expect(actionsHeader!.getBoundingClientRect().right).toBe(initialActionsHeaderBounds.right)
        // ASMA-8427: this actions column only hosts the header pin menu, so its empty body cells
        // scroll with the data instead of covering the last column; the pin itself stays put.
        await expect(actionsCell!.getBoundingClientRect().right).toBe(initialActionsCellBounds.right - 300)

        const scrolledCheckboxBounds = rowCheckboxBox!.getBoundingClientRect()
        const scrolledExpandBounds = expandButton!.getBoundingClientRect()

        await userEvent.click(checkboxes[1]!)
        await userEvent.click(expandButton!)

        await expect(scrollContainer!.scrollLeft).toBe(300)
        await expect(rowCheckboxBox!.getBoundingClientRect().left).toBe(scrolledCheckboxBounds.left)
        await expect(expandButton!.getBoundingClientRect().left).toBe(scrolledExpandBounds.left)

        // Regression: without persisted order, columnOrder must default to an array —
        // an explicit undefined crashed the header pin-menu drag (reading 'filter').
        const tableInstance = capturedTables.at(-1)
        await expect(tableInstance).toBeDefined()
        await expect(Array.isArray(tableInstance!.getState().columnOrder)).toBe(true)
        tableInstance!.setColumnOrder((order) => [...order].reverse())

        // Regression: the resizable default minSize (100) must not inflate internal
        // columns — the actions column keeps its explicit utility width.
        await expect(tableInstance!.getColumn('actions')!.getSize()).toBe(80)
    },
}

const footerBoundaryColumns: ColumnDef<TableRow>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role' },
]

const makeFooterBoundaryRows = (count: number): TableRow[] =>
    Array.from({ length: count }, (_, index) => ({
        id: `${index + 1}`,
        name: `Row ${index + 1}`,
        role: 'User',
        description: 'Description',
        updatedDate: '14.07.2026 · 14:22',
        updatedBy: 'User',
        added: '30.12.2025 · 14:43',
        offers: 'Offer',
    }))

/**
 * ASMA-7980 regression: the 5-row footer threshold must hide only the pagination controls,
 * never a custom `footer` node (Save/Cancel buttons vanished on tables with < 5 rows).
 */
export const FooterRowCountBoundary: Story = {
    // axe: duplicate-id-active (active elements share the same id). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    render: () => (
        <div className='flex w-[500px] flex-col gap-6'>
            {[4, 5, 6].map((rowCount) => (
                <div key={rowCount} data-test={`footer-boundary-${rowCount}`}>
                    <StyledTable
                        columns={footerBoundaryColumns}
                        data={makeFooterBoundaryRows(rowCount)}
                        uniqueKey={`footer-boundary-${rowCount}`}
                        footer={() => (
                            <button type='button' data-test='custom-footer'>
                                Save changes
                            </button>
                        )}
                    />
                </div>
            ))}
            <div data-test='footer-boundary-none'>
                <StyledTable
                    columns={footerBoundaryColumns}
                    data={makeFooterBoundaryRows(4)}
                    uniqueKey='footer-boundary-none'
                />
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const section = (id: string): HTMLElement => canvasElement.querySelector<HTMLElement>(`[data-test="${id}"]`)!

        // Under the threshold: the custom footer renders, pagination controls stay hidden.
        await expect(section('footer-boundary-4').querySelector('[data-test="custom-footer"]')).not.toBeNull()
        await expect(section('footer-boundary-4').querySelector('[data-test="table-rows-count-button"]')).toBeNull()
        for (const row of section('footer-boundary-4').querySelectorAll('tbody tr')) {
            const height = row.getBoundingClientRect().height
            await expect(height).toBeGreaterThanOrEqual(48)
            await expect(height).toBeLessThanOrEqual(49)
        }

        // At and above the threshold: custom footer AND pagination controls render, as before.
        for (const rowCount of [5, 6]) {
            const boundarySection = section(`footer-boundary-${rowCount}`)
            await expect(boundarySection.querySelector('[data-test="custom-footer"]')).not.toBeNull()
            await expect(boundarySection.querySelector('[data-test="table-rows-count-button"]')).not.toBeNull()
        }

        // Under the threshold without a custom footer: no footer element renders at all.
        await expect(section('footer-boundary-none').querySelector('[class*="table-footer"]')).toBeNull()
    },
}

const activeRowData: TableRow[] = data.concat([
    {
        id: '3',
        name: 'Third row',
        role: 'User',
        description: 'Description',
        updatedDate: '14.07.2026 · 14:20',
        updatedBy: 'User',
        added: '01.09.2025 · 09:00',
        offers: 'Offer',
    },
])

/**
 * `activeRowId` — the row the user is working with (e.g. previewed beside a picker) in the Figma
 * table-row **Focused** state: the keyboard-focus frame, full width including the actions cell, kept
 * after focus moves on. Top table: row 2 active (Focused). Bottom: row 2 active and ticked
 * ("Selected + focused") next to row 3 ticked only ("Selected").
 */
export const ActiveRow: Story = {
    // axe: empty-table-header (table header cell has no text). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    render: () => (
        <div className='flex w-[720px] flex-col gap-6'>
            <div data-test='active-row-focused'>
                <StyledTable
                    columns={consumerColumns.slice(0, 3)}
                    data={activeRowData}
                    activeRowId='2'
                    enableRowSelection
                    hideFooter
                    initialState={{ columnVisibility: { select: true } }}
                    uniqueKey='active-row-focused'
                />
            </div>
            <div data-test='active-row-selected'>
                <StyledTable
                    columns={consumerColumns.slice(0, 3)}
                    data={activeRowData}
                    activeRowId='2'
                    enableRowSelection
                    hideFooter
                    initialState={{ columnVisibility: { select: true }, rowSelection: { '2': true, '3': true } }}
                    uniqueKey='active-row-selected'
                />
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const activeRows = canvasElement.querySelectorAll('tr[data-active="true"]')
        await expect(activeRows.length).toBe(2)
        for (const row of activeRows) await expect(row.id).toBe('2')
    },
}

interface PickerRow {
    id: string
    name: string
    kind: string
}

const pickerRows: PickerRow[] = [
    { id: 'attached', name: 'Pain and energy management', kind: 'Questionnaire' },
    { id: 'free', name: 'Weekly check-in', kind: 'Questionnaire' },
    { id: 'archived', name: 'Discharge summary (archived)', kind: 'Document' },
]

const pickerColumns: ColumnDef<PickerRow>[] = [
    { accessorKey: 'name', header: 'Name', size: 360 },
    { accessorKey: 'kind', header: 'Type', size: 160 },
]

/** Attached content is ticked; the archived row is pickable by nobody and was never ticked. */
const lockedRowReason = (id: string): string | null => {
    if (id === 'attached') return 'Already selected'
    if (id === 'archived') return 'Archived — cannot be added'
    return null
}

/**
 * **A row you cannot tick, and why.** The pattern a picker needs: content that is already attached
 * stays visible and ticked rather than disappearing from the list, and the table has to say *why* it
 * will not budge — without implying the row is somehow forbidden.
 *
 * Three states, three different things to say:
 *
 * | Row | `getCanSelect()` | Ticked | Checkbox | Reads as |
 * | --- | --- | --- | --- | --- |
 * | Already selected | `false` | yes | **read-only** — white box, `delta-500` border and tick | "you already have this" |
 * | Free to pick | `true` | no | enabled | "go ahead" |
 * | Archived | `false` | no | **disabled** — `delta-200` | "not available to you" |
 *
 * Why the first two locked rows differ: `readOnly` draws the box exactly as a plain *unticked
 * selectable* box is drawn, so using it where nothing is ticked would hide the only fact worth
 * knowing. And `disabled`'s grey fill over a tick says "unavailable", which is the opposite of
 * "already yours" — that mismatch is what this split fixes.
 *
 * Everything else is the same for both locked kinds, and comes from the column for free: the cell
 * ignores click and keyboard, carries `aria-disabled`, drops out of the tab order, and paints the
 * not-allowed cursor over the checkbox.
 *
 * **What the consumer writes** — the predicate decides *which* rows lock, `getRowSelectionTooltip`
 * supplies the reason (hover the checkbox), and ticking comes from `rowSelection` state as usual:
 *
 * ```tsx
 * <StyledTable
 *     enableRowSelection={(row) => !attachedIds.has(row.original.id)}
 *     getRowSelectionTooltip={(row) => (row.getCanSelect() ? null : i18n.strings.already_selected)}
 *     state={{ rowSelection, columnVisibility: { select: true } }}
 * />
 * ```
 */
export const LockedRows: Story = {
    // axe: empty-table-header (table header cell has no text). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    render: () => (
        <div className='w-[640px]' data-test='locked-rows'>
            <StyledTable
                columns={pickerColumns}
                data={pickerRows}
                enableRowSelection={(row) => lockedRowReason(row.original.id) === null}
                getRowSelectionTooltip={(row) => lockedRowReason(row.original.id)}
                hideFooter
                initialState={{ columnVisibility: { select: true }, rowSelection: { attached: true } }}
                state={{ rowSelection: { attached: true } }}
                uniqueKey='locked-rows'
            />
        </div>
    ),
    /*
     * Deliberately no hover here: an open Floating-UI tooltip oscillates between frames and would
     * cost this story a VRT skip (see `datadisplay-tooltip--hovered`). The tooltip itself is covered
     * in a real browser by `selectColumn.lockedRow.interaction.test.tsx`; what the story asserts is
     * the part a reader is looking at — that the three checkboxes are three different states.
     */
    play: async ({ canvasElement }) => {
        const control = (rowId: string) =>
            canvasElement.querySelector<HTMLElement>(`tr[id="${rowId}"] [role="checkbox"]`)!
        const box = (rowId: string) =>
            control(rowId).querySelector<HTMLElement>('[data-test="cell-select"] > span:last-of-type')!

        // Ticked + locked: read-only, so the box keeps its white fill rather than the disabled grey.
        await expect(control('attached')).toHaveAttribute('aria-checked', 'true')
        await expect(control('attached')).toHaveAttribute('aria-disabled', 'true')
        await expect(getComputedStyle(box('attached')).backgroundColor).toBe('rgb(255, 255, 255)')

        // Unticked + locked: still disabled, or it would be indistinguishable from the free row.
        await expect(getComputedStyle(box('archived')).borderColor).not.toBe(
            getComputedStyle(box('free')).borderColor,
        )

        // Free to pick: untouched by any of this.
        await expect(control('free')).toHaveAttribute('aria-disabled', 'false')
        await expect(control('free')).toHaveAttribute('tabindex', '0')
    },
}

const rowStateData: TableRow[] = activeRowData.slice(1, 2)

/** One labelled single-row table per Figma `_table row DS` state (Tables page `30076-196588`). */
interface RowStateProps {
    activeRowId?: string
    initialState?: { columnVisibility: Record<string, boolean>; rowSelection?: Record<string, boolean> }
}

const CHECKED = { columnVisibility: { select: true }, rowSelection: { '2': true } }

/** The six Figma `_table row DS` states, in the order and with the names of the Figma Tables page. */
const ROW_STATES: { label: string; key: string; props: RowStateProps }[] = [
    { label: 'Row • Default enabled', key: 'default', props: {} },
    { label: 'Row • Hovered', key: 'hovered', props: {} },
    { label: 'Row • Selected', key: 'selected', props: { activeRowId: '2' } },
    { label: 'Row • Focused', key: 'focused', props: {} },
    { label: 'Row • Checked', key: 'checked', props: { initialState: CHECKED } },
    { label: 'Row • Checked + focused', key: 'checked-focused', props: { initialState: CHECKED } },
]

/**
 * **Row states gallery (ASMA-8338)** — the six Figma table-row states at rest, replicating the Figma
 * Tables page (`30076-196588`):
 *
 * | Figma state | How a table gets it | Look |
 * | --- | --- | --- |
 * | Row • Default enabled | — | white, 1px `table/border-default` (delta-200) line under the row |
 * | Row • Hovered | pointer over the row | `table/bg-row-hover` (delta-50) |
 * | Row • Selected | `activeRowId` — the row opened in a side panel / preview | `table/bg-row-selected` (gama-25) + 2px `border/selected` (gama-400) frame, kept on hover |
 * | Row • Focused | keyboard focus | white + 3px `table/border-focus` (gama-500) frame |
 * | Row • Checked | ticked in the select column | `table/bg-row-selected` (gama-25) |
 * | Row • Checked + focused | ticked + keyboard focus | gama-25 + the 3px focus frame |
 *
 * Hover and focus are forced on those rows with the pseudo-states addon (selector-targeted, so the
 * table's own row classes stay untouched) and every state shows without interaction; the `ActiveRow` story is the live version. Rows are 48px, the header 32px, and content
 * cells use the Figma spacing (8px row edge, 20px between cells, text 4px after the checkbox slot).
 */
export const RowStates: Story = {
    parameters: {
        // axe: empty-table-header (table header cell has no text). ASMA-8136 allowlist - see docs/a11y-allowlist.md
        a11y: { test: 'todo' },
        pseudo: {
            hover: ['[data-test="row-state-hovered"] tbody tr'],
            focusVisible: ['[data-test="row-state-focused"] tbody tr', '[data-test="row-state-checked-focused"] tbody tr'],
        },
    },
    render: () => (
        // Two columns, so all six states fit one 1280x720 VRT frame.
        <div className='grid w-[1240px] grid-cols-2 gap-x-8 gap-y-5'>
            {ROW_STATES.map(({ label, key, props }) => (
                <div key={key} data-test={`row-state-${key}`} className='flex flex-col gap-1'>
                    <span className='text-sm font-semibold text-delta-800'>{label}</span>
                    <StyledTable
                        columns={consumerColumns.slice(0, 3)}
                        data={rowStateData}
                        enableRowSelection
                        hideFooter
                        initialState={{ columnVisibility: { select: true } }}
                        uniqueKey={`row-state-${key}`}
                        {...props}
                    />
                </div>
            ))}
        </div>
    ),
    play: async ({ canvasElement }) => {
        const selected = canvasElement.querySelector('[data-test="row-state-selected"] tr[data-active="true"]')
        await expect(selected).not.toBeNull()
        const checked = canvasElement.querySelector('[data-test="row-state-checked"] tr[aria-selected="true"]')
        await expect(checked).not.toBeNull()
    },
}

const indicatorRows: TableRow[] = [
    { ...data[0]!, id: 'i1', name: 'Alpha' },
    { ...data[1]!, id: 'i2', name: 'Beta' },
]

const indicatorColumns: ColumnDef<TableRow>[] = [
    { accessorKey: 'name', header: 'Ascending', size: 150 },
    { accessorKey: 'role', header: 'Descending', size: 150 },
    { accessorKey: 'description', header: 'Unsorted', size: 150 },
    { accessorKey: 'updatedBy', header: 'A very long column label that gets truncated', size: 150 },
    { id: 'unsortable', header: 'Unsortable', size: 150 },
]

/**
 * ASMA-8597, AC 15 and 16: the Figma sort indicator. Ascending and descending (a two-column sort) show the
 * primary glyph at rest; an unsorted column shows nothing, and reserves no slot, until it is hovered or focused;
 * a long unsorted label truncates and gets its 20px slot back only while hovered or focused; an unsortable column
 * shows nothing.
 * While a header is hovered or `:focus-visible` it previews the state after the click (UX round 3, 2026-11-02): an
 * unsorted column a grey glyph pointing the way the first click sorts; an ascending one a teal descending glyph; a
 * descending one, whose next click removes the sort, the grey ascending glyph. The colour never changes on a sorted
 * header's hover.
 * The hover and focus states are captured by the interaction captures in `visual-tests/interaction-states.ts`.
 * Nothing is drawn behind a hovered glyph: UX has no hover square (ASMA-8597, comment 94738).
 */
export const SortIndicatorStates: Story = {
    render: () => (
        <div className='w-[860px]'>
            <StyledTable
                columns={indicatorColumns}
                data={indicatorRows}
                hideFooter
                initialState={{
                    sorting: [
                        { id: 'name', desc: false },
                        { id: 'role', desc: true },
                    ],
                }}
                locale='en'
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const header = (label: string) =>
            Array.from(canvasElement.querySelectorAll<HTMLElement>('th')).find((cell) =>
                cell.textContent?.startsWith(label),
            )!
        const indicator = (label: string) => header(label).querySelector<HTMLElement>('[data-sort-state]')
        const glyph = (label: string, which: 'current' | 'preview') =>
            indicator(label)!.querySelector<SVGElement>(`[class*="sort-glyph--${which}"]`)!

        await expect(header('Ascending')).toHaveAttribute('aria-sort', 'ascending')
        await expect(header('Descending')).toHaveAttribute('aria-sort', 'descending')
        await expect(header('Unsorted')).toHaveAttribute('aria-sort', 'none')
        await expect(indicator('Ascending')).toHaveAttribute('data-sort-direction', 'asc')
        await expect(indicator('Descending')).toHaveAttribute('data-sort-direction', 'desc')
        await expect(indicator('Unsortable')).toBeNull()
        // At rest: a sorted column shows its current glyph; an unsorted one shows nothing.
        await expect(getComputedStyle(glyph('Ascending', 'current')).visibility).toBe('visible')
        await expect(getComputedStyle(glyph('Ascending', 'preview')).visibility).toBe('hidden')
        await expect(getComputedStyle(glyph('Unsorted', 'current')).visibility).toBe('hidden')
        await expect(getComputedStyle(glyph('Unsorted', 'preview')).visibility).toBe('hidden')
        // What a hover or keyboard focus will show: the state after the click.
        await expect(indicator('Ascending')).toHaveAttribute('data-preview-direction', 'desc')
        await expect(indicator('Ascending')).toHaveAttribute('data-preview-tone', 'primary')
        await expect(indicator('Descending')).toHaveAttribute('data-preview-direction', 'asc')
        await expect(indicator('Descending')).toHaveAttribute('data-preview-tone', 'neutral')
        await expect(indicator('Unsorted')).toHaveAttribute('data-preview-direction', 'asc')
        await expect(indicator('Unsorted')).toHaveAttribute('data-preview-tone', 'neutral')
    },
}

const resizeColumns: ColumnDef<TableRow>[] = [
    { accessorKey: 'name', header: 'Narrow column', size: 100, minSize: 100 },
    { accessorKey: 'role', header: 'Role', size: 180 },
    { accessorKey: 'description', header: 'Description', size: 220 },
]

/**
 * ASMA-8597, AC 17 (Figma "Resize" 46298:231237 and "Handle" 46298:231480): with resizing on, each handle is a
 * 24 x 28px zone (4px radius) at the column's right edge, centred in the header content. The header content reserves
 * its 24px width, so in a 100px column the glyph ends before the zone and never sits under it (the narrow column is
 * sorted, so its slot shows). The bar is 4 x 24px (4px radius), centred in the zone at its right edge (UX, OQ-03),
 * `delta-400` (UX, OQ-10) while the header is hovered; with the pointer over the zone the zone is filled `gama-50`
 * and the bar is `gama-400`, and so it is while dragging (UX round 3, 2026-11-02). The VRT captures hover the narrow
 * column and its zone.
 */
export const ResizeHandle: Story = {
    render: () => (
        <div className='w-[640px]'>
            <StyledTable
                columns={resizeColumns}
                data={indicatorRows}
                enableColumnResizing
                hideFooter
                initialState={{ sorting: [{ id: 'name', desc: false }] }}
                locale='en'
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const narrow = Array.from(canvasElement.querySelectorAll<HTMLElement>('th')).find((cell) =>
            cell.textContent?.startsWith('Narrow column'),
        )!
        const zone = narrow.querySelector<HTMLElement>('[class*="resizer"]')!
        const slot = narrow.querySelector<HTMLElement>('[data-sort-state]')!
        const glyph = narrow.querySelector<SVGElement>('[data-sort-state] svg')!
        const zoneBox = zone.getBoundingClientRect()
        const slotBox = slot.getBoundingClientRect()
        const glyphBox = glyph.getBoundingClientRect()

        await expect(zoneBox.width).toBe(24)
        await expect(zoneBox.height).toBe(28)
        await expect(getComputedStyle(zone).borderRadius).toBe('4px')
        await expect(getComputedStyle(zone, '::after').width).toBe('4px')
        await expect(getComputedStyle(zone, '::after').height).toBe('24px')
        await expect(getComputedStyle(zone, '::after').borderRadius).toBe('4px')
        // The column is sorted, so its 20px slot shows, and it ends before the zone (the glyph's triangle is
        // centred in it). The glyph's own 28px box overhangs the slot by 4px, which is why the slot is measured.
        await expect(slotBox.width).toBe(20)
        await expect(slotBox.right).toBeLessThanOrEqual(zoneBox.left + 0.5)
        const hit = document.elementFromPoint(glyphBox.left + glyphBox.width / 2, glyphBox.top + glyphBox.height / 2)

        await expect(zone.contains(hit)).toBe(false)
    },
}

const headerOf = (canvasElement: HTMLElement, label: string): HTMLElement =>
    Array.from(canvasElement.querySelectorAll<HTMLElement>('th')).find((cell) => cell.textContent?.trim() === label)!
const handleOf = (canvasElement: HTMLElement, label: string): HTMLElement | null =>
    headerOf(canvasElement, label).querySelector<HTMLElement>('[class*="resizer"]')

const defaultsColumns: ColumnDef<TableRow>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 },
    { accessorKey: 'role', header: 'Role', size: 160, enableResizing: false },
    { accessorKey: 'description', header: 'Description', size: 120, enableSorting: false },
    { accessorKey: 'updatedBy', header: 'Updated by', size: 120 },
    { id: 'last', header: 'Last column', size: 120, enableSorting: false },
]

/**
 * ASMA-8597, UX round 4 (D15, D16, DEC-NARROW): a table that does not pass `enableColumnResizing` resizes. Every data
 * column has a handle (on hover), except ui-core's own columns (the select checkbox and the pin), a column that opts out
 * with `enableResizing: false` (Role), and the last data column, which keeps filling the remaining width. Sortable columns
 * open 20 px wider than they declare (Name 160 -> 180, Updated by 120 -> 140); a column that cannot sort keeps its width.
 * It has a `uniqueKey` but does not set `enableColumnResizing`, so it does not save its widths (D17).
 */
export const ResizableByDefault: Story = {
    loaders: [
        () => {
            localStorage.clear()
            return {}
        },
    ],
    render: () => (
        <div className='w-[920px]'>
            <StyledTable
                columns={defaultsColumns}
                data={indicatorRows}
                enableRowSelection
                hideFooter
                initialState={{ columnVisibility: { select: true } }}
                locale='en'
                uniqueKey='p2e-resizable-by-default'
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        // Handles: the data columns that may resize.
        await expect(handleOf(canvasElement, 'Name')).not.toBeNull()
        await expect(handleOf(canvasElement, 'Updated by')).not.toBeNull()
        await expect(handleOf(canvasElement, 'Description')).not.toBeNull()
        // No handle: an opt-out, the last data column, the select column and the pin.
        await expect(handleOf(canvasElement, 'Role')).toBeNull()
        await expect(handleOf(canvasElement, 'Last column')).toBeNull()
        const selectCell = canvasElement.querySelector<HTMLElement>('thead th [role="checkbox"]')!.closest('th')!
        const pinCell = canvasElement.querySelector<HTMLElement>('thead th button[aria-haspopup="true"]')!.closest('th')!

        await expect(selectCell.querySelector('[class*="resizer"]')).toBeNull()
        await expect(pinCell.querySelector('[class*="resizer"]')).toBeNull()
        // D16: sortable columns are 20 px wider; one that cannot sort is as declared. The last column fills the width.
        await expect(headerOf(canvasElement, 'Name').style.width).toBe('180px')
        await expect(headerOf(canvasElement, 'Role').style.width).toBe('180px')
        await expect(headerOf(canvasElement, 'Description').style.width).toBe('120px')
        await expect(headerOf(canvasElement, 'Updated by').style.width).toBe('140px')
        await expect(headerOf(canvasElement, 'Last column').style.width).toBe('100%')
        // D17: no widths are saved.
        await expect(localStorage.getItem('p2e-resizable-by-default:column-sizing')).toBeNull()
    },
}

const widthColumns: ColumnDef<TableRow>[] = [
    { accessorKey: 'name', header: 'Sortable 120', size: 120 },
    { id: 'plain', header: 'Plain', size: 120 },
    { accessorKey: 'role', header: 'Saved width', size: 120 },
    { accessorKey: 'description', header: 'Sortable, no size' },
    { id: 'last', header: 'Last column', size: 120 },
]

/**
 * ASMA-8597, UX round 4 (D16): every sortable data column's default width is 20 px wider, which is what its triangle needs.
 * A sortable column declaring 120 px opens at 140; one declaring nothing at TanStack's 150 + 20; a column that cannot sort
 * stays at 120. A width the user saved (here 240 for "Saved width", under an explicit `enableColumnResizing`) is applied
 * as saved, without the 20 px.
 */
export const SortableWidthPlus20: Story = {
    loaders: [
        () => {
            localStorage.clear()
            localStorage.setItem('p2e-sortable-width:column-sizing', JSON.stringify({ role: 240 }))
            return {}
        },
    ],
    render: () => (
        <div className='w-[900px]'>
            <StyledTable
                columns={widthColumns}
                data={indicatorRows}
                enableColumnResizing
                hideFooter
                locale='en'
                uniqueKey='p2e-sortable-width'
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        await expect(headerOf(canvasElement, 'Sortable 120').style.width).toBe('140px')
        await expect(headerOf(canvasElement, 'Plain').style.width).toBe('120px')
        await expect(headerOf(canvasElement, 'Saved width').style.width).toBe('240px')
        await expect(headerOf(canvasElement, 'Sortable, no size').style.width).toBe('170px')
    },
}

const triangleColumns: ColumnDef<TableRow>[] = [
    { accessorKey: 'name', header: 'Ascending', size: 130 },
    { accessorKey: 'role', header: 'Descending', size: 130 },
    { accessorKey: 'description', header: 'A long label that is cut short by the column', size: 100 },
    { accessorKey: 'updatedBy', header: 'Unsorted', size: 130 },
    { id: 'last', header: 'Last column', size: 120 },
]

/**
 * ASMA-8597, UX round 4 (D16, ST-20): the visible sort triangle is at most 20 px wide, in a slot that is exactly 20 px, and
 * it overlaps neither the label nor the resize zone, with a short label and with a truncated one. Resizing is on by default,
 * so each of these columns has a zone at its right edge. The hover and focus states are measured by the interaction test.
 */
export const TriangleFitsSlot: Story = {
    loaders: [
        () => {
            localStorage.clear()
            return {}
        },
    ],
    render: () => (
        <div className='w-[860px]'>
            <StyledTable
                columns={triangleColumns}
                data={indicatorRows}
                hideFooter
                initialState={{
                    sorting: [
                        { id: 'name', desc: false },
                        { id: 'role', desc: true },
                        { id: 'description', desc: false },
                    ],
                }}
                locale='en'
            />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const overlaps = (left: DOMRect, right: DOMRect): boolean => left.left < right.right - 0.5 && left.right > right.left + 0.5

        for (const label of ['Ascending', 'Descending', 'A long label that is cut short by the column']) {
            const cell = headerOf(canvasElement, label)
            const slot = cell.querySelector<HTMLElement>('[data-sort-state]')!
            const glyph = Array.from(slot.querySelectorAll<SVGElement>('svg')).find(
                (svg) => getComputedStyle(svg).visibility === 'visible',
            )!
            const triangle = glyph.querySelector('path')!.getBoundingClientRect()
            const text = cell.querySelector<HTMLElement>('[class*="header-content"]')!.getBoundingClientRect()
            const zone = cell.querySelector<HTMLElement>('[class*="resizer"]')!.getBoundingClientRect()

            await expect(slot.getBoundingClientRect().width).toBe(20)
            await expect(triangle.width).toBeLessThanOrEqual(20)
            await expect(overlaps(triangle, text)).toBe(false)
            await expect(overlaps(triangle, zone)).toBe(false)
        }
    },
}

const tooltipColumns: ColumnDef<TableRow>[] = [
    { accessorKey: 'name', header: 'Quarterly revenue forecast owner', size: 110 },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'updatedBy', header: 'Updated by', size: 160 },
    { id: 'plain', header: 'A label that cannot sort and is cut short', size: 130, enableSorting: false },
]

/**
 * ASMA-8597 (Ana Rozimova, Jira comment 95216; the owner, 2026-11-11): a header label cut short by its column is shown in
 * full in the table's tooltip, on hover and on keyboard focus of a sortable header; a label that fits has none. It is visual
 * only (the header's accessible name already holds the text, so the sort button gets no `aria-describedby`), Escape closes it
 * and the pointer can move onto it. The text is `pinnedHeaderText` or a string header, the text the column settings use.
 * The play function hovers the first header, so the accessibility run and the baseline see the tooltip open; the keyboard
 * focus look is captured by `visual-tests/interaction-states.ts`.
 */
export const TruncatedHeaderTooltip: Story = {
    loaders: [
        () => {
            localStorage.clear()
            return {}
        },
    ],
    render: () => (
        <div className='w-[680px] pt-16'>
            <StyledTable columns={tooltipColumns} data={indicatorRows} hideFooter locale='en' />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const header = headerOf(canvasElement, 'Quarterly revenue forecast owner')
        const sortButton = header.querySelector<HTMLElement>('[role="button"]')!
        const label = header.querySelector<HTMLElement>('[class*="header-content"]')!

        // The first label is cut short by its column; "Role" fits, and the label that cannot sort is cut short too.
        await waitFor(() => expect(label.scrollWidth).toBeGreaterThan(label.clientWidth))
        await expect(sortButton).not.toHaveAttribute('aria-describedby')
        // The table needs a frame to find that out: hover once it has.
        await new Promise((resolve) => setTimeout(resolve, 250))
        await userEvent.hover(sortButton)
        await waitFor(() => expect(canvasElement.ownerDocument.querySelector('[role="tooltip"]')).not.toBeNull(), { timeout: 3000 })

        await expect(canvasElement.ownerDocument.querySelector('[role="tooltip"]')).toHaveTextContent('Quarterly revenue forecast owner')
        await expect(sortButton).not.toHaveAttribute('aria-describedby')
    },
}
