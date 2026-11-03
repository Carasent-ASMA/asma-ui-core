import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * Rows are one composite widget (WAI-ARIA grid pattern): Tab enters on the active row, the arrow keys
 * move between rows, and Tab leaves the table — it does not walk through every row.
 *
 * ASMA-8702 (K-11): the header row is no longer a tab stop. Going back from a row with Shift+Tab lands on the LAST
 * header control (the pin), and entering the rows from the header starts from that control. The body model itself
 * (roving tab stop, arrows, Tab leaves forwards, entering on the row the user left) is ASMA-8087's and is unchanged.
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

/** The last header control: here the column settings pin, which follows the one sortable header. */
const lastHeaderControl = (): HTMLElement =>
    [...document.querySelectorAll<HTMLElement>('thead [role="button"], thead button')].at(-1)!
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

    it('K-11: goes back to the last header control with Shift+Tab from a row, not to the previous row', async () => {
        mountBetweenButtons()
        row('r-2').focus()

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

        await expect(document.activeElement).toBe(lastHeaderControl())
        await expect(document.activeElement?.getAttribute('aria-haspopup')).toBe('true')
    })

    it('K-11: enters the rows on the row the user left, from the last header control and from after the table', async () => {
        mountBetweenButtons()
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')

        lastHeaderControl().focus()
        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement, 'Tab from the last header control').toBe(row('r-3'))

        button('After').focus()
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement, 'Shift+Tab from after the table').toBe(row('r-3'))
    })
})
