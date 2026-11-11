import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeAll, beforeEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { headerCell, people, sortButton, type Person } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * A header label cut short by its column is shown in full in a tooltip (ASMA-8597; Ana Rozimova, Jira comment 95216; the
 * owner, 2026-11-11). Asserted in a real browser, on a real table: "truncated" is what the layout says, and the tooltip
 * is the one a user sees.
 *
 * The rules under test:
 * - the tooltip shows on hover and on keyboard focus (of a focusable sortable header), and only for a label that is cut
 *   short; a label that fits has none;
 * - it follows the layout: a resize that makes the label truncated gives the header a tooltip, one that makes it fit
 *   takes it away. The 20px sort slot that opens on hover and focus (UX, OQ-07) takes room from the label, so a label with
 *   less than 20px to spare gets its tooltip for that very hover;
 * - it is visual only: the header's accessible name already holds the text, so the sort button gets no `aria-describedby`
 *   and keeps its name; Escape closes it, and the pointer can move onto it (WCAG 1.4.13);
 * - a function header uses `pinnedHeaderText` (the text the column settings list it by), and with none known has no tooltip.
 */

type TableProps = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const LABEL = 'Quarterly revenue forecast owner'
/** The tooltip opens after the table tooltip's enter delay (500ms) on hover; focus opens it at once. */
const OPEN_DELAY = 500

const columnsOf = (size: number): ColumnDef<Person>[] => [
    { accessorKey: 'name', header: LABEL, size },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120 },
]

const table = (props: TableProps = {}): JSX.Element => (
    <StyledTable<Person>
        columns={columnsOf(400)}
        data={people}
        hideFooter
        locale='en'
        columnResizeMode='onChange'
        {...props}
    />
)

const settle = (milliseconds = 30): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds))
const tooltip = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="tooltip"]')
const waitForTooltip = (): Promise<void> => waitFor(() => expect(tooltip()).not.toBeNull(), { timeout: 3000 })
/** A tooltip that was going to open has opened by now: wait past its delay, then look. */
const expectNoTooltip = async (): Promise<void> => {
    await settle(OPEN_DELAY + 300)
    await expect(tooltip()).toBeNull()
}

/** Mounts a table and gives each header the frames it needs to measure itself: the tooltip is armed by then. */
const mountTable = async (props: TableProps = {}): Promise<ReturnType<typeof mount>> => {
    const view = mount(table(props))

    await settle(200)

    return view
}

const labelOf = (cell: Element): HTMLElement => cell.querySelector<HTMLElement>('[class*="header-content"]')!
const rowOf = (cell: Element): HTMLElement => cell.firstElementChild as HTMLElement
const handle = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[class*="resizer"]')!

/**
 * The width a column needs for its label to have `room` px left beside it, measured on a wide column of the same table:
 * a `th` and the room in it grow together. `room` is the label's right edge to the right edge of the row's content,
 * so a negative room is a label cut short at rest and a room under 20 a label cut short once the sort slot opens.
 */
const geometry = { thWidth: 0, roomWide: 0 }

const measureGeometry = async (): Promise<void> => {
    mount(table({ columns: columnsOf(700) }))
    await settle(100)

    const cell = headerCell(LABEL)
    const row = rowOf(cell)
    const style = getComputedStyle(row)
    const contentRight = row.getBoundingClientRect().right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth)

    geometry.thWidth = cell.getBoundingClientRect().width
    geometry.roomWide = contentRight - labelOf(cell).getBoundingClientRect().right
    cleanup()
}

/** The `size` to declare. A sortable column opens 20px wider than it declares (D16), which this accounts for. */
const sizeWithRoom = (room: number): number => Math.round(geometry.thWidth - geometry.roomWide + room) - 20

const widthOf = (label: string): number => headerCell(label).getBoundingClientRect().width

const mouse = (type: string, target: EventTarget, clientX: number): void => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, view: window }))
}

/** Drags a column's handle by `delta` px in three moves, then ends the drag the way a real one ends. */
const drag = async (label: string, delta: number): Promise<void> => {
    const grip = handle(label)
    const start = Math.round(grip.getBoundingClientRect().left)

    mouse('mousedown', grip, start)
    for (let step = 1; step <= 3; step += 1) {
        mouse('mousemove', document, start + Math.round((delta * step) / 3))
        // React flushes updates from a native document listener asynchronously.
        await settle()
    }
    mouse('mouseup', document, start + delta)
    await settle()
    // A real drag ends with a click on the handle; without it the next header click would be swallowed.
    mouse('click', grip, start + delta)
    await settle(150)
}

/** The real pointer survives from test to test, so park it away from the table before each one. */
const parkPointer = async (): Promise<void> => {
    const parking = document.createElement('button')

    parking.type = 'button'
    parking.setAttribute('aria-label', 'parking')
    parking.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;opacity:0.01'
    document.body.appendChild(parking)
    await userEvent.hover(parking)
    parking.remove()
}

/** Whether the label shows an ellipsis right now: what the user sees, read from the layout. */
const isCutShort = (label: string): boolean => {
    const element = labelOf(headerCell(label))

    return element.scrollWidth > element.clientWidth
}

beforeAll(measureGeometry)
beforeEach(parkPointer)
afterEach(cleanup)

describe('The tooltip shows a truncated label in full', () => {
    it('a label cut short at rest: the full text on hover, after the delay', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })
        await expect(isCutShort(LABEL)).toBe(true)
        await expect(tooltip()).toBeNull()

        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()

        await expect(tooltip()!.textContent).toBe(LABEL)
    })

    it('a label that fits has no tooltip, however long the pointer stays', async () => {
        await mountTable()
        await expect(isCutShort(LABEL)).toBe(false)

        await userEvent.hover(sortButton(LABEL))

        await expectNoTooltip()
    })

    it('a sorted column shows it too, and the column keeps its sort', async () => {
        await mountTable({
            columns: columnsOf(sizeWithRoom(-40)),
            initialState: { sorting: [{ id: 'name', desc: false }] },
        })

        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()

        await expect(tooltip()!.textContent).toBe(LABEL)
        await expect(headerCell(LABEL).getAttribute('aria-sort')).toBe('ascending')
    })

    it('a header that cannot sort shows it on hover', async () => {
        await mountTable({
            columns: [
                { id: 'plain', header: LABEL, size: sizeWithRoom(-40), enableSorting: false },
                { accessorKey: 'role', header: 'Role', size: 160 },
            ],
        })
        await expect(headerCell(LABEL).querySelector('[role="button"]')).toBeNull()
        await expect(isCutShort(LABEL)).toBe(true)

        await userEvent.hover(labelOf(headerCell(LABEL)))
        await waitForTooltip()

        await expect(tooltip()!.textContent).toBe(LABEL)
    })
})

describe('The sort slot takes room from the label', () => {
    it('a label with less than 20px to spare is cut short once the slot opens: its tooltip is ready for that hover', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(8)) })
        // At rest it fits, so there is no ellipsis yet ...
        await expect(isCutShort(LABEL)).toBe(false)

        await userEvent.hover(sortButton(LABEL))
        // ... the slot opens and the label is cut short, and the tooltip comes with it.
        await expect(isCutShort(LABEL)).toBe(true)
        await waitForTooltip()

        await expect(tooltip()!.textContent).toBe(LABEL)
    })

    it('a label with room for the slot still fits on hover, and has no tooltip', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(32)) })

        await userEvent.hover(sortButton(LABEL))
        await expect(isCutShort(LABEL)).toBe(false)

        await expectNoTooltip()
    })
})

describe('The tooltip follows a resize', () => {
    it('a resize that makes the label truncated gives the header a tooltip', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(60)) })
        await userEvent.hover(sortButton(LABEL))
        await expectNoTooltip()
        await parkPointer()

        await drag(LABEL, -110)
        await expect(isCutShort(LABEL)).toBe(true)

        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()

        await expect(tooltip()!.textContent).toBe(LABEL)
    })

    it('a resize that makes the label fit takes the tooltip away', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })
        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()
        await parkPointer()
        await waitFor(() => expect(tooltip()).toBeNull())

        await drag(LABEL, 140)
        await expect(isCutShort(LABEL)).toBe(false)

        await userEvent.hover(sortButton(LABEL))

        await expectNoTooltip()
    })

    it('a resize that leaves less than 20px beside the label arms the tooltip for the next hover, though the label itself has not changed', async () => {
        // Room 40: the label fits, with or without the slot. Narrowing the column to a room of 10 changes only the room.
        await mountTable({ columns: columnsOf(sizeWithRoom(40)) })
        await userEvent.hover(sortButton(LABEL))
        await expectNoTooltip()
        await parkPointer()

        await drag(LABEL, -30)
        await expect(isCutShort(LABEL)).toBe(false)

        await userEvent.hover(sortButton(LABEL))
        await expect(isCutShort(LABEL)).toBe(true)
        await waitForTooltip()
    })

    it('a resize that gives the label its room back takes the armed tooltip away, though the label itself has not changed', async () => {
        // Room 8: the label fits at rest and is cut short once the slot opens. Widening to a room of 48 changes only the room.
        await mountTable({ columns: columnsOf(sizeWithRoom(8)) })
        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()
        await parkPointer()
        await waitFor(() => expect(tooltip()).toBeNull())

        await drag(LABEL, 40)

        await userEvent.hover(sortButton(LABEL))
        await expect(isCutShort(LABEL)).toBe(false)
        await expectNoTooltip()
    })

    it('a label that changes to one that is cut short gets a tooltip, and one that changes back to a fitting one loses it', async () => {
        // The column keeps its width; only the label changes, so only the label's own size tells the header.
        const size = sizeWithRoom(-40)
        const view = await mountTable({ columns: [{ accessorKey: 'name', header: 'Role', size }, ...columnsOf(size).slice(1)] })
        await userEvent.hover(sortButton('Role'))
        await expectNoTooltip()
        await parkPointer()

        view.rerender(table({ columns: columnsOf(size) }))
        await settle(200)
        await expect(isCutShort(LABEL)).toBe(true)
        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()
        await parkPointer()
        await waitFor(() => expect(tooltip()).toBeNull())

        view.rerender(table({ columns: [{ accessorKey: 'name', header: 'Role', size }, ...columnsOf(size).slice(1)] }))
        await settle(200)
        await userEvent.hover(sortButton('Role'))
        await expectNoTooltip()
    })

    it('the tooltip leaves the resize zone alone: none opens over it, and an open one closes when the pointer moves onto it', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })
        const button = sortButton(LABEL)
        // 12px from the control's right edge, halfway down: over the 24px zone.
        const overZone = { position: { x: button.getBoundingClientRect().width - 12, y: 15 } }

        await userEvent.hover(button, overZone)
        await expectNoTooltip()
        await parkPointer()

        await userEvent.hover(button)
        await waitForTooltip()
        await userEvent.hover(button, overZone)

        await waitFor(() => expect(tooltip()).toBeNull())
    })

    it('the tooltip stays out of the way of a drag, and the column keeps the width the drag gave it', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })
        const before = widthOf(LABEL)
        const grip = handle(LABEL)
        const start = Math.round(grip.getBoundingClientRect().left)

        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()

        mouse('mousedown', grip, start)
        mouse('mousemove', document, start + 20)
        await settle(80)
        await expect(tooltip()).toBeNull()

        mouse('mouseup', document, start + 20)
        await settle()
        mouse('click', grip, start + 20)
        await settle(150)
        await expect(widthOf(LABEL)).toBeGreaterThan(before)
    })
})

describe('Keyboard focus', () => {
    it('focusing a truncated sortable header with the keyboard shows the tooltip, with no delay', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })

        await userEvent.tab()
        await expect(document.activeElement).toBe(sortButton(LABEL))

        await waitFor(() => expect(tooltip()).not.toBeNull(), { timeout: 400 })
        await expect(tooltip()!.textContent).toBe(LABEL)
    })

    it('focusing a header whose label fits shows no tooltip', async () => {
        await mountTable()

        await userEvent.tab()
        await expect(document.activeElement).toBe(sortButton(LABEL))

        await expectNoTooltip()
    })

    it('a label that is cut short only once the slot opens gets its tooltip on keyboard focus too', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(8)) })

        await userEvent.tab()
        await expect(isCutShort(LABEL)).toBe(true)

        await waitFor(() => expect(tooltip()).not.toBeNull(), { timeout: 400 })
    })

    it('a click focuses the header without showing the tooltip that keyboard focus would: it is the hover that does', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })

        await userEvent.click(sortButton(LABEL))
        await userEvent.unhover(sortButton(LABEL))
        await parkPointer()

        await expectNoTooltip()
    })
})

describe('The tooltip is dismissible, hoverable and persistent (WCAG 1.4.13)', () => {
    it('Escape closes it', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })
        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(tooltip()).toBeNull())
    })

    it('Escape closes the one a keyboard user opened, and the header keeps its focus', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })
        await userEvent.tab()
        await waitForTooltip()

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(tooltip()).toBeNull())
        await expect(document.activeElement).toBe(sortButton(LABEL))
    })

    it('the pointer can move onto the tooltip without it closing, and it stays until the pointer is gone', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })
        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()

        await userEvent.hover(tooltip()!)
        await settle(400)
        await expect(tooltip()).not.toBeNull()

        await parkPointer()
        await waitFor(() => expect(tooltip()).toBeNull())
    })
})

describe('The tooltip is visual only', () => {
    it('the sort button keeps its name and gets no aria-describedby, and the column settings pin is as it was', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })

        const buttons = (): string[] =>
            [...document.querySelectorAll<HTMLElement>('thead [role="button"], thead button')].map(
                (button) => `${button.tagName} ${button.getAttribute('aria-label') ?? button.textContent?.trim() ?? ''}`,
            )
        const before = buttons()
        await expect(sortButton(LABEL).hasAttribute('aria-describedby')).toBe(false)

        await userEvent.hover(sortButton(LABEL))
        await waitForTooltip()

        // Open: the tooltip names nothing and describes nothing.
        await expect(sortButton(LABEL).hasAttribute('aria-describedby')).toBe(false)
        await expect(document.querySelectorAll('thead [aria-describedby]')).toHaveLength(0)
        await expect(buttons()).toEqual(before)
        await expect(sortButton(LABEL)).toHaveAccessibleName(LABEL)

        // Closed again: the header is exactly as it was.
        await parkPointer()
        await waitFor(() => expect(tooltip()).toBeNull())
        await expect(sortButton(LABEL).hasAttribute('aria-describedby')).toBe(false)
        await expect(buttons()).toEqual(before)
    })

    it('a header with a tooltip still sorts on click, and on Enter and Space', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)) })

        await userEvent.click(sortButton(LABEL))
        await expect(headerCell(LABEL).getAttribute('aria-sort')).toBe('ascending')

        await userEvent.keyboard('{Enter}')
        await expect(headerCell(LABEL).getAttribute('aria-sort')).toBe('descending')

        await userEvent.keyboard(' ')
        await expect(headerCell(LABEL).getAttribute('aria-sort')).toBe('none')
    })
})

describe('Which text the tooltip shows', () => {
    const LONG_NODE = 'A function header whose label is a long element'

    const functionColumns = (pinnedHeaderText?: string): ColumnDef<Person>[] => [
        {
            accessorKey: 'name',
            header: () => <span>{LONG_NODE}</span>,
            id: 'fn',
            size: 140,
            ...(pinnedHeaderText === undefined ? {} : { pinnedHeaderText }),
        },
        { accessorKey: 'role', header: 'Role', size: 160 },
    ]

    it('a function header shows its pinnedHeaderText, the text the column settings list it by', async () => {
        await mountTable({ columns: functionColumns('Function header, full text') })
        const cell = document.querySelector<HTMLElement>('thead th')!
        // The span is inline, so it is the label's box that is clipped.
        await expect(labelOf(cell).scrollWidth).toBeGreaterThan(labelOf(cell).clientWidth)

        await userEvent.hover(rowOf(cell))
        await waitForTooltip()

        await expect(tooltip()!.textContent).toBe('Function header, full text')
    })

    it('a function header whose label is a block element, clamped by the stylesheet, shows its pinnedHeaderText when cut short', async () => {
        await mountTable({
            columns: [
                {
                    accessorKey: 'name',
                    header: () => <div data-testid='block-label'>{LONG_NODE}</div>,
                    id: 'block',
                    size: 140,
                    pinnedHeaderText: 'Block header, full text',
                },
                { accessorKey: 'role', header: 'Role', size: 160 },
            ],
        })
        const cell = document.querySelector<HTMLElement>('thead th')!
        const block = cell.querySelector<HTMLElement>('[data-testid="block-label"]')!
        // The block is clamped to the label and ellipsizes itself, so it is the block that is cut short, not the label's box.
        await expect(block.scrollWidth).toBeGreaterThan(block.clientWidth)
        await expect(labelOf(cell).scrollWidth).toBe(labelOf(cell).clientWidth)

        await userEvent.hover(rowOf(cell))
        await waitForTooltip()

        await expect(tooltip()!.textContent).toBe('Block header, full text')
    })

    it('a function header with no text known has no tooltip, although its label is cut short', async () => {
        await mountTable({ columns: functionColumns() })
        const cell = document.querySelector<HTMLElement>('thead th')!
        await expect(labelOf(cell).scrollWidth).toBeGreaterThan(labelOf(cell).clientWidth)

        await userEvent.hover(rowOf(cell))

        await expectNoTooltip()
    })

    it('a hidden header has no tooltip', async () => {
        await mountTable({ columns: columnsOf(sizeWithRoom(-40)), hideHeader: true })
        const row = rowOf(headerCell(LABEL))

        // It cannot be hovered, so the events a pointer would send are sent.
        row.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, view: window }))
        row.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, view: window }))

        await expectNoTooltip()
    })
})
