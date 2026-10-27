import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * The header row's Tab handler (ASMA-8087: Tab from the header row goes to the active body row) must act only
 * when Tab is pressed on the header row itself, and must leave a Tab that a control inside the header, such as
 * the column settings popover, has already handled (ASMA-8597, WCAG 2.1.1).
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
    [...document.querySelectorAll('button')].find((candidate) => candidate.textContent === name)!
const sortControl = (label: string): HTMLElement =>
    [...document.querySelectorAll<HTMLElement>('thead [role="button"]')].find((control) => control.textContent === label)!

describe('StyledTable header row Tab handler', () => {
    afterEach(cleanup)

    it('ST-11b: with the header row itself focused, Tab still goes to the active body row (ASMA-8087 kept)', async () => {
        mountBetweenButtons()
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}')

        header().focus()
        await userEvent.keyboard('{Tab}')

        await expect(document.activeElement).toBe(row('r-2'))
    })

    it('leaves Tab pressed on a control inside the header to the browser: next header control, not the rows', async () => {
        mountBetweenButtons()
        sortControl('Name').focus()

        await userEvent.keyboard('{Tab}')

        await expect(document.activeElement).toBe(sortControl('Role'))
        await expect(document.activeElement?.closest('tbody')).toBeNull()
    })

    it('leaves a Tab on the header row that something already handled alone (defaultPrevented)', async () => {
        mountBetweenButtons()
        header().focus()

        // An earlier handler (what the column settings popover does) takes the Tab and moves focus on purpose.
        const takeTab = (event: KeyboardEvent): void => {
            if (event.key !== 'Tab') return
            event.preventDefault()
            button('After').focus()
        }

        document.addEventListener('keydown', takeTab, true)
        try {
            await userEvent.keyboard('{Tab}')
        } finally {
            document.removeEventListener('keydown', takeTab, true)
        }

        await expect(document.activeElement).toBe(button('After'))
    })

    it('keeps Shift+Tab from a body row going to the header row', async () => {
        mountBetweenButtons()
        row('r-2').focus()

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')

        await expect(document.activeElement).toBe(header())
    })
})
