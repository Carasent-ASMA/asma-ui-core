import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-8427 — the internal actions column's body cells are pinned right only when they have
 * something to show. A column that only hosts the header pin menu has empty body cells, and pinned
 * they covered the column behind them, so they scroll with the data. The header cell with the pin
 * menu stays pinned either way.
 *
 * Asserted on computed styles: `position: sticky` is pure CSS, so only a browser can tell whether
 * the cell actually stops scrolling with the data.
 */

interface Row {
    id: string
    name: string
    role: string
}

const data: Row[] = [{ id: 'r-1', name: 'First', role: 'Admin' }]

const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role' },
]

const cellsOf = (): HTMLTableCellElement[] => [
    ...document.querySelectorAll<HTMLTableCellElement>('tr[id="r-1"] > td'),
]
const lastCell = (): HTMLTableCellElement => cellsOf().at(-1)!
const pinHeader = (): HTMLElement => document.querySelector<HTMLElement>('thead th:last-child')!
const positionOf = (cell: HTMLElement): string => getComputedStyle(cell).position

describe('StyledTable — actions column pinning', () => {
    afterEach(cleanup)

    it('scrolls an empty, pin-menu-only column with the data while the pin stays put', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} enableResizing />)

        await expect(cellsOf().length).toBe(columns.length + 1)
        await expect(positionOf(lastCell())).not.toBe('sticky')
        await expect(positionOf(pinHeader())).toBe('sticky')
    })

    it('pins a column that renders actions', async () => {
        mount(
            <StyledTable locale='en' columns={columns} data={data} customActionsNode={() => <span>open</span>} />,
        )

        await expect(positionOf(lastCell())).toBe('sticky')
    })

    it('keeps an empty column pinned beside fixed-right columns, so body and header offsets match', async () => {
        const withFixedRight: ColumnDef<Row>[] = [columns[0]!, { ...columns[1]!, fixedRight: true }]
        mount(<StyledTable locale='en' columns={withFixedRight} data={data} />)

        await expect(positionOf(lastCell())).toBe('sticky')
    })

    it('lets `stickyActions={false}` scroll a column that renders actions', async () => {
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                customActionsNode={() => <span>open</span>}
                stickyActions={false}
                enableResizing
            />,
        )

        await expect(positionOf(lastCell())).not.toBe('sticky')
        await expect(positionOf(pinHeader())).toBe('sticky')
    })
})
