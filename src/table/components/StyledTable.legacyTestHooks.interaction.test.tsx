import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-8137: the table renders core's button, checkbox and menu item, which emit `data-testid`. Apps whose
 * `testIdAttribute` is `data-test` (editor, qnreditor, crm) still query these hooks, so the table keeps them.
 */

const data = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
]
const columns: ColumnDef<(typeof data)[number]>[] = [{ accessorKey: 'name', header: 'Name' }]

const waitForElement = (selector: string): Promise<HTMLElement> =>
    waitFor(() => {
        const found = document.querySelector<HTMLElement>(selector)
        if (!found) throw new Error(`${selector} not rendered`)
        return found
    })

describe('StyledTable legacy data-test hooks (ASMA-8137)', () => {
    afterEach(cleanup)

    it('keeps data-test next to data-testid on the hooks other apps query', async () => {
        mount(
            <StyledTable
                data={data}
                columns={columns}
                locale='en'
                enableRowSelection
                textExpandArrow
                initialState={{ columnVisibility: { select: true } }}
                actions={() => [{ label: 'Edit', onClick: () => undefined }]}
            />,
        )

        for (const hook of ['cell-select', 'expand-text-button', 'row-actions-button']) {
            const element = await waitForElement(`[data-testid="${hook}"]`)
            await expect(element, hook).toHaveAttribute('data-test', hook)
        }

        await userEvent.click(await waitForElement('thead button[aria-haspopup="true"]'))
        const reset = await waitForElement('[data-testid="reset-order-button"]')
        await expect(reset).toHaveAttribute('data-test', 'reset-order-button')
    })
})

describe('StyledTable row-action menu keyboard activation (ASMA-8137)', () => {
    afterEach(cleanup)

    it.each(['{Enter}', ' '])('%s runs the action once and closes the menu', async (key) => {
        const onEdit = fn()
        mount(<StyledTable data={data} columns={columns} locale='en' actions={() => [{ label: 'Edit', onClick: onEdit }]} />)

        await userEvent.click(await waitForElement('[data-testid="row-actions-button"]'))
        const item = await waitForElement('[role="menuitem"]')
        item.focus()
        await userEvent.keyboard(key)

        await expect(onEdit).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull())
    })
})
