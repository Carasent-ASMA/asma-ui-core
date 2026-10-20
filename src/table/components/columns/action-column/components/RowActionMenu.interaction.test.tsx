import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import { RowActionMenu } from './RowActionMenu'

interface Row {
    id: string
    name: string
}

const data: Row[] = [{ id: 'r-1', name: 'Signed' }]
const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

describe('RowActionMenu disabled reason', () => {
    afterEach(cleanup)

    it('keeps a disabled trigger focusable, describes the reason and opens no menu', async () => {
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                actions={() => [{ label: 'Edit', onClick: () => undefined }]}
                rowActionsState={() => ({ state: 'disabled', tooltipTitle: 'Signed rows are locked' })}
            />,
        )
        const trigger = document.querySelector<HTMLButtonElement>('[data-test="row-actions-button"]')!

        await expect(trigger).not.toBeDisabled()
        await expect(trigger).toHaveAttribute('aria-disabled', 'true')
        await expect(trigger).toHaveAccessibleDescription('Signed rows are locked')

        trigger.click()
        await expect(document.querySelector('[role="menu"]')).toBeNull()

        trigger.focus()
        await waitFor(() => expect(document.querySelector('[role="tooltip"]')).toHaveTextContent('Signed rows are locked'))
    })

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
            const found = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
                (node) => node.textContent === 'Delete',
            )
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
            const found = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
                (node) => node.textContent === 'Delete',
            )
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
 */

interface CellRow {
    id: string
}

const cell = { row: { original: { id: '1' } }, table: { options: { meta: { locale: 'en' } } } } as unknown as CellContext<
    CellRow,
    unknown
>

const button = (container: HTMLElement): HTMLButtonElement =>
    container.querySelector<HTMLButtonElement>('[data-test="row-actions-button"]')!

describe('RowActionMenu — all actions disabled', () => {
    afterEach(cleanup)

    it('is reachable with Tab, announced as disabled, gives its reason on focus, and opens no menu', async () => {
        const onEdit = fn()
        const { container } = mount(
            <RowActionMenu<CellRow>
                tableData={cell}
                actions={() => [{ label: 'Edit', onClick: onEdit }]}
                rowActionsState={() => ({ state: 'disabled', tooltipTitle: 'Imported – change it there' })}
            />,
        )
        const trigger = button(container)

        await expect(trigger).not.toBeDisabled()
        await expect(trigger).toHaveAttribute('aria-disabled', 'true')

        await userEvent.tab()
        await expect(document.activeElement).toBe(trigger)
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
