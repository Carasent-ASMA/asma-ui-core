import type { CellContext } from '@tanstack/react-table'
import { useState } from 'react'
import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledMenu } from 'src/components/navigation/menu/StyledMenu'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'
import { RowActionMenu } from 'src/table/components/columns/action-column/components/RowActionMenu'

/**
 * ASMA-7539 — Figma "Menus" (Design System 25775-130701): the popover surface keeps 8px above the
 * first row and below the last, and every row is exactly 40px, separators included.
 */

const ROW = '[role="menuitem"],[role="option"]'

const expectMenuGeometry = async (list: HTMLElement): Promise<void> => {
    const rows = Array.from(list.querySelectorAll<HTMLElement>(ROW))
    await expect(rows.length).toBeGreaterThan(1)
    for (const row of rows) await expect(row.getBoundingClientRect().height, row.textContent ?? '').toBe(40)

    const box = list.getBoundingClientRect()
    const style = getComputedStyle(list)
    const innerTop = box.top + parseFloat(style.borderTopWidth)
    const innerBottom = box.bottom - parseFloat(style.borderBottomWidth)
    await expect(rows[0]!.getBoundingClientRect().top - innerTop).toBe(8)
    await expect(innerBottom - rows.at(-1)!.getBoundingClientRect().bottom).toBe(8)
}

const openList = async (role: 'menu' | 'listbox'): Promise<HTMLElement> => {
    await waitFor(() => expect(document.querySelector(`[role="${role}"]`)).not.toBe(null))
    return document.querySelector<HTMLElement>(`[role="${role}"]`)!
}

describe('menu geometry (Figma Menus)', () => {
    afterEach(cleanup)

    it('table row-action menu pads 8px and keeps 40px rows', async () => {
        const tableData = { row: {}, table: { options: { meta: {} } } } as unknown as CellContext<object, unknown>
        const { container } = mount(
            <RowActionMenu
                tableData={tableData}
                actions={() => [
                    { label: 'Edit', onClick: vi.fn() },
                    { label: 'Archive', onClick: vi.fn() },
                    { label: 'Remove', onClick: vi.fn() },
                ]}
            />,
        )

        await userEvent.click(container.querySelector<HTMLElement>('button[aria-label="Row actions"]')!)
        await expectMenuGeometry(await openList('menu'))
    })

    it('StyledMenu pads 8px and keeps 40px rows', async () => {
        const Fixture = (): JSX.Element => {
            const [anchor, setAnchor] = useState<HTMLElement | null>(null)
            return (
                <>
                    <button type='button' ref={setAnchor}>
                        More
                    </button>
                    <StyledMenu open={!!anchor} anchorEl={anchor} onClose={vi.fn()}>
                        <StyledMenuItem>Edit</StyledMenuItem>
                        <StyledMenuItem>Make a copy</StyledMenuItem>
                        <StyledMenuItem disabled>Remove</StyledMenuItem>
                    </StyledMenu>
                </>
            )
        }
        mount(<Fixture />)

        await expectMenuGeometry(await openList('menu'))
    })

    it('StyledSelect pads 8px and keeps 40px rows despite the row separators', async () => {
        const { container } = mount(
            <StyledSelect dataTest='status' name='Status' value='b' onChange={vi.fn()}>
                <StyledSelectItem value='a'>Active</StyledSelectItem>
                <StyledSelectItem value='b'>Paused</StyledSelectItem>
                <StyledSelectItem value='c'>Closed</StyledSelectItem>
            </StyledSelect>,
        )

        await userEvent.click(container.querySelector<HTMLElement>('[data-testid="status"]')!)
        await expectMenuGeometry(await openList('listbox'))
    })
})
