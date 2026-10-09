import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from 'src/table/components/StyledTableIndex'

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

    it('stays natively disabled when no reason is given', async () => {
        mount(
            <StyledTable
                locale='en'
                columns={columns}
                data={data}
                actions={() => [{ label: 'Edit', onClick: () => undefined }]}
                rowActionsState={() => ({ state: 'disabled' })}
            />,
        )

        await expect(document.querySelector('[data-test="row-actions-button"]')).toBeDisabled()
    })
})
