import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { ariaSorts, button, row } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Keyboard reach of the table header. ASMA-8702 made the header controls reachable (K-01 to K-22); ASMA-8875 replaced its
 * Tab walk with the WAI-ARIA Grid rule for the whole table: Tab enters and leaves, the arrow keys move inside.
 *
 * The header works like a body row (the user's decision, 2026-11-16): the header row itself is its ONE tab stop. Right
 * from the row walks the sortable headers and the column settings pin in visual order, Left from the first comes back to
 * the row, Home/End jump, Up/Down do nothing. Tab from the row or any header control goes to the body's active row (the row
 * the user left), Shift+Tab leaves the table backwards, and Shift+Tab from the body comes back to the header row. The
 * rows' own controls are not tab stops either (K-20, K-21). Every key here is a real press from `userEvent.keyboard`.
 * `.focus()` is used only to start a test on `Before`, `After`, the footer's row count or a body row, places a key
 * reaches; no test puts the focus on a header or the pin that way. The acceptance criteria themselves are pinned in
 * `StyledTable.gridKeyboard.interaction.test.tsx`.
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

const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role' },
]

type TableProps = Partial<Omit<StyledTableProps<Row, Record<string, unknown>>, 'footer'>>

const mountBetweenButtons = (props: TableProps = {}): void => {
    mount(
        <div>
            <button type='button'>Before</button>
            <StyledTable<Row> locale='en' columns={columns} data={data} hideFooter {...props} />
            <button type='button'>After</button>
        </div>,
    )
}

const sortControl = (label: string): HTMLElement =>
    [...document.querySelectorAll<HTMLElement>('thead [role="button"]')].find((control) => control.textContent === label)!
const pin = (): HTMLElement => document.querySelector<HTMLElement>('thead button[aria-haspopup="true"]')!
const headerRow = (): HTMLTableRowElement => document.querySelector<HTMLTableRowElement>('thead tr')!

/** Where the focus is, as a name: the header row, a sort header by label, the pin, a body row by id, or a button. */
const focusName = (): string => {
    const active = document.activeElement as HTMLElement | null

    if (!active) return 'nothing'
    if (active.closest('thead')) {
        if (active.tagName === 'TR') return 'header row'
        if (active.getAttribute('role') === 'button') return `header ${active.textContent}`

        return active.getAttribute('role') === 'checkbox' ? 'select all' : 'pin'
    }
    if (active.closest('tbody')) return active.tagName === 'TR' ? `row ${active.id}` : `cell ${active.textContent ?? ''}`

    return active.textContent || active.tagName
}

interface AccessibilityNode {
    role?: { value?: string }
    name?: { value?: string }
}
interface FrameTree {
    frame: { id: string }
    childFrames?: FrameTree[]
}
const frameIds = (tree: FrameTree): string[] => [tree.frame.id, ...(tree.childFrames ?? []).flatMap(frameIds)]

/**
 * The names of the column headers in Chrome's own accessibility tree (what a screen reader is given), through the
 * DevTools protocol. `getFullAXTree` leaves out what is `inert`, `aria-hidden` or `display: none`, so a header that a
 * screen reader cannot reach has no entry. The tests run in an iframe, so every frame is asked.
 */
const exposedColumnHeaders = async (): Promise<string[]> => {
    const session = cdp()

    await session.send('Accessibility.enable')

    const { frameTree } = (await session.send('Page.getFrameTree')) as { frameTree: FrameTree }
    const names: string[] = []

    for (const frameId of frameIds(frameTree)) {
        const { nodes } = (await session.send('Accessibility.getFullAXTree', { frameId })) as { nodes: AccessibilityNode[] }

        for (const node of nodes) {
            if (node.role?.value === 'columnheader') names.push(node.name?.value ?? '')
        }
    }

    return names
}

const tab = async (shift = false): Promise<string> => {
    await userEvent.keyboard(shift ? '{Shift>}{Tab}{/Shift}' : '{Tab}')

    return focusName()
}

const arrow = async (key: 'Right' | 'Left' | 'Home' | 'End'): Promise<string> => {
    await userEvent.keyboard(key === 'Home' || key === 'End' ? `{${key}}` : `{Arrow${key}}`)

    return focusName()
}

describe('StyledTable header keyboard reach (K-01 to K-05)', () => {
    afterEach(cleanup)

    it("K-01: Tab from the element before the table reaches the header row, the header's one tab stop; its controls are not stops", async () => {
        mountBetweenButtons()
        button('Before').focus()

        await expect(await tab()).toBe('header row')
        await expect(headerRow().tabIndex).toBe(0)
        await expect([...document.querySelectorAll<HTMLElement>('thead [data-table-control]')].map((control) => control.tabIndex)).toEqual([-1, -1, -1])
    })

    it('K-01: a fixed-left header comes first, wherever it sits in the column list', async () => {
        mountBetweenButtons({
            columns: [
                { accessorKey: 'role', header: 'Role' },
                { accessorKey: 'name', header: 'Name', fixedLeft: true },
            ],
        })
        button('Before').focus()

        await expect(await tab()).toBe('header row')
        await expect(await arrow('Right')).toBe('header Name')
        await expect(await arrow('Right')).toBe('header Role')
    })

    it('K-02: Right from the header row walks every sortable header in visual order, then the pin (no wrap); Left goes back to the row', async () => {
        mountBetweenButtons()
        button('Before').focus()

        const stops = [await tab(), await arrow('Right'), await arrow('Right'), await arrow('Right'), await arrow('Right')]

        await expect(stops).toEqual(['header row', 'header Name', 'header Role', 'pin', 'pin'])
        await expect(document.activeElement?.closest('tbody')).toBeNull()
        // One tab stop in the header at any time: the row, wherever the focus is in it.
        await expect([...document.querySelectorAll<HTMLElement>('thead [tabindex="0"]')]).toEqual([headerRow()])
        await expect([await arrow('Left'), await arrow('Left'), await arrow('Left'), await arrow('Left')]).toEqual([
            'header Role',
            'header Name',
            'header row',
            'header row',
        ])
    })

    it('K-02: Up and Down on the header row or a header control do nothing: the header is not linked to the body', async () => {
        mountBetweenButtons()
        button('Before').focus()

        await expect(await tab()).toBe('header row')
        await userEvent.keyboard('{ArrowDown}{ArrowUp}')
        await expect(focusName()).toBe('header row')
        await expect(await arrow('Right')).toBe('header Name')
        await userEvent.keyboard('{ArrowDown}{ArrowUp}')
        await expect(focusName()).toBe('header Name')
    })

    it('K-03 / K-11: Tab from any header control enters the body at the row the user left, not at row 1', async () => {
        mountBetweenButtons()

        // Nothing worked with yet: the first row holds the tab stop.
        button('Before').focus()
        await expect(await tab()).toBe('header row')
        await expect(await tab()).toBe('row r-1')

        // The user moves to row 3, goes back to the header, and Tab returns to row 3, from the header row or the pin.
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')
        await expect(focusName()).toBe('row r-3')
        await expect(await tab(true)).toBe('header row')
        await expect(await tab()).toBe('row r-3')
        await expect(await tab(true)).toBe('header row')
        await expect(await arrow('End')).toBe('pin')
        await expect(await tab()).toBe('row r-3')
    })

    it('K-04 / K-11: Shift+Tab from the active body row goes to the header row, whatever header control was used last', async () => {
        mountBetweenButtons()
        row('r-2').focus()

        await expect(await tab(true)).toBe('header row')
        await expect(await arrow('End')).toBe('pin')
        await expect(await tab()).toBe('row r-2')
        await expect(await tab(true)).toBe('header row')
    })

    it('K-05: Shift+Tab from the header row, or from any header control, leaves the table backwards: no trap', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await expect(await tab()).toBe('header row')

        await expect(await tab(true)).toBe('Before')
        await expect(document.activeElement?.closest('table')).toBeNull()

        await expect(await tab()).toBe('header row')
        await expect(await arrow('Right')).toBe('header Name')
        await expect(await arrow('Right')).toBe('header Role')
        await expect(await tab(true)).toBe('Before')
    })
})

describe('StyledTable header controls work from the keyboard (K-06, K-13)', () => {
    afterEach(cleanup)

    it('K-06 / AC 9: Enter and Space on a header sort it, and aria-sort follows; on the header row they do nothing', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await expect(await tab()).toBe('header row')
        await userEvent.keyboard('{Enter}')
        await expect(ariaSorts()['Name']).toBe('none')
        await expect(await arrow('Right')).toBe('header Name')

        await userEvent.keyboard('{Enter}')
        await expect(ariaSorts()['Name']).toBe('ascending')
        await userEvent.keyboard('{ }')
        await expect(ariaSorts()['Name']).toBe('descending')
        // The focus stays on the header it sorted.
        await expect(focusName()).toBe('header Name')
    })

    it('K-13: a Tab on a header control that something already handled (defaultPrevented) is left alone', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await tab()
        await expect(await arrow('End')).toBe('pin')

        // An earlier handler (what the column settings popover does) takes the Tab and moves focus on purpose.
        const takeTab = (event: KeyboardEvent): void => {
            if (event.key !== 'Tab') return
            event.preventDefault()
            button('After').focus()
        }

        document.addEventListener('keydown', takeTab, true)
        try {
            await userEvent.keyboard('{Tab}')
        } finally {
            document.removeEventListener('keydown', takeTab, true)
        }

        await expect(document.activeElement).toBe(button('After'))
    })

    it('Tab from the header row, or from any header control, goes to the rows: the header is one stop (ASMA-8875)', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await expect(await tab()).toBe('header row')
        await expect(await tab()).toBe('row r-1')

        await expect(await tab(true)).toBe('header row')
        await expect(await arrow('Right')).toBe('header Name')
        await expect(await tab()).toBe('row r-1')
    })
})

describe('StyledTable with no header controls (K-08, K-09)', () => {
    afterEach(cleanup)

    it('K-08: with nothing sortable and no pin, Tab goes straight to the active row and Shift+Tab leaves the table backwards, past the controls inside the rows', async () => {
        // A button in each row, so the browser's own previous stop from row 2 would be row 1's button.
        mountBetweenButtons({
            columns: [
                {
                    accessorKey: 'name',
                    header: 'Name',
                    enableSorting: false,
                    cell: ({ row: tableRow }) => <button type='button'>{`Open ${tableRow.id}`}</button>,
                },
            ],
            headerPin: false,
        })
        button('Before').focus()

        await expect(await tab()).toBe('row r-1')
        await userEvent.keyboard('{ArrowDown}')
        await expect(focusName()).toBe('row r-2')
        await expect(await tab(true)).toBe('Before')
    })

    it('K-09: a hidden header (hideHeader) is skipped by the keyboard, going forwards and back, with its sort header, pin and select-all as non-stops', async () => {
        mountBetweenButtons({ hideHeader: true, enableRowSelection: true, initialState: { columnVisibility: { select: true } } })

        // They are all there, but none is a tab stop.
        await expect(document.querySelectorAll('thead [role="button"]').length).toBeGreaterThan(0)
        await expect(document.querySelectorAll('thead button[aria-haspopup="true"]').length).toBe(1)
        await expect(document.querySelectorAll('thead [role="checkbox"]').length).toBe(1)
        // Two sort headers, the pin and the select-all checkbox, and none is a tab stop.
        const controls = [...document.querySelectorAll<HTMLElement>('thead [role="button"], thead button, thead [role="checkbox"]')]

        await expect(controls.map((control) => control.tabIndex)).toEqual([-1, -1, -1, -1])

        button('Before').focus()
        await expect(await tab()).toBe('row r-1')
        await expect(await tab(true)).toBe('Before')
        row('r-2').focus()
        await expect(await tab(true)).toBe('Before')
    })

    it('K-09: a hidden header still names its columns in the accessibility tree: not inert, not aria-hidden, with its column headers and aria-sort', async () => {
        mountBetweenButtons({ hideHeader: true })

        const thead = document.querySelector('thead')!

        await expect(thead.hasAttribute('inert')).toBe(false)
        await expect(thead.closest('[inert], [aria-hidden="true"]')).toBeNull()

        for (const label of ['Name', 'Role']) {
            const cell = [...document.querySelectorAll('thead th')].find((candidate) => candidate.textContent?.trim() === label)!

            await expect(cell.closest('[inert], [aria-hidden="true"], [hidden]'), `${label}: not hidden from assistive technology`).toBeNull()
            await expect(getComputedStyle(cell).display).not.toBe('none')
            await expect(getComputedStyle(cell).visibility).toBe('visible')
            await expect(cell.getAttribute('aria-sort'), `${label}: aria-sort is kept`).toBe('none')
        }

        // And in Chrome's accessibility tree itself, where an `inert` header has no column headers at all. The names
        // come out in capitals because the header is styled that way.
        const names = (await exposedColumnHeaders()).map((name) => name.toLowerCase())

        await expect(names).toContain('name')
        await expect(names).toContain('role')
    })

    // The contract of `hideHeader` (ASMA-8702, changed by ASMA-8875): a hidden header has no tab stop at all. ASMA-8702
    // left a consumer's control in a hidden header cell a tab stop (the consumer had to give it `tabIndex={-1}`); the table
    // now takes every control in the header out of the Tab sequence itself, the consumer's included. `inert` is still not
    // the answer (it would take the column names out of the accessibility tree).
    it("K-09 (the hideHeader contract): a consumer's control in a hidden header is not a tab stop either; Tab skips the header", async () => {
        mountBetweenButtons({
            hideHeader: true,
            columns: [{ accessorKey: 'name', header: () => <button type='button'>Menu</button>, enableSorting: false }],
            headerPin: false,
        })
        button('Before').focus()

        await expect(await tab()).toBe('row r-1')
        // The control is still in the accessibility tree and the DOM, only not a stop.
        await expect(button('Menu').tabIndex).toBe(-1)
        await expect(await tab(true)).toBe('Before')
    })

    it('a visible header is not marked hidden', async () => {
        mountBetweenButtons()

        await expect(document.querySelector('thead')!.hasAttribute('data-header-hidden')).toBe(false)
    })
})

describe('StyledTable header controls: the cases around the plan (K-15 to K-19)', () => {
    afterEach(cleanup)

    it('K-15: with nothing sortable and the default pin, the pin is the only header control', async () => {
        mountBetweenButtons({ columns: [{ accessorKey: 'name', header: 'Name', enableSorting: false }] })
        button('Before').focus()

        await expect(await tab()).toBe('header row')
        await expect(await arrow('Right')).toBe('pin')
        await expect(await tab()).toBe('row r-1')
        await expect(await tab(true)).toBe('header row')
        await expect(await tab(true)).toBe('Before')
    })

    it('K-16: with no rows, Tab from the header row or a header control is not trapped: it leaves the table forwards', async () => {
        mountBetweenButtons({ data: [] })
        button('Before').focus()

        await expect(await tab()).toBe('header row')
        // No active row to enter, so the Tab leaves the table forwards.
        await expect(await tab()).toBe('After')

        await expect(await tab(true)).toBe('header row')
        await expect(await arrow('End')).toBe('pin')
        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).not.toBe(pin())
        await expect(document.activeElement?.closest('table')).toBeNull()
    })

    it('K-17: a fixed-right column follows the centre headers and comes before the pin; without the pin it is the last control', async () => {
        const fixedRightColumns: ColumnDef<Row>[] = [
            { accessorKey: 'role', header: 'Role', fixedRight: true },
            { accessorKey: 'name', header: 'Name' },
            { id: 'extra', accessorFn: (item: Row) => item.id, header: 'Extra' },
        ]

        mountBetweenButtons({ columns: fixedRightColumns })
        button('Before').focus()

        // The column list says Role first; the visual and DOM order puts it after the centre headers, then the pin.
        await expect(await tab()).toBe('header row')
        await expect(await arrow('Right')).toBe('header Name')
        await expect(await arrow('Right')).toBe('header Extra')
        await expect(await arrow('Right')).toBe('header Role')
        await expect(await arrow('Right')).toBe('pin')
        await expect(await tab()).toBe('row r-1')

        cleanup()
        mountBetweenButtons({ columns: fixedRightColumns, headerPin: false })
        row('r-2').focus()

        await expect(await tab(true)).toBe('header row')
        await expect(await arrow('End')).toBe('header Role')
        await expect(await tab()).toBe('row r-2')
    })

    it('K-18: the injected select-all checkbox is the first header control, and a Tab from the pin still skips the checkboxes in the rows', async () => {
        mountBetweenButtons({ enableRowSelection: true, initialState: { columnVisibility: { select: true } } })
        button('Before').focus()

        await expect(await tab()).toBe('header row')
        await expect(await arrow('Right')).toBe('select all')
        await expect(await arrow('Right')).toBe('header Name')
        await expect(await arrow('Right')).toBe('header Role')
        await expect(await arrow('Right')).toBe('pin')
        // Each row has a checkbox of its own, after the header and before the later rows; Tab lands on the active row.
        await expect(await tab()).toBe('row r-1')

        // Back to the header row, then to the select-all checkbox, and Space selects every row.
        await expect(await tab(true)).toBe('header row')
        await expect(await arrow('Home')).toBe('select all')
        await userEvent.keyboard('{ }')
        await expect(document.activeElement?.getAttribute('aria-checked')).toBe('true')
    })

    it('K-19: a header element the keyboard cannot land on (tabindex -1, hidden, display: none, visibility: hidden) is not a header control, and is never where the focus is sent', async () => {
        mountBetweenButtons({
            columns: [
                { accessorKey: 'name', header: 'Name' },
                { accessorKey: 'role', header: 'Role' },
                {
                    id: 'menu',
                    enableSorting: false,
                    header: () => (
                        <>
                            <button type='button' tabIndex={-1}>
                                Skipped
                            </button>
                            <button type='button' hidden>
                                Hidden
                            </button>
                            <button type='button' style={{ visibility: 'hidden' }}>
                                Invisible
                            </button>
                            <button type='button' style={{ display: 'none' }}>
                                Not rendered
                            </button>
                        </>
                    ),
                },
            ],
            headerPin: false,
        })

        // The arrows skip them, and the last header control is Role.
        button('Before').focus()
        await expect(await tab()).toBe('header row')
        await expect(await arrow('Right')).toBe('header Name')
        await expect(await arrow('Right')).toBe('header Role')
        await expect(await arrow('Right')).toBe('header Role')
        await expect(await arrow('End')).toBe('header Role')
        await expect(await tab()).toBe('row r-1')

        // Backwards from the body: the header row, the one stop; none of the four the keyboard cannot land on is one.
        await expect(await tab(true)).toBe('header row')
        await expect([...document.querySelectorAll<HTMLElement>('thead [tabindex="0"]')]).toEqual([headerRow()])
    })
})

describe('StyledTable body model since ASMA-8875: the controls inside the rows are not tab stops (K-20, K-21)', () => {
    afterEach(cleanup)

    // ASMA-8087's body model left the rows' own controls as browser tab stops, so Shift+Tab from after the table landed on
    // the LAST row's control and walked back one control per press (K-20, K-21 as ASMA-8702 pinned them). ASMA-8875
    // supersedes it: the controls are reached with the arrow keys, and the table has two tab stops.
    const rowControlColumns: ColumnDef<Row>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row: tableRow }) => <button type='button'>{`Open ${tableRow.id}`}</button>,
        },
        { accessorKey: 'role', header: 'Role' },
    ]

    it("K-20: Shift+Tab from after a table with a control in every row enters at the active row, then the header, then out: one press each", async () => {
        mountBetweenButtons({ columns: rowControlColumns })
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}')
        await expect(focusName()).toBe('row r-2')
        button('After').focus()

        const stops: string[] = []

        for (let presses = 0; presses < 6 && stops.at(-1) !== 'Before'; presses += 1) {
            stops.push(await tab(true))
        }

        await expect(stops).toEqual(['row r-2', 'header row', 'Before'])
    })

    it("K-21: a control focused inside a row moves the roving tab stop to its row, and Shift+Tab on it goes to the header", async () => {
        mountBetweenButtons({ columns: rowControlColumns })
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}')

        await expect(focusName()).toBe('cell Open r-3')
        await expect(row('r-3').tabIndex).toBe(0)
        await expect(row('r-1').tabIndex).toBe(-1)
        await expect(await tab(true)).toBe('header row')
        await expect(await tab()).toBe('row r-3')
    })
})

describe('StyledTable header and the footer (K-14)', () => {
    afterEach(cleanup)

    it("K-14: Shift+Tab from the footer's row count goes back into the table at the active row, and Shift+Tab from there to the header row", async () => {
        // The footer shows its row count once the table has enough rows.
        const manyRows: Row[] = Array.from({ length: 30 }, (_, index) => ({
            id: `r-${String(index + 1)}`,
            name: `Name ${String(index + 1)}`,
            role: 'User',
        }))

        // A button in each row, so the browser's own previous stop from the footer would be the last row's button.
        mountBetweenButtons({
            hideFooter: false,
            data: manyRows,
            pageSize: 10,
            columns: [
                {
                    accessorKey: 'name',
                    header: 'Name',
                    cell: ({ row: tableRow }) => <button type='button'>{`Open ${tableRow.id}`}</button>,
                },
                { accessorKey: 'role', header: 'Role' },
            ],
        })
        row('r-2').focus()

        const rows = document.querySelector<HTMLElement>('[data-test="table-rows-count-button"]')

        await expect(rows).not.toBeNull()
        rows!.focus()
        await expect(await tab(true)).toBe('row r-2')
        await expect(await tab(true)).toBe('header row')
    })
})

describe('StyledTable header reach in a wide, column-virtualised table (K-10)', () => {
    afterEach(cleanup)

    const WIDE = 30
    const WIDTH = 640
    const wideColumns: ColumnDef<Row>[] = Array.from({ length: WIDE }, (_, index) => ({
        id: `c${String(index + 1)}`,
        accessorFn: (item: Row) => item.name,
        header: `C${String(index + 1)}`,
        size: 150,
        minSize: 150,
    }))
    const wide = (): HTMLElement => document.querySelector<HTMLElement>('[data-test="wide"]')!
    const renderedHeaders = (): string[] =>
        [...document.querySelectorAll<HTMLElement>('thead [role="button"]')].map((control) => control.textContent ?? '')
    /** The pace of a person: the scroll that the focus caused re-renders the window before the next press. */
    const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 150))

    it('K-10: the arrow keys reach a centre header that starts off-screen, in order; it scrolls into view and keeps its focus', async () => {
        mount(
            <div data-test='wide' style={{ width: WIDTH }}>
                <button type='button'>Before</button>
                <StyledTable<Row> locale='en' columns={wideColumns} data={data} hideFooter />
                <button type='button'>After</button>
            </div>,
        )

        // Only a window of the 30 columns is in the DOM: the last one is not rendered yet.
        await expect(renderedHeaders().length).toBeLessThan(WIDE)
        await expect(renderedHeaders()).not.toContain(`C${String(WIDE)}`)

        button('Before').focus()
        await expect(await tab()).toBe('header row')

        const seen: string[] = []
        let firstOffScreen: string | undefined
        // The right edge of what the user can see: the window, less the pinned column of the pin (sticky right).
        const clearRight = (): number => pin().closest('th')!.getBoundingClientRect().left

        for (let presses = 0; presses < 14; presses += 1) {
            const next = `C${String(presses + 1)}`
            const target = sortControl(next)

            // The first header that is not wholly in the clear part of the 640px window: past it, or under the pin.
            if (!firstOffScreen && target && target.getBoundingClientRect().right > clearRight() + 1) {
                firstOffScreen = next
            }

            seen.push(await arrow('Right'))
            await settle()

            const view = wide().getBoundingClientRect()
            const box = (document.activeElement as HTMLElement).getBoundingClientRect()

            // Focused, still in the DOM, and in the window (a scroll brought it in): never left behind off-screen.
            await expect(document.activeElement?.isConnected).toBe(true)
            await expect(box.left < view.right && box.right > view.left, `${next} is in view`).toBe(true)

            if (next === firstOffScreen) {
                // The one that started off-screen is now wholly in view, clear of the pinned column (AC 11).
                await expect(box.left).toBeGreaterThanOrEqual(view.left)
                await expect(box.right).toBeLessThanOrEqual(clearRight() + 1)
            }
        }

        // Every stop was the next header in order: none skipped, none left out, though most were not in the DOM at first.
        await expect(seen).toEqual(Array.from({ length: 14 }, (_, index) => `header C${String(index + 1)}`))
        await expect(firstOffScreen, 'a header started off-screen').toBeDefined()
    })

})

describe('StyledTable header with column resizing on (K-22)', () => {
    afterEach(cleanup)

    const threeColumns: ColumnDef<Row>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'role', header: 'Role' },
        { id: 'extra', header: 'Extra', enableSorting: false },
    ]
    const resizeHandles = (): HTMLElement[] =>
        [...document.querySelectorAll<HTMLElement>('thead [class*="resizer"]')]

    // Resizing is on by default (ASMA-8597, UX round 4), and an explicit `enableColumnResizing` turns on width saving too.
    it.each([
        ['by default', {}],
        ['with enableColumnResizing', { enableColumnResizing: true }],
    ] as const)('K-22: a resize handle is not a tab stop or a header control, %s: the keys walk the headers and the pin, never a handle', async (_label, props) => {
        mountBetweenButtons({ columns: threeColumns, ...props })
        button('Before').focus()

        // The table has handles (Name and Role; the last data column fills the width), and none of them can take the focus.
        await expect(resizeHandles()).toHaveLength(2)
        for (const handle of resizeHandles()) {
            await expect(handle.tabIndex).toBe(-1)
            await expect(handle.hasAttribute('tabindex')).toBe(false)
        }

        await expect(await tab()).toBe('header row')
        await expect(await arrow('Right')).toBe('header Name')
        await expect(await arrow('Right')).toBe('header Role')
        await expect(await arrow('Right')).toBe('pin')
        await expect(await tab()).toBe('row r-1')
        await expect(await tab(true)).toBe('header row')
        await expect(await arrow('End')).toBe('pin')
        await expect(await arrow('Left')).toBe('header Role')
        await expect(await arrow('Left')).toBe('header Name')
        await expect(await arrow('Left')).toBe('header row')
        await expect(await tab(true)).toBe('Before')
    })

    it('K-22: a Tab that reaches a resize handle is not taken: the header row leaves it to the browser', async () => {
        mountBetweenButtons({ columns: threeColumns })

        const handle = resizeHandles()[0]!
        const tabPress = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })

        handle.dispatchEvent(tabPress)

        await expect(tabPress.defaultPrevented).toBe(false)
    })
})
