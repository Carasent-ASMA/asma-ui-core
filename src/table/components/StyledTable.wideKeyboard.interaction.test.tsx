import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { button, row, rowActionsTrigger } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-8875, round 2: in a wide table the centre columns are virtualised (above 20, `useColumnVirtualizer`), and only a
 * window of them is in the DOM. Left/Right in a row or the header still go to the next control in visual order: when it
 * sits in a column not rendered yet, the table scrolls that column in first, waits for it, and focuses the control,
 * clear of the fixed columns. Every key is a real press; the reveal is asynchronous, so the tests wait for the focus.
 */

interface Row {
    id: string
    name: string
}

const WIDE = 30
/** The centre columns that hold a button in every row; the others are text. */
const WITH_CONTROL = new Set([1, 12, 25, 30])

const data: Row[] = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
]
const columnsWith = (withControl: Set<number>): ColumnDef<Row>[] =>
    Array.from({ length: WIDE }, (_, index) => {
        const column = index + 1

        return {
        id: `c${String(column)}`,
        accessorFn: (item: Row) => item.name,
        header: `C${String(column)}`,
        size: 150,
        minSize: 150,
        cell: ({ row }) =>
            withControl.has(column) ? <button type='button'>{`Act c${String(column)} ${row.id}`}</button> : row.original.name,
        }
    })

const mountWide = ({ withControl = WITH_CONTROL, withActions = true } = {}): void => {
    mount(
        <div style={{ width: 640 }}>
            <button type='button'>Before</button>
            <StyledTable<Row>
                locale='en'
                columns={columnsWith(withControl)}
                data={data}
                hideFooter
                headerPin={withActions}
                actions={withActions ? () => [{ label: 'Edit', onClick: () => undefined }] : undefined}
            />
        </div>,
    )
}

const scroller = (): HTMLElement => {
    for (let node = document.querySelector('table')!.parentElement; node; node = node.parentElement) {
        const { overflowX } = getComputedStyle(node)
        if ((overflowX === 'auto' || overflowX === 'scroll') && node.scrollWidth > node.clientWidth) return node
    }
    throw new Error('the table did not scroll sideways')
}

/** Where the focus is: a body button by its text, the ⋮, a row, or a header by its label. */
const focusName = (): string => {
    const active = document.activeElement as HTMLElement | null

    if (!active || active === document.body) return 'nothing'
    if (active.tagName === 'TR') return active.closest('thead') ? 'header row' : `row ${active.id}`
    if (active.hasAttribute('data-row-actions-trigger')) return '⋮'
    if (active.closest('thead')) return active.getAttribute('role') === 'button' ? `header ${active.textContent}` : 'pin'

    return active.textContent ?? active.tagName
}

/** Wholly in the scroll box and, unless it is in it, clear of the fixed-right column (the ⋮, or the pin in the header). */
const isClearInView = (element: HTMLElement): boolean => {
    const box = scroller().getBoundingClientRect()
    const fixedRightCell = element.closest('tr')!.querySelector<HTMLElement>('[data-column-side="right"]')
    const rect = element.getBoundingClientRect()
    const right = !fixedRightCell || fixedRightCell.contains(element) ? box.right : fixedRightCell.getBoundingClientRect().left

    return rect.left >= box.left - 1 && rect.right <= right + 1
}

const press = async (key: string, expected: string): Promise<void> => {
    await userEvent.keyboard(key)
    await waitFor(() => expect(focusName()).toBe(expected), { timeout: 3000 })
}

describe('ASMA-8875 wide tables: Left/Right reach controls in columns not rendered yet', () => {
    afterEach(cleanup)

    it('Right from the last rendered centre control reaches a control in a column that was not rendered, and it is in view', async () => {
        mountWide()

        await expect(button('Act c12 r-1'), 'c12 starts outside the rendered window').toBeUndefined()

        row('r-1').focus()
        await press('{ArrowRight}', 'Act c1 r-1')
        await press('{ArrowRight}', 'Act c12 r-1')
        await expect(isClearInView(document.activeElement as HTMLElement)).toBe(true)
    })

    it('repeated Right walks every control in visual order and ends on the ⋮', async () => {
        mountWide()
        row('r-1').focus()

        for (const expected of ['Act c1 r-1', 'Act c12 r-1', 'Act c25 r-1', 'Act c30 r-1', '⋮']) {
            await press('{ArrowRight}', expected)
            await expect(isClearInView(document.activeElement as HTMLElement), `${expected} is in view`).toBe(true)
        }
        await press('{ArrowRight}', '⋮')
    })

    it("Left from the ⋮ reaches the last centre column's control", async () => {
        mountWide()
        await expect(button('Act c30 r-1')).toBeUndefined()

        // The start: the ⋮ (pinned right, always rendered), as a click would leave it.
        rowActionsTrigger('r-1').focus()
        await press('{ArrowLeft}', 'Act c30 r-1')
        await expect(isClearInView(document.activeElement as HTMLElement)).toBe(true)
        await press('{ArrowLeft}', 'Act c25 r-1')
    })

    it('with the window scrolled, Left from the first rendered centre control reveals the earlier ones', async () => {
        mountWide()
        scroller().scrollLeft = 150 * 9
        await waitFor(() => expect(button('Act c12 r-1')).toBeDefined())
        await expect(button('Act c1 r-1'), 'c1 is no longer rendered').toBeUndefined()

        button('Act c12 r-1').focus()
        await press('{ArrowLeft}', 'Act c1 r-1')
        await expect(isClearInView(document.activeElement as HTMLElement)).toBe(true)
        // From the first control, Left goes back to the row.
        await press('{ArrowLeft}', 'row r-1')
    })

    it('K-10: the header: Left from the pin reaches the last centre header, Right from the header row the first, Home and End too, all revealed', async () => {
        mountWide()
        document.querySelector<HTMLButtonElement>('button')!.focus()
        const rendered = (label: string): boolean =>
            [...document.querySelectorAll('thead [role="button"]')].some((header) => header.textContent === label)

        await press('{Tab}', 'header row')
        await press('{End}', 'pin')
        await press('{ArrowLeft}', 'header C30')
        await expect(isClearInView(document.activeElement as HTMLElement)).toBe(true)

        // Back on the header row with the window at the far right: Right starts before the first column, as in a body row.
        await press('{Tab}', 'row r-1')
        await press('{Shift>}{Tab}{/Shift}', 'header row')
        await expect(rendered('C1')).toBe(false)
        await press('{ArrowRight}', 'header C1')
        await press('{ArrowLeft}', 'header row')
        await press('{End}', 'pin')
        await press('{Home}', 'header C1')
        await press('{ArrowRight}', 'header C2')
    })

    it('Right from the last control, with only unrendered text columns after it, keeps the focus on that control', async () => {
        mountWide({ withControl: new Set([1, 3]), withActions: false })
        row('r-1').focus()
        await press('{ArrowRight}', 'Act c1 r-1')
        await press('{ArrowRight}', 'Act c3 r-1')

        // The table looks through the 27 columns after it, finds nothing, and comes back to it.
        await userEvent.keyboard('{ArrowRight}')
        await new Promise((resolve) => setTimeout(resolve, 600))
        await waitFor(() => expect(focusName()).toBe('Act c3 r-1'), { timeout: 3000 })
        await expect(isClearInView(document.activeElement as HTMLElement)).toBe(true)
    })

    it('a reveal still running stops when the focus moves on: no focus jumps back', async () => {
        mountWide()
        // The window at the far right, so Right from the row has to reveal column 1 first.
        scroller().scrollLeft = scroller().scrollWidth
        await waitFor(() => expect(button('Act c1 r-1')).toBeUndefined())
        row('r-1').focus()

        // The focus moves on in the same task as the key, after the table took it and before the column can render.
        const moveOn = (event: KeyboardEvent): void => {
            if (event.key === 'ArrowRight') row('r-2').focus()
        }

        document.addEventListener('keydown', moveOn)
        try {
            await userEvent.keyboard('{ArrowRight}')
        } finally {
            document.removeEventListener('keydown', moveOn)
        }
        await new Promise((resolve) => setTimeout(resolve, 600))
        await expect(focusName()).toBe('row r-2')
    })
})
