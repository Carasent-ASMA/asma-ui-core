import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { ariaSorts } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Keyboard reach of the table header (ASMA-8702, option A of the plan, EXE-01; keeps ASMA-8087's body model).
 *
 * The header row is not a tab stop. Tab walks the sortable headers and the column settings pin in visual order. Tab on
 * the LAST header control goes to the body's active row (the row the user left), and Shift+Tab from the body goes to
 * the last header control. The body stays one roving tab stop (arrows, Enter, Tab leaves forwards), which
 * `TableRow.keyboard.interaction.test.tsx` covers (K-11). Every key here is a real press from `userEvent.keyboard`.
 * `.focus()` is used only to start a test on `Before`, `After`, the footer's row count or a body row, places a key
 * reaches; no test puts the focus on a header or the pin that way.
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

const row = (id: string): HTMLElement => document.getElementById(id)!
const button = (name: string): HTMLButtonElement =>
    [...document.querySelectorAll('button')].find((candidate) => candidate.textContent === name)!
const sortControl = (label: string): HTMLElement =>
    [...document.querySelectorAll<HTMLElement>('thead [role="button"]')].find((control) => control.textContent === label)!
const pin = (): HTMLElement => document.querySelector<HTMLElement>('thead button[aria-haspopup="true"]')!
const headerRow = (): HTMLTableRowElement => document.querySelector<HTMLTableRowElement>('thead tr')!

/** Where the focus is, as a name: a sort header by label, the pin, a body row by id, or a button by its text. */
const focusName = (): string => {
    const active = document.activeElement as HTMLElement | null

    if (!active) return 'nothing'
    if (active.closest('thead')) {
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

describe('StyledTable header keyboard reach (K-01 to K-05)', () => {
    afterEach(cleanup)

    it('K-01: Tab from the element before the table reaches the first header control; the header row is not a tab stop', async () => {
        mountBetweenButtons()
        button('Before').focus()

        await expect(headerRow().tabIndex).toBe(-1)
        await expect(await tab()).toBe('header Name')
    })

    it('K-01: a fixed-left header comes first, wherever it sits in the column list', async () => {
        mountBetweenButtons({
            columns: [
                { accessorKey: 'role', header: 'Role' },
                { accessorKey: 'name', header: 'Name', fixedLeft: true },
            ],
        })
        button('Before').focus()

        await expect(await tab()).toBe('header Name')
        await expect(await tab()).toBe('header Role')
    })

    it('K-02: Tab walks every sortable header in visual order, then the pin, and never enters the body early', async () => {
        mountBetweenButtons()
        button('Before').focus()

        const stops = [await tab(), await tab(), await tab()]

        await expect(stops).toEqual(['header Name', 'header Role', 'pin'])
        await expect(document.activeElement).toBe(pin())
        await expect(document.activeElement?.closest('tbody')).toBeNull()
    })

    it('K-03: Tab from the last header control enters the body at the row the user left, not at row 1', async () => {
        mountBetweenButtons()

        // Nothing worked with yet: the first row holds the tab stop.
        button('Before').focus()
        await tab()
        await tab()
        await expect(await tab()).toBe('pin')
        await expect(await tab()).toBe('row r-1')

        // The user moves to row 3, goes back to the header, and Tab returns to row 3.
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')
        await expect(focusName()).toBe('row r-3')
        await expect(await tab(true)).toBe('pin')
        await expect(await tab()).toBe('row r-3')
    })

    it('K-03: with a tabbable control in every row, Tab from the pin still enters at the row the user left, not at a control in an earlier row', async () => {
        // A button in each row's first cell: those come after the header in the DOM, and the one in row 1 before row 3.
        mountBetweenButtons({
            columns: [
                {
                    accessorKey: 'name',
                    header: 'Name',
                    cell: ({ row: tableRow }) => <button type='button'>{`Open ${tableRow.id}`}</button>,
                },
                { accessorKey: 'role', header: 'Role' },
            ],
        })
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')
        await expect(focusName()).toBe('row r-3')

        // Back to the header, through the pin and the sortable headers.
        await expect(await tab(true)).toBe('pin')
        await expect(await tab(true)).toBe('header Role')
        await expect(await tab(true)).toBe('header Name')

        // And forwards again: the same stops, then the row the user left. The browser's own next stop after the pin
        // would be row 1's button.
        await expect(await tab()).toBe('header Role')
        await expect(await tab()).toBe('pin')
        await expect(await tab()).toBe('row r-3')
    })

    it('K-04: Shift+Tab from the active body row goes to the last header control, not to the first or out of the table', async () => {
        mountBetweenButtons()
        row('r-2').focus()

        await expect(await tab(true)).toBe('pin')
        await expect(await tab(true)).toBe('header Role')
        await expect(await tab(true)).toBe('header Name')
    })

    it('K-04: without the pin, the last header control is the last sortable header', async () => {
        mountBetweenButtons({ headerPin: false })
        row('r-2').focus()

        await expect(await tab(true)).toBe('header Role')
        // Back down, onto the row the user left.
        await expect(await tab()).toBe('row r-2')
    })

    it('K-05: Shift+Tab from the first header control leaves the table backwards: no trap', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await expect(await tab()).toBe('header Name')

        await expect(await tab(true)).toBe('Before')
        await expect(document.activeElement?.closest('table')).toBeNull()
    })
})

describe('StyledTable header controls work from the keyboard (K-06, K-13)', () => {
    afterEach(cleanup)

    it('K-06: Enter and Space on a header reached by Tab sort it, and aria-sort follows', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await tab()

        await userEvent.keyboard('{Enter}')
        await expect(ariaSorts()['Name']).toBe('ascending')
        await userEvent.keyboard('{ }')
        await expect(ariaSorts()['Name']).toBe('descending')
        // The focus stays on the header it sorted.
        await expect(focusName()).toBe('header Name')
    })

    it('K-13: a Tab on the last header control that something already handled (defaultPrevented) is left alone', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await tab()
        await tab()
        await expect(await tab()).toBe('pin')

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

    it('Tab on a header control that is not the last one is left to the browser: the next header control, not the rows', async () => {
        mountBetweenButtons()
        button('Before').focus()
        await expect(await tab()).toBe('header Name')

        await expect(await tab()).toBe('header Role')
        await expect(document.activeElement?.closest('tbody')).toBeNull()
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

    it("K-09: a consumer's own control in a hidden header is not where Shift+Tab from the body sends the focus", async () => {
        mountBetweenButtons({
            hideHeader: true,
            columns: [{ accessorKey: 'name', header: () => <button type='button'>Menu</button>, enableSorting: false }],
            headerPin: false,
        })
        row('r-2').focus()

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

        await expect(await tab()).toBe('pin')
        await expect(await tab()).toBe('row r-1')
        await expect(await tab(true)).toBe('pin')
        await expect(await tab(true)).toBe('Before')
    })

    it('K-16: with no rows, Tab on the last header control is not trapped: it leaves the table', async () => {
        mountBetweenButtons({ data: [] })
        button('Before').focus()

        await expect(await tab()).toBe('header Name')
        await expect(await tab()).toBe('header Role')
        await expect(await tab()).toBe('pin')

        // No active row to enter, so the Tab is left to the browser, and the focus moves on.
        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).not.toBe(pin())
        await expect(document.activeElement?.closest('thead')).toBeNull()
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
        await expect(await tab()).toBe('header Name')
        await expect(await tab()).toBe('header Extra')
        await expect(await tab()).toBe('header Role')
        await expect(await tab()).toBe('pin')
        await expect(await tab()).toBe('row r-1')

        cleanup()
        mountBetweenButtons({ columns: fixedRightColumns, headerPin: false })
        row('r-2').focus()

        await expect(await tab(true)).toBe('header Role')
        await expect(await tab()).toBe('row r-2')
    })

    it('K-18: the injected select-all checkbox is the first header control, and a Tab from the pin still skips the checkboxes in the rows', async () => {
        mountBetweenButtons({ enableRowSelection: true, initialState: { columnVisibility: { select: true } } })
        button('Before').focus()

        await expect(await tab()).toBe('select all')
        await expect(await tab()).toBe('header Name')
        await expect(await tab()).toBe('header Role')
        await expect(await tab()).toBe('pin')
        // Each row has a checkbox of its own, after the header and before the later rows; Tab lands on the active row.
        await expect(await tab()).toBe('row r-1')

        // Back to the select-all checkbox, and Space selects every row.
        await expect(await tab(true)).toBe('pin')
        await expect(await tab(true)).toBe('header Role')
        await expect(await tab(true)).toBe('header Name')
        await expect(await tab(true)).toBe('select all')
        await userEvent.keyboard('{ }')
        await expect(document.activeElement?.getAttribute('aria-checked')).toBe('true')
    })

    it('K-19: a header control that Tab would skip (tabindex -1, hidden, display: none, visibility: hidden) is not a header control, and is never where the focus is sent', async () => {
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

        // Forwards: the browser skips them, and the last header control is Role.
        button('Before').focus()
        await expect(await tab()).toBe('header Name')
        await expect(await tab()).toBe('header Role')
        await expect(await tab()).toBe('row r-1')

        // Backwards from the body: Role, not one of the three that Tab cannot stop on.
        await expect(await tab(true)).toBe('header Role')
    })
})

describe('StyledTable body model, as ASMA-8087 built it: what the controls inside the rows do (K-20, K-21)', () => {
    afterEach(cleanup)

    // The same on master `7fe83452` (checked there with a probe), apart from the header row now being the pin and the
    // sortable headers: Shift+Tab from after a table whose rows hold controls lands on the LAST row's control, because
    // the rows' own controls are tab stops that come after the active row in the DOM. It is not the active row.
    const rowControlColumns: ColumnDef<Row>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row: tableRow }) => <button type='button'>{`Open ${tableRow.id}`}</button>,
        },
        { accessorKey: 'role', header: 'Role' },
    ]

    it('K-20: Shift+Tab from after a table with a control in every row walks back through the rows\' controls to the active row, then the last header control, and out: no trap', async () => {
        mountBetweenButtons({ columns: rowControlColumns })
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}')
        await expect(focusName()).toBe('row r-2')
        button('After').focus()

        const stops: string[] = []

        for (let presses = 0; presses < 12 && stops.at(-1) !== 'Before'; presses += 1) {
            stops.push(await tab(true))
        }

        // Last row's control first (not the active row), back to the active row, then the header, then out.
        await expect(stops).toEqual(['cell Open r-3', 'cell Open r-2', 'row r-2', 'pin', 'header Role', 'header Name', 'Before'])
    })

    it('K-21: a focused control inside a row does not move the roving tab stop, and Shift+Tab on it goes to the previous control, not the header', async () => {
        mountBetweenButtons({ columns: rowControlColumns })
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}')
        button('After').focus()

        await expect(await tab(true)).toBe('cell Open r-3')
        // The row the user worked with still holds the tab stop; the row of the focused control does not.
        await expect(row('r-2').tabIndex).toBe(0)
        await expect(row('r-3').tabIndex).toBe(-1)
        // Row handlers act only on the row itself, so Shift+Tab here is the browser's: the previous control.
        await expect(await tab(true)).toBe('cell Open r-2')
    })
})

describe('StyledTable header and the footer (K-14)', () => {
    afterEach(cleanup)

    it("K-14: Shift+Tab from the footer's row count goes back into the table at the active row, and Shift+Tab from there to the header", async () => {
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
        await expect(await tab(true)).toBe('pin')
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

    it('K-10: Tab reaches a centre header that starts off-screen, in order; it scrolls into view and keeps its focus', async () => {
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

        const seen: string[] = []
        let firstOffScreen: string | undefined

        for (let presses = 0; presses < 14; presses += 1) {
            const next = `C${String(presses + 1)}`
            const target = sortControl(next)

            // The first header that starts to the right of the 640px window.
            if (!firstOffScreen && target && target.getBoundingClientRect().left >= wide().getBoundingClientRect().right) {
                firstOffScreen = next
            }

            seen.push(await tab())
            await settle()

            const view = wide().getBoundingClientRect()
            const box = (document.activeElement as HTMLElement).getBoundingClientRect()

            // Focused, still in the DOM, and in the window (a scroll brought it in): never left behind off-screen.
            await expect(document.activeElement?.isConnected).toBe(true)
            await expect(box.left < view.right && box.right > view.left, `${next} is in view`).toBe(true)

            if (next === firstOffScreen) {
                // The one that started off-screen is now wholly in view.
                await expect(box.left).toBeGreaterThanOrEqual(view.left)
                await expect(box.right).toBeLessThanOrEqual(view.right)
            }
        }

        // Every stop was the next header in order: none skipped, none left out, though most were not in the DOM at first.
        await expect(seen).toEqual(Array.from({ length: 14 }, (_, index) => `header C${String(index + 1)}`))
        await expect(firstOffScreen, 'a header started off-screen').toBeDefined()
    })

    it('K-10: Shift+Tab from the pin walks back to the earlier centre headers, in order', async () => {
        mount(
            <div data-test='wide' style={{ width: WIDTH }}>
                <button type='button'>Before</button>
                <StyledTable<Row> locale='en' columns={wideColumns} data={data} hideFooter />
            </div>,
        )
        row('r-1').focus()

        // Body to the pin first, then back through the headers, with the scroll catching up each time.
        await expect(await tab(true)).toBe('pin')
        await settle()

        const back: string[] = []

        for (let presses = 0; presses < 3; presses += 1) {
            back.push(await tab(true))
            await settle()
        }

        // The last centre headers sit before the pin in the DOM only once the window has scrolled to them, so the
        // focus ends on a centre header that is rendered and in view; none of the stops is the body or the page.
        await expect(back.every((name) => name.startsWith('header C'))).toBe(true)
        await expect(document.activeElement?.isConnected).toBe(true)
    })
})
