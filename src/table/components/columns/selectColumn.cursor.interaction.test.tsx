import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from 'src/table/components/StyledTableIndex'

/**
 * ASMA-8338: the select column's checkboxes are clickable controls, so they show the hand cursor —
 * the select-all box in the header too, where the header's own `cursor: default` used to win and
 * showed the arrow. A locked row is not operable and keeps the not-allowed cursor.
 */

interface Row {
    id: string
    name: string
}

const data: Row[] = [
    { id: 'free', name: 'Free' },
    { id: 'locked', name: 'Locked' },
]

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

const cursorAt = async (element: HTMLElement): Promise<string> => {
    await userEvent.hover(element)
    return getComputedStyle(element).cursor
}

describe('StyledTable select column cursor', () => {
    afterEach(cleanup)

    it('shows the pointer on the select-all box and selectable rows, not-allowed on a locked row', async () => {
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                enableRowSelection={(row) => row.original.id !== 'locked'}
                initialState={{ columnVisibility: { select: true } }}
                uniqueKey='select-cursor'
            />,
        )

        const selectAll = await waitFor(() => {
            const found = document.querySelector<HTMLElement>('thead [role="checkbox"]')
            if (!found) throw new Error('select-all not rendered')
            return found
        })
        const free = document.querySelector<HTMLElement>('tr[id="free"] [role="checkbox"]')!
        const locked = document.querySelector<HTMLElement>('tr[id="locked"] [role="checkbox"]')!

        await expect(await cursorAt(selectAll), 'select-all box').toBe('pointer')
        await expect(await cursorAt(free), 'selectable row box').toBe('pointer')
        await expect(await cursorAt(locked), 'locked row box').not.toBe('pointer')
    })
})
