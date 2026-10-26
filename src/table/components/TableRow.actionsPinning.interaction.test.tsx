import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-8427 — the internal actions column is pinned right by default (the Figma pattern; the
 * pin-menu-only case is asserted by `StyledTable.stories` "Sizing Persistence And Control
 * Alignment"). Consumers whose actions column duplicates row content can opt out with
 * `stickyActions={false}`, which lets the cells scroll with the data while the header cell keeps
 * the pin menu pinned.
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
const positionOf = (cell: HTMLElement): string => getComputedStyle(cell).position

describe('StyledTable — actions column pinning', () => {
    afterEach(cleanup)

    it('pins a pin-menu-only column by default', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} />)

        await expect(cellsOf().length).toBe(columns.length + 1)
        await expect(positionOf(lastCell())).toBe('sticky')
    })

    it('pins a column that renders actions by default', async () => {
        mount(
            <StyledTable locale='en' columns={columns} data={data} customActionsNode={() => <span>open</span>} />,
        )

        await expect(positionOf(lastCell())).toBe('sticky')
    })

    it('scrolls the actions column with the data when `stickyActions` is false, while the pin stays put', async () => {
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

        // The header cell owns the pin menu and stays pinned either way.
        const pinHeader = document.querySelector<HTMLElement>('thead th:last-child')
        await expect(positionOf(pinHeader!)).toBe('sticky')
    })
})
