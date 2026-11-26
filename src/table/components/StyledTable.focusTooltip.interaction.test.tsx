import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { row, rowActionsTrigger } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * ASMA-8875, round 7. The disabled ⋮'s reason, and a select checkbox's tooltip (`getRowSelectionTooltip`), open on keyboard
 * focus and stay while their control has the focus (WCAG 1.4.13): Escape closes them, and so does moving the focus on.
 * The reason closed again at once: moving to the ⋮ scrolled the table sideways by a pixel (its fixed-right cell sticks at
 * `right: -1px`, so `scrollIntoView` saw it a pixel out of view), and the reason closes on a scroll. A control in a fixed
 * cell no longer scrolls the table sideways. Every key is a real press.
 */

interface Row {
    id: string
    title: string
    owner: string
}

const REASON = 'Closed reports cannot be changed'
const HINT = 'Tick to include it in the export'

const data: Row[] = Array.from({ length: 3 }, (_, index) => ({ id: `r-${String(index + 1)}`, title: `Report ${String(index + 1)}`, owner: 'Team 1' }))
const columns: ColumnDef<Row>[] = [
    { accessorKey: 'title', header: 'Title', size: 220 },
    { accessorKey: 'owner', header: 'Owner', size: 220 },
    { id: 'status', header: 'Status', size: 220, cell: () => 'Open' },
    { id: 'updated', header: 'Updated', size: 220, cell: () => '2026-11-01' },
]

type TableProps = Partial<Omit<StyledTableProps<Row, Record<string, unknown>>, 'footer'>>

/** Wider than its 700px box, like the RowMenus story: the table scrolls sideways. Row 2's actions are disabled. */
const mountTable = (props: TableProps = {}): void => {
    mount(
        <div style={{ width: 700 }}>
            <StyledTable<Row>
                locale='en'
                columns={columns}
                data={data}
                hideFooter
                enableRowSelection
                initialState={{ columnVisibility: { select: true } }}
                actions={() => [{ label: 'Open', onClick: () => undefined }]}
                rowActionsState={(candidate) => (candidate.id === 'r-2' ? { state: 'disabled', tooltipTitle: REASON } : undefined)}
                {...props}
            />
        </div>,
    )
}

/** The table's sideways scroll box. */
const scroller = (): HTMLElement => {
    for (let node = document.querySelector('table')!.parentElement; node; node = node.parentElement) {
        const { overflowX } = getComputedStyle(node)

        if ((overflowX === 'auto' || overflowX === 'scroll') && node.scrollWidth > node.clientWidth) return node
    }
    throw new Error('the table did not scroll sideways')
}

const tooltip = (): string | null => document.querySelector('[role="tooltip"]')?.textContent ?? null
const checkbox = (id: string): HTMLElement => row(id).querySelector<HTMLElement>('[role="checkbox"]')!
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** The tooltip shows `text` now, and still after two seconds of the focus resting on its control. */
const expectStays = async (text: string, control: HTMLElement): Promise<void> => {
    await waitFor(() => expect(tooltip()).toBe(text))
    await wait(2100)
    await expect(tooltip()).toBe(text)
    await expect(document.activeElement).toBe(control)
}

describe('ASMA-8875 R7-4: a control in a fixed cell does not scroll the table sideways', () => {
    afterEach(cleanup)

    it('Right to the select checkbox and to the ⋮, and back, leaves scrollLeft alone', async () => {
        mountTable()
        const box = scroller()

        row('r-1').focus({ preventScroll: true })
        for (const [keys, expected] of [
            ['{ArrowRight}', checkbox('r-1')],
            ['{ArrowRight}', rowActionsTrigger('r-1')],
            ['{ArrowLeft}', checkbox('r-1')],
        ] as const) {
            await userEvent.keyboard(keys)
            await expect(document.activeElement).toBe(expected)
            await expect(box.scrollLeft).toBe(0)
        }
    })

    it('with fixed-left columns and the table scrolled sideways, the fixed checkbox and the ⋮ leave scrollLeft alone', async () => {
        mountTable({ columns: columns.map((column, index) => (index === 0 ? { ...column, fixedLeft: true } : column)) })
        const box = scroller()

        box.scrollLeft = 60
        await waitFor(() => expect(box.scrollLeft).toBe(60))
        row('r-1').focus({ preventScroll: true })

        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(checkbox('r-1'))
        await expect(box.scrollLeft).toBe(60)
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(rowActionsTrigger('r-1'))
        await expect(box.scrollLeft).toBe(60)
    })
})

describe("ASMA-8875 R7-3: the disabled ⋮'s reason stays while the ⋮ has the focus", () => {
    afterEach(cleanup)

    it('Right Arrow to the ⋮ shows the reason, which stays; Escape closes it and the focus stays on the ⋮', async () => {
        mountTable()
        row('r-2').focus({ preventScroll: true })

        await userEvent.keyboard('{ArrowRight}{ArrowRight}')
        await expectStays(REASON, rowActionsTrigger('r-2'))

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(tooltip()).toBeNull())
        await expect(document.activeElement).toBe(rowActionsTrigger('r-2'))
    })

    it.each([['{Shift>}{F10}{/Shift}'], ['{ContextMenu}']])('%s on the row focuses the ⋮ and shows the reason, which stays', async (keys) => {
        mountTable()
        row('r-2').focus({ preventScroll: true })

        await userEvent.keyboard(keys)
        await expectStays(REASON, rowActionsTrigger('r-2'))
    })

    it.each([
        ['Left Arrow', '{ArrowLeft}'],
        ['Down Arrow', '{ArrowDown}'],
        ['Tab', '{Tab}'],
    ])('%s moves the focus on and closes the reason', async (_label, keys) => {
        mountTable()
        row('r-2').focus({ preventScroll: true })
        await userEvent.keyboard('{ArrowRight}{ArrowRight}')
        await waitFor(() => expect(tooltip()).toBe(REASON))

        await userEvent.keyboard(keys)
        await expect(document.activeElement).not.toBe(rowActionsTrigger('r-2'))
        await waitFor(() => expect(tooltip()).toBeNull())
    })
})

describe("ASMA-8875 R7-3: a select checkbox's tooltip opens on keyboard focus", () => {
    afterEach(cleanup)

    it('Right Arrow to the checkbox shows its tooltip, which stays; moving on closes it', async () => {
        mountTable({ getRowSelectionTooltip: () => HINT })
        row('r-1').focus({ preventScroll: true })

        await userEvent.keyboard('{ArrowRight}')
        await expectStays(HINT, checkbox('r-1'))
        await expect(checkbox('r-1')).toHaveAccessibleDescription(HINT)

        await userEvent.keyboard('{ArrowRight}')
        await waitFor(() => expect(tooltip()).toBeNull())
    })
})
