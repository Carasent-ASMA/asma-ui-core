import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * A row reached with the arrow keys is scrolled into view and is never left under the sticky header
 * (WCAG 2.4.11 Focus Not Obscured). Measured in a real browser: only layout can tell what is visible.
 */

interface Row {
    id: string
    name: string
}

const data: Row[] = Array.from({ length: 20 }, (_, index) => ({ id: `r-${index}`, name: `Row ${index}` }))
const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

const scrollerOf = (element: HTMLElement): HTMLElement => {
    for (let node = element.parentElement; node; node = node.parentElement) {
        const { overflowY } = getComputedStyle(node)
        if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node
    }
    throw new Error('the table did not scroll')
}

/** The focused row lies fully inside the scroll box, below the sticky header. */
const isFullyVisible = (row: HTMLElement): boolean => {
    const box = scrollerOf(row).getBoundingClientRect()
    const header = row.closest('table')!.tHead!.getBoundingClientRect()
    const rect = row.getBoundingClientRect()
    return rect.top >= Math.max(box.top, header.bottom) - 1 && rect.bottom <= box.bottom + 1
}

describe('StyledTable — the arrow-focused row stays in view', () => {
    afterEach(cleanup)

    it('scrolls down with the focus and back up without hiding the row under the sticky header', async () => {
        mount(<StyledTable locale='en' columns={columns} data={data} height={240} stickyHeader rowHeight={48} />)
        document.getElementById('r-0')!.focus()

        await userEvent.keyboard('{ArrowDown>15/}')
        const low = document.getElementById('r-15')!
        await expect(document.activeElement).toBe(low)
        await expect(isFullyVisible(low), 'r-15 after moving down').toBe(true)

        await userEvent.keyboard('{ArrowUp>12/}')
        const high = document.getElementById('r-3')!
        await expect(document.activeElement).toBe(high)
        await expect(isFullyVisible(high), 'r-3 after moving back up').toBe(true)
    })
})
