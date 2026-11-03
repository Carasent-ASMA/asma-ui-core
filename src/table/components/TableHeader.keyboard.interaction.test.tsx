import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
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
 * `TableRow.keyboard.interaction.test.tsx` covers (K-11). Every key here is a real press from `userEvent.keyboard`:
 * no `.focus()` puts the focus where a key cannot reach it.
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
    if (active.closest('tbody')) return `row ${active.id}`

    return active.textContent || active.tagName
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
        sortControl('Name').focus()

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
        sortControl('Name').focus()

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

    it('K-09: a hidden header (hideHeader) is skipped entirely, going forwards and back', async () => {
        mountBetweenButtons({ hideHeader: true })

        // Inert, so none of its controls is a stop; the sort header and the pin are still in the DOM.
        await expect(document.querySelector('thead')!.hasAttribute('inert')).toBe(true)
        await expect(document.querySelectorAll('thead [role="button"]').length).toBeGreaterThan(0)

        button('Before').focus()
        await expect(await tab()).toBe('row r-1')
        await expect(await tab(true)).toBe('Before')
        row('r-2').focus()
        await expect(await tab(true)).toBe('Before')
    })

    it('a visible header is not inert', async () => {
        mountBetweenButtons()

        await expect(document.querySelector('thead')!.hasAttribute('inert')).toBe(false)
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
