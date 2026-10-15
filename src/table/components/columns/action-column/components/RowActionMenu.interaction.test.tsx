import type { CellContext } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { RowActionMenu } from './RowActionMenu'

/**
 * A row whose actions are all disabled keeps its ⋮ focusable (`aria-disabled`, not native `disabled`),
 * so keyboard users reach it and its reason (disabled-states DIS-2, DIS-3). A press only explains.
 */

interface Row {
    id: string
}

const cell = { row: { original: { id: '1' } }, table: { options: { meta: { locale: 'en' } } } } as unknown as CellContext<
    Row,
    unknown
>

const button = (container: HTMLElement): HTMLButtonElement =>
    container.querySelector<HTMLButtonElement>('[data-test="row-actions-button"]')!

describe('RowActionMenu — all actions disabled', () => {
    afterEach(cleanup)

    it('is reachable with Tab, announced as disabled, gives its reason on focus, and opens no menu', async () => {
        const onEdit = fn()
        const { container } = mount(
            <RowActionMenu<Row>
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
            expect(within(document.body).getByText('Imported – change it there')).toBeVisible(),
        )
        await expect(trigger).toHaveAccessibleDescription('Imported – change it there')

        await userEvent.keyboard('{Enter}')
        await expect(document.querySelector('[role="menu"]')).toBeNull()
        await expect(onEdit).not.toHaveBeenCalled()

        await userEvent.keyboard('{Escape}')
        await waitFor(async () =>
            expect(within(document.body).queryByText('Imported – change it there')).toBeNull(),
        )
    })
})
