import { afterEach, describe, it } from 'vitest'
import { useState } from 'react'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { DynamicToolbar } from './DynamicToolbar'

/** A filter that keeps its panel's open state locally, like the Pathfinders filter. */
const FilterWithPanel = (): JSX.Element => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <button type='button' onClick={() => setOpen(true)}>
                Filter
            </button>
            {open && <input aria-label='Filter value' />}
        </>
    )
}

const Toolbar = ({ width }: { width: number }): JSX.Element => (
    <div style={{ width }}>
        <DynamicToolbar title='Pathfinders' filter={<FilterWithPanel />} search={<input aria-label='Search' />} />
    </div>
)

const layout = (): string | null => document.querySelector('[data-testid="dynamic-toolbar"]')!.getAttribute('data-layout')
const filterField = (): HTMLInputElement | null => document.querySelector('input[aria-label="Filter value"]')

describe('DynamicToolbar filter slot (ASMA-8470)', () => {
    afterEach(cleanup)

    it('keeps the filter mounted, its panel open and focused, when the toolbar changes layout', async () => {
        const { rerender } = mount(<Toolbar width={1100} />)
        await waitFor(() => expect(layout()).toBe('inline'))

        await userEvent.click(Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'Filter')!)
        await userEvent.click(filterField()!)
        await userEvent.keyboard('abc')

        rerender(<Toolbar width={480} />)
        await waitFor(() => expect(layout()).not.toBe('inline'))

        await expect(filterField()).not.toBeNull()
        await expect(filterField()!.value).toBe('abc')
        await expect(document.activeElement).toBe(filterField())

        rerender(<Toolbar width={1100} />)
        await waitFor(() => expect(layout()).toBe('inline'))
        await expect(filterField()!.value).toBe('abc')
        await expect(document.activeElement).toBe(filterField())
    })
})
