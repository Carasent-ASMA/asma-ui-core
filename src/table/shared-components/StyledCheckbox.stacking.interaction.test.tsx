import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import { StyledCheckbox as InputStyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledCheckbox } from './StyledCheckbox'

/**
 * ASMA-8338: both checkboxes lift layers above the opaque hover halo (the table copy's box and
 * ripple at `z-index: 1`; the input copy's focus/error frame at 1 and box at 2). Those layers must
 * stay inside the checkbox: the sticky (frozen) cells sit at `z-index: 1` in the table's stacking
 * context, so an uncontained layer in a later column would paint over a frozen column when it
 * scrolls underneath it. The input copy is rendered in its Error state, where its layers are lifted.
 *
 * Asserted through `elementFromPoint` in a real browser (a paint-order question).
 */

interface Row {
    id: string
    name: string
}

const data: Row[] = [{ id: 'r-1', name: 'Frozen' }]

const filler = (index: number): ColumnDef<Row> => ({
    id: `filler-${index}`,
    header: `Filler ${index}`,
    size: 200,
    cell: () => 'Lorem ipsum',
})

const columnsWith = (checkbox: JSX.Element): ColumnDef<Row>[] => [
    { accessorKey: 'name', header: 'Name', size: 200, fixedLeft: true },
    { id: 'with-checkbox', header: 'Checkbox', size: 200, cell: () => checkbox },
    ...[1, 2, 3, 4, 5, 6].map(filler),
]

describe.each([
    ['table', <StyledCheckbox key='table' dataTest='scrolling-checkbox' />],
    ['input (error)', <InputStyledCheckbox key='input' dataTest='scrolling-checkbox' error />],
] as const)('%s StyledCheckbox stacking', (_copy, checkbox) => {
    afterEach(cleanup)

    it('stays under a frozen column when it scrolls beneath it (ASMA-8338)', async () => {
        mount(
            <div style={{ width: 800 }}>
                <StyledTable locale='en' columns={columnsWith(checkbox)} data={data} uniqueKey='checkbox-stacking' />
            </div>,
        )

        const box = await waitFor(() => {
            const found = document.querySelector<HTMLElement>(
                '[data-test="scrolling-checkbox"] [class*="_Checkbox_"], [data-testid="scrolling-checkbox"] [class*="_Checkbox_"]',
            )
            if (!found) throw new Error('checkbox not rendered')
            return found
        })
        const frozen = document.querySelector<HTMLElement>('tr[id="r-1"] > td')!
        const scroller = box.closest<HTMLElement>('[class*="table-scroll"]')!

        // Slide the checkbox column left until the box sits under the middle of the frozen cell.
        const frozenRect = frozen.getBoundingClientRect()
        const boxRect = box.getBoundingClientRect()
        scroller.scrollLeft += boxRect.left - (frozenRect.left + frozenRect.width / 2)
        await waitFor(() => {
            const rect = box.getBoundingClientRect()
            if (rect.left > frozenRect.right || rect.right < frozenRect.left) throw new Error('box not under the frozen cell')
        })

        const rect = box.getBoundingClientRect()
        const topmost = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        await expect(frozen.contains(topmost), 'the scrolled checkbox paints over the frozen column').toBe(true)
    })
})
