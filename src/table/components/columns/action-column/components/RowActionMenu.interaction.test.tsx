import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import { menuItem, row, rowActionsTrigger } from 'src/test-utils/tableFixture'

interface Row {
    id: string
    name: string
}

const data: Row[] = [{ id: 'r-1', name: 'Signed' }]
const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

describe('RowActionMenu disabled reason', () => {
    afterEach(cleanup)

    it('describes a disabled menu action on the item itself and keeps it reachable', async () => {
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                actions={() => [
                    { label: 'Edit', onClick: () => undefined },
                    { label: 'Delete', disabled: true, tooltipTitle: 'Only the owner can delete' },
                ]}
            />,
        )
        document.querySelector<HTMLButtonElement>('[data-test="row-actions-button"]')!.click()

        const item = await waitFor(() => {
            const found = menuItem('Delete')
            if (!found) throw new Error('menu not open')
            return found
        })
        await expect(item).toHaveAttribute('aria-disabled', 'true')
        await expect(item).toHaveAttribute('data-has-reason', 'true')
        await expect(item).toHaveAccessibleDescription('Only the owner can delete')
    })

    it('keeps the menu and the reason open when a disabled action is tapped', async () => {
        const onDelete = fn()
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                actions={() => [
                    { label: 'Edit', onClick: () => undefined },
                    { label: 'Delete', disabled: true, tooltipTitle: 'Only the owner can delete', onClick: onDelete },
                ]}
            />,
        )
        document.querySelector<HTMLButtonElement>('[data-test="row-actions-button"]')!.click()
        const item = await waitFor(() => {
            const found = menuItem('Delete')
            if (!found) throw new Error('menu not open')
            return found
        })

        item.dispatchEvent(new PointerEvent('pointerup', { pointerType: 'touch', bubbles: true }))
        await waitFor(() => expect(document.querySelector('[role="tooltip"]')).toHaveTextContent('Only the owner can delete'))
        item.click()

        await new Promise((resolve) => setTimeout(resolve, 100))
        await expect(document.querySelector('[role="menu"]')).not.toBeNull()
        await expect(item.isConnected).toBe(true)
        await expect(document.querySelector('[role="tooltip"]')).toHaveTextContent('Only the owner can delete')
        await expect(onDelete).not.toHaveBeenCalled()
    })

    it('stays focusable and aria-disabled when no reason is given (DIS-3)', async () => {
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                actions={() => [{ label: 'Edit', onClick: () => undefined }]}
                rowActionsState={() => ({ state: 'disabled' })}
            />,
        )

        const trigger = document.querySelector<HTMLButtonElement>('[data-test="row-actions-button"]')!
        await expect(trigger).not.toBeDisabled()
        await expect(trigger).toHaveAttribute('aria-disabled', 'true')
    })
})

/**
 * A row whose actions are all disabled keeps its ⋮ focusable (`aria-disabled`, not native `disabled`),
 * so keyboard users reach it and its reason (disabled-states DIS-2, DIS-3). A press only explains.
 * The ⋮ is not a tab stop since ASMA-8875: the arrow keys reach it in its row.
 */

describe('RowActionMenu — all actions disabled', () => {
    afterEach(cleanup)

    it('is reachable with the arrow keys from its row, announced as disabled, gives its reason on focus, and opens no menu', async () => {
        const onEdit = fn()

        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                actions={() => [{ label: 'Edit', onClick: onEdit }]}
                rowActionsState={() => ({ state: 'disabled', tooltipTitle: 'Imported – change it there' })}
            />,
        )
        // Reached as a keyboard user reaches it: the row, then Right Arrow (ASMA-8875).
        const trigger = rowActionsTrigger('r-1')

        row('r-1').focus()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(trigger)
        await expect(trigger).not.toBeDisabled()
        await expect(trigger).toHaveAttribute('aria-disabled', 'true')
        await expect(trigger).toHaveAttribute('tabindex', '-1')
        await waitFor(async () =>
            expect(within(document.body).getByRole('tooltip')).toHaveTextContent('Imported – change it there'),
        )
        await expect(trigger).toHaveAccessibleDescription('Imported – change it there')

        await userEvent.keyboard('{Enter}')
        await expect(document.querySelector('[role="menu"]')).toBeNull()
        await expect(onEdit).not.toHaveBeenCalled()

        await userEvent.keyboard('{Escape}')
        await waitFor(async () => expect(within(document.body).queryByRole('tooltip')).toBeNull())
    })
})

describe('RowActionMenu keyboard', () => {
    afterEach(cleanup)

    it('leaves focus on the ⋮ after a mouse click; an arrow key then moves it into the menu', async () => {
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                actions={() => [
                    { label: 'Edit', onClick: () => undefined },
                    { label: 'Delete', onClick: () => undefined },
                ]}
            />,
        )
        const trigger = rowActionsTrigger('r-1')
        await userEvent.click(trigger)
        await waitFor(() => expect(menuItem('Edit')).toBeDefined())

        // No item takes focus, so none shows the keyboard focus bar.
        await expect(document.activeElement).toBe(trigger)

        await userEvent.keyboard('{ArrowUp}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Delete')))
        await userEvent.keyboard('{ArrowUp}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))
    })

})
