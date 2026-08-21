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
    { accessorKey: 'name', header: 'Workspace name', fixedLeft: true, size: 280 },
    {
        accessorKey: 'description',
        header: 'Description',
        size: 160,
        cell: ({ row }) => <div className='py-[14px]'>{row.original.description}</div>,
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
    loaders: [
        () => {
            localStorage.setItem(COLUMN_SIZING_KEY, JSON.stringify({ name: 240 }))
            return {}
        },
    ],
    render: () => <TableFixture />,
    play: async ({ canvasElement }) => {
        const nameHeader = Array.from(canvasElement.querySelectorAll<HTMLElement>('th')).find(
            (header) => header.textContent === 'Workspace name',
        )

        await expect(nameHeader).toBeDefined()
        await expect(nameHeader?.style.width).toBe('240px')
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
        await expect(actionsCell!.getBoundingClientRect().right).toBe(initialActionsCellBounds.right)

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
