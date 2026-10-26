import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * `activeRowId` — the row the user is working with (e.g. the one opened in a side panel) is drawn in
 * the Figma table-row Selected state (ASMA-8338): the gama-25 fill with a 2px gama-400 frame, full width,
 * including the sticky actions cell, whose own `box-shadow` used to clip any frame drawn from outside.
 * The fill stays on hover. Keyboard focus keeps the 3px Focused frame.
 *
 * Asserted on computed styles in a real browser: the frame is pure CSS, so only a browser can tell
 * whether it actually paints.
 */

interface Row {
    id: string
    name: string
    role: string
}

const data: Row[] = [
    { id: 'r-1', name: 'First', role: 'Admin' },
    { id: 'r-2', name: 'Second', role: 'User' },
]

const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role' },
]

const cellsOf = (rowId: string): HTMLTableCellElement[] => [
    ...document.querySelectorAll<HTMLTableCellElement>(`tr[id="${rowId}"] > td`),
]
const shadowOf = (cell: HTMLElement): string => getComputedStyle(cell).boxShadow
/** An inset band — the frame's top/bottom (or side) edge. */
const FRAME = /inset/

describe('StyledTable — activeRowId', () => {
    afterEach(cleanup)

    it('marks only the active row', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} activeRowId='r-2' enableRowSelection />)

        await expect(document.getElementById('r-2')).toHaveAttribute('data-active', 'true')
        await expect(document.getElementById('r-1')).not.toHaveAttribute('data-active')
    })

    it('frames every cell of the active row with the 2px Selected frame, the last (actions) cell included', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} activeRowId='r-2' enableRowSelection />)

        const cells = cellsOf('r-2')
        await expect(cells.length).toBeGreaterThan(2)
        for (const cell of cells) await expect(shadowOf(cell)).toMatch(FRAME)
        // The left and right edges close the frame on the first and last cell.
        await expect(shadowOf(cells[0]!)).toMatch(/ 2px 0px 0px 0px inset/)
        await expect(shadowOf(cells[cells.length - 1]!)).toMatch(/-2px 0px 0px 0px inset/)
        for (const cell of cells) await expect(shadowOf(cell)).not.toMatch(/3px/)
    })

    it('fills the row with table/bg-row-selected (gama-25), kept on hover', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} activeRowId='r-2' />)

        // Default theme: gama-25 = blue-25 #f2f8fb.
        const GAMA_25 = 'rgb(242, 248, 251)'
        const active = cellsOf('r-2')
        for (const cell of active) await expect(getComputedStyle(cell).backgroundColor, 'at rest').toBe(GAMA_25)
        await userEvent.hover(active[0]!)
        for (const cell of active) await expect(getComputedStyle(cell).backgroundColor, 'on hover').toBe(GAMA_25)
    })

    it('shows the 3px Focused frame instead when the active row has keyboard focus', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} activeRowId='r-2' />)

        // Arrow-key navigation from the first row moves keyboard focus onto the active row.
        document.getElementById('r-1')!.focus()
        await userEvent.keyboard('{ArrowDown}')
        const row = document.getElementById('r-2')!
        await expect(row.matches(':focus-visible'), 'the active row has keyboard focus').toBe(true)
        await expect(shadowOf(cellsOf('r-2')[0]!)).toMatch(/ 3px 0px 0px 0px inset/)
    })

    it('draws no frame on other rows, nor anywhere without the prop', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} activeRowId='r-2' enableRowSelection />)
        for (const cell of cellsOf('r-1')) await expect(shadowOf(cell)).not.toMatch(FRAME)
        cleanup()

        mount(<StyledTable locale='en' columns={columns} data={data} enableRowSelection />)
        for (const cell of cellsOf('r-2')) await expect(shadowOf(cell)).not.toMatch(FRAME)
    })
})
