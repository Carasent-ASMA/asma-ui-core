import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from '../StyledTableIndex'

/**
 * A row that cannot be selected comes in two kinds, and they must not look the same.
 *
 * **Ticked and locked** — the picker case: the row is already attached, so the checkbox is
 * *read-only*. It says "you already have this", which the greyed `delta-200` fill did not: that fill
 * reads as "unavailable to you", the opposite fact.
 *
 * **Unticked and locked** — still disabled, and must be: the read-only box is a plain white box with
 * a `delta-500` border, which is exactly what a *selectable* row looks like, so the one thing the
 * user needs to know about such a row would stop being visible.
 *
 * Asserted on computed styles in a real browser, like the sibling `activeRow` spec: the two states
 * differ only in painted CSS, and jsdom computes none of it.
 */

interface Row {
    id: string
    name: string
}

const data: Row[] = [
    { id: 'attached', name: 'Already attached' },
    { id: 'free', name: 'Free to pick' },
    { id: 'blocked', name: 'Locked and unticked' },
]

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

/** Ticked rows are fed in as selection state, exactly as the pickers merge their attached ids. */
const selection = { attached: true }

const renderTable = (tooltip: string | null = null) =>
    mount(
        <StyledTable<Row, never>
            locale='en'
            columns={columns}
            data={data}
            enableRowSelection={(row) => row.original.id === 'free'}
            state={{ rowSelection: selection, columnVisibility: { select: true } }}
            initialState={{ rowSelection: selection, columnVisibility: { select: true } }}
            getRowSelectionTooltip={(row) => (row.getCanSelect() ? null : tooltip)}
        />,
    )

const selectCellOf = (rowId: string): HTMLElement => {
    const control = document.querySelector<HTMLElement>(`tr[id="${rowId}"] [role="checkbox"]`)
    if (!control) throw new Error(`no select control on row ${rowId}`)
    return control
}

/** The tooltip's trigger: the span the column wraps around the checkbox. */
const triggerOf = (rowId: string): HTMLElement => {
    const trigger = selectCellOf(rowId).querySelector<HTMLElement>('span')
    if (!trigger) throw new Error(`no tooltip trigger on row ${rowId}`)
    return trigger
}

/** The painted box inside the checkbox — the element the state classes colour. */
const boxOf = (rowId: string): HTMLElement => {
    const box = selectCellOf(rowId).querySelector<HTMLElement>('[data-test="cell-select"] > span:last-of-type')
    if (!box) throw new Error(`no checkbox box on row ${rowId}`)
    return box
}

describe('StyledTable select column — a row that cannot be selected', () => {
    afterEach(cleanup)

    it('renders a ticked locked row read-only: a white box, not the disabled grey fill', async () => {
        renderTable()

        const background = getComputedStyle(boxOf('attached')).backgroundColor
        await expect(background).toBe('rgb(255, 255, 255)')
        // `delta-200`, the disabled fill, is what it must no longer be.
        await expect(background).not.toBe('rgb(222, 226, 231)')
    })

    it('keeps an unticked locked row disabled, so it cannot pass for a selectable one', async () => {
        renderTable()

        const locked = getComputedStyle(boxOf('blocked')).borderColor
        const selectable = getComputedStyle(boxOf('free')).borderColor
        await expect(locked).not.toBe(selectable)
    })

    it('leaves a selectable row alone', async () => {
        renderTable()

        await expect(selectCellOf('free')).toHaveAttribute('aria-disabled', 'false')
        await expect(selectCellOf('free')).toHaveAttribute('tabindex', '0')
    })

    /*
     * Read-only is a look, not a licence. Asserted on the state rather than by clicking: Playwright
     * refuses to click an `aria-disabled` element at all ("element is not enabled"), which is itself
     * the strongest statement that the control is inert — and it is out of the tab order too.
     */
    it('keeps a read-only row out of reach: not operable, and still announced as such', async () => {
        renderTable()

        await expect(selectCellOf('attached')).toHaveAttribute('aria-checked', 'true')
        await expect(selectCellOf('attached')).toHaveAttribute('aria-disabled', 'true')
        await expect(selectCellOf('attached')).toHaveAttribute('tabindex', '-1')
    })

    it('shows the caller\'s reason on hover, from `getRowSelectionTooltip`', async () => {
        renderTable('Already selected')

        await userEvent.hover(triggerOf('attached'))

        await waitFor(() => expect(document.querySelector('[role="tooltip"]')).not.toBeNull())
        await expect(document.querySelector('[role="tooltip"]')).toHaveTextContent('Already selected')
    })
})
