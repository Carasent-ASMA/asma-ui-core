import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * Rows are one composite widget (WAI-ARIA grid pattern): Tab enters on the active row, the arrow keys
 * move between rows, and Tab leaves the table — it does not walk through every row.
 */

interface Row {
    id: string
    name: string
}

const data: Row[] = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
    { id: 'r-3', name: 'Third' },
]

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

const mountBetweenButtons = (): void => {
    mount(
        <div>
            <button type='button'>Before</button>
            <StyledTable locale='en' columns={columns} data={data} />
            <button type='button'>After</button>
        </div>,
    )
}

const header = (): HTMLTableRowElement => document.querySelector<HTMLTableRowElement>('thead tr[tabindex="0"]')!
const row = (id: string): HTMLElement => document.getElementById(id)!
const button = (name: string): HTMLButtonElement =>
    [...document.querySelectorAll('button')].find((b) => b.textContent === name)!

describe('StyledTable — keyboard between rows', () => {
    afterEach(cleanup)

    it('moves between rows with the arrow keys', async () => {
        mountBetweenButtons()
        row('r-1').focus()

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(row('r-2'))
        await userEvent.keyboard('{ArrowUp}')
        await expect(document.activeElement).toBe(row('r-1'))
    })

    it('leaves the table with Tab from any row instead of moving to the next row', async () => {
        mountBetweenButtons()
        row('r-1').focus()

        await userEvent.keyboard('{Tab}')

        await expect(document.activeElement).toBe(button('After'))
    })

    it('goes back to the header with Shift+Tab from a row, not to the previous row', async () => {
        mountBetweenButtons()
        row('r-2').focus()

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

        await expect(document.activeElement).toBe(header())
    })

    it('enters the rows on the row the user left, from the header and from after the table', async () => {
        mountBetweenButtons()
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')

        header().focus()
        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement, 'Tab from the header').toBe(row('r-3'))

        button('After').focus()
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement, 'Shift+Tab from after the table').toBe(row('r-3'))
    })
})
