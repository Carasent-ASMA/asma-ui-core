import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CellContext } from '@tanstack/react-table'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { RowActionMenu } from './RowActionMenu'

interface Row {
    id: string
}

// The menu reads only the row and the table locale from its cell.
const cell = { row: { original: { id: '1' } }, table: { options: { meta: { locale: 'en' } } } } as unknown as CellContext<
    Row,
    unknown
>

const meta = {
    title: 'Table/Row Action Menu',
    component: RowActionMenu<Row>,
    parameters: {
        docs: {
            description: {
                component:
                    'The ⋮ trigger of a table row. `rowActionsState` can show it enabled, hidden or disabled with a `tooltipTitle` reason.',
            },
        },
    },
} satisfies Meta<typeof RowActionMenu<Row>>

export default meta

type Story = StoryObj<typeof meta>

const onEdit = fn()
const reason = 'Imported from Ad Curis – change it there'

/**
 * All of a row's actions disabled: the ⋮ stays in the Tab order with `aria-disabled` (ASMA
 * disabled-states DIS-2, DIS-3). Its reason opens on hover, keyboard focus and tap, is the trigger's
 * accessible description, and closes on Escape and blur; pressing the trigger only shows the reason.
 */
export const DisabledWithReason: Story = {
    args: {
        tableData: cell,
        actions: () => [{ label: 'Edit', onClick: onEdit }],
        rowActionsState: () => ({ state: 'disabled', tooltipTitle: reason }),
    },
    play: async ({ canvas }) => {
        const body = within(document.body)
        const trigger = canvas.getByRole('button', { name: 'Row actions' })

        await expect(trigger).toHaveAttribute('aria-disabled', 'true')
        await expect(trigger).not.toBeDisabled()

        await userEvent.tab()
        await expect(trigger).toHaveFocus()
        await waitFor(async () => expect(body.getByRole('tooltip')).toHaveTextContent(reason))
        await expect(trigger).toHaveAccessibleDescription(reason)

        await userEvent.keyboard('{Enter}')
        await expect(body.queryByRole('menu')).toBeNull()
        await expect(onEdit).not.toHaveBeenCalled()

        await userEvent.keyboard('{Escape}')
        await waitFor(async () => expect(body.queryByRole('tooltip')).toBeNull())
    },
}
