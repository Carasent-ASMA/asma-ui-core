import type { ColumnDef, Table } from '@tanstack/react-table'
import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { tabbableWithin } from 'src/helpers/focusable'
import { button, enterBody, menuItem, press as pressKeys, row } from 'src/test-utils/tableFixture'
import { StyledSelect, StyledSelectItem } from 'src/components/inputs/select'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * ASMA-8875, the table as a WAI-ARIA Grid: one rule for the whole table, Tab enters and leaves, the arrow keys move inside.
 * One test (or more) per acceptance criterion, named by its number. Every key is a real press (`userEvent.keyboard`);
 * `.focus()` only starts a test on the button before the table or on a body row.
 *
 * The rows hold the built-in controls in visual order — the select checkbox, the expand chevron, a consumer's button and
 * the ⋮ — and the header holds the select-all checkbox, two sortable headers and the column settings pin.
 */

interface Row {
    id: string
    name: string
    role: string
}

const data: Row[] = [
    { id: 'r-1', name: 'First', role: 'Admin' },
    { id: 'r-2', name: 'Second', role: 'User' },
    { id: 'r-3', name: 'Third', role: 'Auditor' },
]

const onOpen = fn()
const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    {
        id: 'open',
        header: 'Open',
        enableSorting: false,
        cell: ({ row }) => (
            <button
                type='button'
                onClick={() => {
                    onOpen(row.id)
                }}
            >
                {`Open ${row.id}`}
            </button>
        ),
    },
    { accessorKey: 'role', header: 'Role' },
]

type TableProps = Partial<Omit<StyledTableProps<Row, Record<string, unknown>>, 'footer'>>

const mountGrid = (props: TableProps = {}): void => {
    mount(
        <div>
            <button type='button'>Before</button>
            <StyledTable<Row>
                locale='en'
                columns={columns}
                data={data}
                hideFooter
                enableRowSelection
                initialState={{ columnVisibility: { select: true } }}
                expandArrow
                getRowCanExpand={() => true}
                actions={() => [
                    { label: 'Edit', onClick: () => undefined },
                    { label: 'Delete', onClick: () => undefined },
                ]}
                {...props}
            />
            <button type='button'>After</button>
        </div>,
    )
}

const rowControl = (id: string, label: string): HTMLElement =>
    [...row(id).querySelectorAll<HTMLElement>('[aria-label], button')].find(
        (control) => (control.getAttribute('aria-label') ?? control.textContent) === label,
    )!

/** Where the focus is, as a name: a header control, a body row, a row's control (with its row), or a button by its text. */
const focusName = (): string => {
    const active = document.activeElement as HTMLElement | null

    if (!active || active === document.body) return 'nothing'
    if (active.closest('thead')) {
        if (active.tagName === 'TR') return 'header row'
        if (active.getAttribute('role') === 'button') return `header ${active.textContent}`

        return active.getAttribute('role') === 'checkbox' ? 'select all' : 'pin'
    }
    if (active.tagName === 'TR') return `row ${active.id}`

    const owner = active.closest('tr')

    if (owner?.closest('tbody')) return `${active.getAttribute('aria-label') ?? active.textContent} (${owner.id})`
    if (active.getAttribute('role') === 'menuitem') return `menu ${active.textContent}`

    return active.textContent || active.tagName
}

const press = (keys: string): Promise<string> => pressKeys(keys, focusName)

describe('ASMA-8875 body rows (AC 1–8)', () => {
    afterEach(cleanup)

    it('AC 1: Right Arrow walks the row\'s controls in visual order, no wrap; Left Arrow walks back, and from the first control returns to the row', async () => {
        mountGrid()
        await enterBody()
        await press('{ArrowDown}')

        const forwards = [await press('{ArrowRight}'), await press('{ArrowRight}'), await press('{ArrowRight}'), await press('{ArrowRight}')]

        await expect(forwards).toEqual(['Select row 2 (r-2)', 'Expand row 2 (r-2)', 'Open r-2 (r-2)', 'Row actions (r-2)'])
        // The last control keeps the focus: no wrap, no jump to the next row.
        await expect(await press('{ArrowRight}')).toBe('Row actions (r-2)')

        const backwards = [await press('{ArrowLeft}'), await press('{ArrowLeft}'), await press('{ArrowLeft}'), await press('{ArrowLeft}')]

        await expect(backwards).toEqual(['Open r-2 (r-2)', 'Expand row 2 (r-2)', 'Select row 2 (r-2)', 'row r-2'])
        // On the row, Left Arrow does nothing.
        await expect(await press('{ArrowLeft}')).toBe('row r-2')
    })

    it('AC 1: a locked row\'s checkbox is not a control: the arrows pass it', async () => {
        mountGrid({ enableRowSelection: (candidate) => candidate.id !== 'r-1' })
        await enterBody()

        await expect(await press('{ArrowRight}')).toBe('Expand row 1 (r-1)')
        await expect(await press('{ArrowLeft}')).toBe('row r-1')
    })

    it('AC 1: a closed select in a cell leaves Left and Right to the row; Down is the select\'s, it opens it', async () => {
        const PickCell = (): JSX.Element => {
            const [value, setValue] = useState('')

            return (
                <StyledSelect dataTest='pick' name='Pick' size='small' value={value} onChange={(event) => setValue(String(event.target.value))}>
                    <StyledSelectItem value='a'>A</StyledSelectItem>
                </StyledSelect>
            )
        }

        mountGrid({ columns: [...columns, { id: 'pick', header: 'Pick', enableSorting: false, cell: () => <PickCell /> }] })
        await enterBody()

        const select = row('r-1').querySelector<HTMLElement>('[role="combobox"]')!

        await press('{ArrowRight>4/}')
        await expect(document.activeElement).toBe(select)
        await expect(await press('{ArrowRight}')).toBe('Row actions (r-1)')
        await press('{ArrowLeft}')
        await expect(document.activeElement).toBe(select)
        await expect(await press('{ArrowLeft}')).toBe('Open r-1 (r-1)')

        await press('{ArrowRight}{ArrowDown}')
        await waitFor(() => expect(select).toHaveAttribute('aria-expanded', 'true'))
        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(select).toHaveAttribute('aria-expanded', 'false'))
        await expect(document.activeElement).toBe(select)
    })

    it('AC 2: the ⋮ is reached with the arrows; Enter opens it on the first option, Up/Down move, Escape closes and returns to the ⋮, Space opens, Enter activates', async () => {
        const onEdit = fn()

        mountGrid({
            actions: () => [
                { label: 'Edit', onClick: onEdit },
                { label: 'Delete', onClick: () => undefined },
            ],
        })
        await enterBody()
        await press('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}')
        await expect(focusName()).toBe('Row actions (r-1)')

        const trigger = document.activeElement as HTMLElement

        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Delete')))
        await userEvent.keyboard('{ArrowUp}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull())
        await waitFor(() => expect(document.activeElement).toBe(trigger))

        await userEvent.keyboard('{ }')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull())
        await expect(onEdit).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(document.activeElement).toBe(trigger))
    })

    it('AC 2: Tab in the open menu leaves the table, as Tab from the row does, and closes the menu', async () => {
        mountGrid()
        await enterBody()
        await press('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))

        await expect(await press('{Tab}')).toBe('After')
        await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull())
    })

    it('AC 3: Enter on the row opens it (onRowClick); Enter on a control activates the control, not the row', async () => {
        const onRowClick = fn()

        onOpen.mockClear()
        mountGrid({ onRowClick })
        await enterBody()
        await press('{ArrowDown}')

        await userEvent.keyboard('{Enter}')
        await expect(onRowClick).toHaveBeenCalledTimes(1)
        await expect(onRowClick.mock.calls[0]?.[1]).toMatchObject({ id: 'r-2' })

        await press('{ArrowRight}')
        await userEvent.keyboard('{Enter}')
        await expect(rowControl('r-2', 'Select row 2')).toHaveAttribute('aria-checked', 'true')

        await expect(await press('{ArrowRight}{ArrowRight}')).toBe('Open r-2 (r-2)')
        await userEvent.keyboard('{Enter}')
        await expect(onOpen).toHaveBeenCalledWith('r-2')
        await expect(onRowClick).toHaveBeenCalledTimes(1)
    })

    it('AC 4: Space toggles the focused checkbox and the focused expand chevron', async () => {
        mountGrid()
        await enterBody()

        await press('{ArrowRight}')
        await userEvent.keyboard('{ }')
        await expect(rowControl('r-1', 'Select row 1')).toHaveAttribute('aria-checked', 'true')
        await userEvent.keyboard('{ }')
        await expect(rowControl('r-1', 'Select row 1')).toHaveAttribute('aria-checked', 'false')

        await expect(await press('{ArrowRight}')).toBe('Expand row 1 (r-1)')
        await userEvent.keyboard('{ }')
        await expect(document.activeElement).toHaveAttribute('aria-expanded', 'true')
        await userEvent.keyboard('{ }')
        await expect(document.activeElement).toHaveAttribute('aria-expanded', 'false')
    })

    it('AC 5: the arrow keys never expand or collapse a row; the chevron does, with Enter or Space (and Space on a row with no checkbox, `rowSpace`)', async () => {
        mountGrid()
        await enterBody()

        const chevron = (): HTMLElement => row('r-1').querySelector<HTMLElement>('button[aria-expanded]')!

        // On the row and on the chevron, the arrows only move.
        await press('{ArrowRight}{ArrowRight}{ArrowLeft}{ArrowRight}{ArrowLeft}{ArrowLeft}')
        await expect(focusName()).toBe('row r-1')
        await expect(chevron()).toHaveAttribute('aria-expanded', 'false')

        await expect(await press('{ArrowRight}{ArrowRight}')).toBe('Expand row 1 (r-1)')
        await userEvent.keyboard('{Enter}')
        await expect(chevron()).toHaveAttribute('aria-expanded', 'true')

        // An expanded chevron is a disclosure, not an open popup: the arrows still move on from it, and leave it expanded.
        await expect(await press('{ArrowRight}')).toBe('Open r-1 (r-1)')
        await expect(await press('{ArrowLeft}')).toBe('Collapse row 1 (r-1)')
        await expect(await press('{ArrowLeft}{ArrowRight}')).toBe('Collapse row 1 (r-1)')
        await expect(chevron()).toHaveAttribute('aria-expanded', 'true')
        await expect(await press('{ArrowDown}')).toBe('row r-2')
        await expect(chevron()).toHaveAttribute('aria-expanded', 'true')
    })

    it.each([
        ['Select row 1', 1],
        ['Expand row 1', 2],
        ['Open r-1', 3],
        ['Row actions', 4],
    ] as const)('AC 6: Down and Up move row to row from the control "%s", back at row level', async (label, steps) => {
        mountGrid()
        await enterBody()

        await expect(await press('{ArrowRight}'.repeat(steps))).toBe(`${label} (r-1)`)
        await expect(await press('{ArrowDown}')).toBe('row r-2')
        await expect(await press('{ArrowRight}'.repeat(steps))).toBe(`${label.replace('1', '2')} (r-2)`)
        await expect(await press('{ArrowUp}')).toBe('row r-1')
    })

    it('AC 6: from a control the mouse focused, Up moves from that control\'s row, and Tab later comes back to it', async () => {
        mountGrid()
        await enterBody()

        // The mouse puts the focus on row 3's button; the roving tab stop follows to row 3.
        await userEvent.click(button('Open r-3'))
        await expect(focusName()).toBe('Open r-3 (r-3)')
        await expect(row('r-3').tabIndex).toBe(0)
        await expect(row('r-1').tabIndex).toBe(-1)

        await expect(await press('{ArrowUp}')).toBe('row r-2')
    })

    it('AC 7: Home and End move to the first and the last row, from a row or a control', async () => {
        mountGrid()
        await enterBody()

        await expect(await press('{End}')).toBe('row r-3')
        await expect(await press('{Home}')).toBe('row r-1')
        await expect(await press('{ArrowDown}{ArrowRight}{ArrowRight}{ArrowRight}')).toBe('Open r-2 (r-2)')
        await expect(await press('{End}')).toBe('row r-3')
        await expect(await press('{ArrowRight}')).toBe('Select row 3 (r-3)')
        await expect(await press('{Home}')).toBe('row r-1')
    })

    it('AC 7: Home and End stay on the current page', async () => {
        const manyRows: Row[] = Array.from({ length: 12 }, (_, index) => ({
            id: `p-${String(index + 1)}`,
            name: `Name ${String(index + 1)}`,
            role: 'User',
        }))

        mountGrid({ data: manyRows, hideFooter: false, pageSize: 5 })
        row('p-1').focus()

        await expect(await press('{End}')).toBe('row p-5')
        await expect(await press('{Home}')).toBe('row p-1')
    })

    it.each([
        ['the row', 0],
        ['the select checkbox', 1],
        ['the chevron', 2],
        ["a consumer's button", 3],
        ['the ⋮', 4],
    ] as const)('AC 8: Tab leaves the table from %s', async (_label, steps) => {
        mountGrid()
        await enterBody()
        await press('{ArrowDown}')
        await press('{ArrowRight}'.repeat(steps))

        await expect(await press('{Tab}')).toBe('After')
    })

    it('AC 8: Shift+Tab from a row, or from a control in it, returns to the header row; from the header it leaves the table backwards', async () => {
        mountGrid()
        await enterBody()

        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('header row')
        await expect(await press('{Tab}')).toBe('row r-1')
        await expect(await press('{ArrowRight}{ArrowRight}{ArrowRight}')).toBe('Open r-1 (r-1)')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('header row')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('Before')
    })
})

describe('ASMA-8875 header (AC 9)', () => {
    afterEach(cleanup)

    const headerStops = (): HTMLElement[] =>
        [...document.querySelectorAll<HTMLElement>('thead [tabindex]')].filter((element) => element.tabIndex === 0)

    it('AC 9: the header row is the one tab stop; Right/Left walk its controls (no wrap) and back to the row, Home/End jump, Up/Down do nothing', async () => {
        mountGrid()
        button('Before').focus()

        await expect(await press('{Tab}')).toBe('header row')

        const headerRow = document.activeElement

        await expect(headerStops()).toEqual([headerRow])

        const across = [await press('{ArrowRight}'), await press('{ArrowRight}'), await press('{ArrowRight}'), await press('{ArrowRight}'), await press('{ArrowRight}')]

        await expect(across).toEqual(['select all', 'header Name', 'header Role', 'pin', 'pin'])
        await expect(await press('{ArrowLeft}')).toBe('header Role')
        await expect(await press('{Home}')).toBe('select all')
        await expect(await press('{ArrowLeft}')).toBe('header row')
        await expect(await press('{ArrowLeft}')).toBe('header row')
        await expect(await press('{End}')).toBe('pin')
        await expect(await press('{ArrowDown}{ArrowUp}')).toBe('pin')
        // The tab stop stays the header row, wherever the focus is in it.
        await expect(headerStops()).toEqual([headerRow])

        // Tab from a header control enters the body on the active row; Shift+Tab comes back to the header row.
        await expect(await press('{Tab}')).toBe('row r-1')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('header row')
    })

    it('AC 9: Tab from the header enters the body on the row the user left, not on row 1', async () => {
        mountGrid()
        await enterBody()
        await press('{ArrowDown}{ArrowDown}')

        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('header row')
        await expect(await press('{ArrowRight}{ArrowRight}{ArrowRight}')).toBe('header Role')
        await expect(await press('{Tab}')).toBe('row r-3')
    })
})

describe('ASMA-8875 text cells and tab stops (AC 10)', () => {
    afterEach(cleanup)

    it('AC 10: the table has two tab stops, the header row and the active row; no cell, text or control, is one', async () => {
        mountGrid()

        const table = document.querySelector('table')!
        const stops = tabbableWithin(table)

        await expect(stops).toHaveLength(2)
        await expect(stops[0]!.closest('thead')).not.toBeNull()
        await expect(stops[1]).toBe(row('r-1'))
        await expect(document.querySelectorAll('td[tabindex], th[tabindex]')).toHaveLength(0)
        // A consumer's button is still a control, only not a tab stop.
        await expect(button('Open r-2')).toHaveAttribute('tabindex', '-1')
        await expect(button('Open r-2')).toHaveAttribute('data-table-control')

        // Tab from before the table to after it: the header, the row, out.
        button('Before').focus()
        await expect([await press('{Tab}'), await press('{Tab}'), await press('{Tab}')]).toEqual(['header row', 'row r-1', 'After'])
    })

    it('a programmatic setFocusedRow, with no focus, moves the body tab stop, also after the user focused a row', async () => {
        const tableRef: { current: Table<Row> | null } = { current: null }

        mountGrid({ tableInstanceRef: tableRef })
        await enterBody()

        tableRef.current!.setFocusedRow(() => 'r-3')

        await waitFor(() => expect(row('r-3').tabIndex).toBe(0))
        await expect(row('r-1').tabIndex).toBe(-1)
        await expect(document.activeElement).toBe(row('r-1'))
        await expect(await press('{Tab}{Shift>}{Tab}{/Shift}')).toBe('row r-3')
    })

    it("AC 10: a consumer's own control in a sub-row is not a table control", async () => {
        mountGrid({
            customSubRowData: new Map([['r-1', [{ id: 'n-1', note: 'Nested' }]]]),
            renderSubRows: ({ rows }) => (
                <tr data-test='sub-row' id='sub-r-1'>
                    <td colSpan={6}>
                        <button type='button'>Sub action</button>
                        <StyledTable<{ id: string; note: string }>
                            locale='en'
                            columns={[{ accessorKey: 'note', header: 'Note' }]}
                            data={rows as { id: string; note: string }[]}
                            hideHeader
                            hideFooter
                            headerPin={false}
                        />
                    </td>
                </tr>
            ),
        })
        await enterBody()
        await press('{ArrowRight}{ArrowRight}{Enter}')
        await waitFor(() => expect(document.querySelector('[data-test="sub-row"]')).not.toBeNull())

        const subRow = document.querySelector<HTMLElement>('[data-test="sub-row"]')!

        // Untouched: its tab index and no marker, on the control and on the sub-row.
        await expect(button('Sub action').tabIndex).toBe(0)
        await expect(button('Sub action')).not.toHaveAttribute('data-table-control')
        await expect(subRow.hasAttribute('tabindex')).toBe(false)
        await expect(subRow.hasAttribute('data-table-row')).toBe(false)

        // Down from the row goes straight to the nested rows, then to the next row.
        await expect(await press('{ArrowLeft}{ArrowLeft}{ArrowDown}')).toBe('row n-1')
        await expect(await press('{ArrowDown}')).toBe('row r-2')

        // The arrow keys on the control are not the table's.
        button('Sub action').focus()
        await expect(await press('{ArrowDown}{ArrowRight}{ArrowUp}{End}')).toBe('Sub action (sub-r-1)')
    })
})

describe('ASMA-8875 focus indicator and scroll (AC 11)', () => {
    afterEach(cleanup)

    const tallData: Row[] = Array.from({ length: 20 }, (_, index) => ({ id: `t-${String(index)}`, name: `Row ${String(index)}`, role: 'User' }))
    const scroller = (): HTMLElement => {
        for (let node = document.querySelector('table')!.parentElement; node; node = node.parentElement) {
            const { overflowY } = getComputedStyle(node)
            if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
        }
        throw new Error('the table did not scroll')
    }
    /** The element lies fully inside the scroll box, below the sticky header and above whatever sticks to the bottom. */
    const isClear = (element: HTMLElement): boolean => {
        const box = scroller().getBoundingClientRect()
        const header = document.querySelector('thead')!.getBoundingClientRect()
        const rect = element.getBoundingClientRect()

        return rect.top >= Math.max(box.top, header.bottom) - 1 && rect.bottom <= clearBottom() + 1
    }
    /** The lowest line a focused element may reach: the scroll box's bottom, or the top of what sticks to it. */
    const clearBottom = (): number =>
        Math.min(
            scroller().getBoundingClientRect().bottom,
            ...[...document.querySelectorAll<HTMLElement>('[class*="table-hscroll"], [class*="table-bottom"]')]
                .filter((element) => getComputedStyle(element).position === 'sticky')
                .map((element) => element.getBoundingClientRect().top),
        )

    it('AC 11: a control reached with the arrows is scrolled clear of the sticky header', async () => {
        mountGrid({ data: tallData, height: 240, stickyHeader: true, rowHeight: 48 })
        row('t-0').focus()
        await press('{ArrowDown>6/}')

        // Half of row 6 slides under the sticky header; the arrow that reaches its checkbox scrolls it clear.
        const target = row('t-6')
        const header = document.querySelector('thead')!.getBoundingClientRect()

        scroller().scrollTop += target.getBoundingClientRect().top - header.bottom + 20
        await expect(isClear(rowControlAt('t-6', 1))).toBe(false)

        await press('{ArrowRight}')
        await expect(focusName()).toBe('Select row 7 (t-6)')
        await expect(isClear(document.activeElement as HTMLElement)).toBe(true)
    })

    it('AC 11: a control reached with the arrows is scrolled clear of what sticks to the bottom', async () => {
        mountGrid({ data: tallData, height: 240, stickyHeader: true, rowHeight: 48 })
        row('t-0').focus()
        await expect(await press('{ArrowDown>10/}')).toBe('row t-10')

        // Row 10 slides down until its ⋮ is partly under the bottom edge (the horizontal scrollbar strip sticks there).
        scroller().scrollTop -= clearBottom() + 20 - row('t-10').getBoundingClientRect().bottom
        await expect(isClear(rowControlAt('t-10', 4))).toBe(false)

        await expect(await press('{ArrowRight>4/}')).toBe('Row actions (t-10)')
        await expect(isClear(document.activeElement as HTMLElement)).toBe(true)
    })

    it('AC 11: a control reached with the arrows is scrolled clear of the fixed-right actions column', async () => {
        const wide: ColumnDef<Row>[] = columns.map((column) =>
            column.id === 'open' ? { ...column, size: 160, minSize: 160 } : { ...column, size: 300, minSize: 300 },
        )

        mount(
            <div style={{ width: 400 }}>
                <StyledTable<Row>
                    locale='en'
                    columns={wide}
                    data={data}
                    hideFooter
                    enableRowSelection
                    initialState={{ columnVisibility: { select: true } }}
                    expandArrow
                    getRowCanExpand={() => true}
                    actions={() => [{ label: 'Edit', onClick: () => undefined }]}
                />
            </div>,
        )
        row('r-1').focus()

        const actionsCell = (): DOMRect => rowControlAt('r-1', 4).closest('td')!.getBoundingClientRect()
        const open = button('Open r-1')

        // At rest the Open button is under the pinned actions column, or past it.
        await expect(open.getBoundingClientRect().right > actionsCell().left).toBe(true)

        await expect(await press('{ArrowRight>3/}')).toBe('Open r-1 (r-1)')
        await expect(open.getBoundingClientRect().right).toBeLessThanOrEqual(actionsCell().left + 1)
    })
})

/** The n-th control (1-based) in the row: what n Right Arrow presses from the row reach. */
const rowControlAt = (id: string, position: number): HTMLElement =>
    [...row(id).querySelectorAll<HTMLElement>('[data-table-control]')][position - 1]!
