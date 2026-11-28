import type { ColumnDef } from '@tanstack/react-table'
import type { ReactElement } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { button, press as pressKeys } from 'src/test-utils/tableFixture'
import { StyledAccordion } from 'src/components/utils/accordion/base-ui/StyledAccordion'
import { StyledAccordionDetails } from 'src/components/utils/accordion/base-ui/StyledAccordionDetails'
import { StyledAccordionSummary } from 'src/components/utils/accordion/base-ui/StyledAccordionSummary'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-8875: a table rendered where it is not shown yet — in a collapsed accordion (its panel is `inert`) or a `hidden`
 * panel — and shown later. What shows it is outside the table, so the table must still have its header stop then: Tab
 * reaches the header row, and Shift+Tab from the body returns to it. Seen on the patient profile's Network table, whose
 * accordion opens when its data has loaded.
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

const table = (): ReactElement => <StyledTable<Row> locale='en' columns={columns} data={data} hideFooter />

/** Where the focus is: the header row, a body row by its id, or a button by its text. */
const focusName = (): string => {
    const active = document.activeElement as HTMLElement | null

    if (!active || active === document.body) return 'nothing'
    if (active.tagName === 'TR') return active.closest('thead') ? 'header row' : `row ${active.id}`

    return active.textContent || active.tagName
}

const press = (keys: string): Promise<string> => pressKeys(keys, focusName)

describe('ASMA-8875 a table shown after it rendered', () => {
    afterEach(cleanup)

    it('in an accordion that opens later: Tab reaches the header row, and Shift+Tab from the body returns to it', async () => {
        const page = (expanded: boolean): ReactElement => (
            <div>
                <button type='button'>Before</button>
                <StyledAccordion expanded={expanded} onChange={() => undefined}>
                    <StyledAccordionSummary>Network</StyledAccordionSummary>
                    <StyledAccordionDetails>{table()}</StyledAccordionDetails>
                </StyledAccordion>
                <button type='button'>After</button>
            </div>
        )
        const { rerender } = mount(page(false))

        rerender(page(true))
        await waitFor(() => expect(document.querySelector('[role="region"]')).not.toHaveAttribute('inert'))

        button('Network').focus()
        await expect(await press('{Tab}')).toBe('header row')
        await expect(await press('{Tab}')).toBe('row r-1')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('header row')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('Network')
    })

    it('in a hidden panel shown later: Tab reaches the header row first', async () => {
        const page = (hidden: boolean): ReactElement => (
            <div>
                <button type='button'>Before</button>
                <div hidden={hidden}>{table()}</div>
                <button type='button'>After</button>
            </div>
        )
        const { rerender } = mount(page(true))

        rerender(page(false))

        button('Before').focus()
        await waitFor(() => expect(document.querySelector('thead tr')).toHaveAttribute('tabindex', '0'))
        await expect(await press('{Tab}')).toBe('header row')
        await expect(await press('{Tab}')).toBe('row r-1')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('header row')
    })
})
