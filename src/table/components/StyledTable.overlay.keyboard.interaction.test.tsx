import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { tabbableWithin } from 'src/helpers/focusable'
import { StyledDialog } from 'src/components/feedback/dialog/StyledDialog'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { button, row } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-8875: a dialog or popover rendered inside a row ends the table. `StyledDialog` is a native `<dialog>`, rendered in
 * place, so a cell that opens one puts the dialog inside the row's DOM. Its controls are not the row's, its keys are not
 * the table's, and a StyledTable in it owns its own two tab stops. Every key is a real press.
 */

interface Row {
    id: string
    name: string
}

const rows: Row[] = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
]
const items: Row[] = [
    { id: 'i-1', name: 'Item 1' },
    { id: 'i-2', name: 'Item 2' },
]

/** A cell with a button that opens a modal dialog in place: a text field, two buttons and a small table. */
const DialogCell = ({ id }: { id: string }): JSX.Element => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button type='button' onClick={() => setOpen(true)}>{`Edit ${id}`}</button>
            <StyledDialog open={open} onClose={() => setOpen(false)} dataTest='cell-dialog' dialogTitle={`Edit ${id}`}>
                <input aria-label='Note' />
                <button type='button'>Save</button>
                <button type='button'>Cancel</button>
                <StyledTable<Row> locale='en' columns={[{ accessorKey: 'name', header: 'Item' }]} data={items} hideFooter />
            </StyledDialog>
        </>
    )
}

const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    { id: 'edit', header: 'Edit', enableSorting: false, cell: ({ row: tableRow }) => <DialogCell id={tableRow.id} /> },
]

const outerTable = (): HTMLTableElement => document.querySelector<HTMLTableElement>('table')!
const dialog = (): HTMLDialogElement | null => document.querySelector('dialog')
const innerTable = (): HTMLTableElement => dialog()!.querySelector<HTMLTableElement>('table')!

/** Opens row 1's dialog with the keys: the row, Right Arrow to its button, Enter. */
const openDialog = async (): Promise<void> => {
    mount(
        <div>
            <button type='button'>Before</button>
            <StyledTable<Row> locale='en' columns={columns} data={rows} hideFooter />
            <button type='button'>After</button>
        </div>,
    )
    row('r-1').focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(document.activeElement).toBe(button('Edit r-1'))
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(dialog()?.open).toBe(true))
}

describe('ASMA-8875 a dialog inside a row ends the table', () => {
    afterEach(cleanup)

    it("the dialog's controls keep their own tab stops: the table does not take them over", async () => {
        await openDialog()

        for (const control of [document.querySelector<HTMLElement>('input[aria-label="Note"]')!, button('Save'), button('Cancel')]) {
            await expect(control.tabIndex).toBe(0)
            await expect(control.hasAttribute('data-table-control')).toBe(false)
        }
    })

    it("Tab, Shift+Tab and the arrow keys in the dialog are the dialog's, not the table's", async () => {
        await openDialog()
        document.querySelector<HTMLElement>('input[aria-label="Note"]')!.focus()

        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).toBe(button('Save'))
        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).toBe(button('Cancel'))
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement).toBe(button('Save'))

        // ArrowDown on a dialog button moves no table row.
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(button('Save'))
        await expect(dialog()?.open).toBe(true)
    })

    it("the dialog's StyledTable owns itself: its own two tab stops, and its own keys", async () => {
        await openDialog()

        await expect(tabbableWithin(innerTable())).toHaveLength(2)
        row('i-1').focus()
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(row('i-2'))
        await expect(dialog()?.open).toBe(true)
    })

    it('the outer table is as before once the dialog closes', async () => {
        await openDialog()

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(dialog()).toBeNull())

        await expect(tabbableWithin(outerTable())).toHaveLength(2)
        await expect(button('Edit r-1').tabIndex).toBe(-1)
        await expect(button('Edit r-1')).toHaveAttribute('data-table-control')
        row('r-1').focus()
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(row('r-2'))
    })
})
