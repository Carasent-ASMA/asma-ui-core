import { afterEach, describe, it } from 'vitest'
import { expect, fn, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { centreOf, fillOf, mouse } from 'src/test-utils/pressedInteraction'
import { StyledSelectItem } from './StyledSelectItem'

/**
 * ASMA-9003 — the select option row's pressed look. The row prevents the mousedown default to keep focus
 * on the trigger, which keeps Firefox from setting `:active`; the row therefore also holds the press as
 * `data-pressed` from pointer events, and drops it the moment the pointer leaves (pattern: cancel on
 * pointer-out). Also covers CountryCodeOptions, which renders this row.
 */

describe('StyledSelectItem pressed state (ASMA-9003)', () => {
    afterEach(cleanup)

    it('holds the pressed look from the pointer and drops it when the pointer leaves the row', async () => {
        const onClick = fn()
        const { container } = mount(
            <ul style={{ width: 240, margin: 40 }}>
                <StyledSelectItem selected onClick={onClick}>
                    Selected
                </StyledSelectItem>
            </ul>,
        )
        const row = container.querySelector<HTMLElement>('[role="option"]')!
        const check = row.querySelector('svg')!
        const gama200 = resolveTokenColor('--colors-gama-200')
        const gama700 = resolveTokenColor('--colors-gama-700')
        const restingFill = fillOf(row)
        const { x, y } = centreOf(row)

        await mouse('mouseMoved', { x, y })
        await mouse('mousePressed', { x, y })
        try {
            await expect(row).toHaveAttribute('data-pressed')
            await expect(fillOf(row)).toBe(gama200)
            await expect(getComputedStyle(row).color).toBe(gama700)
            await expect(getComputedStyle(check).color).toBe(gama700)

            // Drag off the row with the button still down: the press is cancelled at once…
            await mouse('mouseMoved', { x, y: y + 200 }, { held: true })
            await expect(row).not.toHaveAttribute('data-pressed')
            await waitFor(() => expect(fillOf(row)).toBe(restingFill))
        } finally {
            await mouse('mouseReleased', { x, y: y + 200 })
        }
        // …and releasing outside chooses nothing.
        await expect(onClick).not.toHaveBeenCalled()
    })

    it('paints the pressed look from `data-pressed` alone, as Firefox shows it', async () => {
        const { container } = mount(
            <ul>
                <StyledSelectItem selected>Selected</StyledSelectItem>
            </ul>,
        )
        const row = container.querySelector<HTMLElement>('[role="option"]')!
        row.setAttribute('data-pressed', '')

        await expect(fillOf(row)).toBe(resolveTokenColor('--colors-gama-200'))
        await expect(getComputedStyle(row).color).toBe(resolveTokenColor('--colors-gama-700'))
        await expect(getComputedStyle(row.querySelector('svg')!).color).toBe(resolveTokenColor('--colors-gama-700'))
        await expect(getComputedStyle(row).getPropertyValue('--control-pressed-accent').trim()).toBe(
            getComputedStyle(document.documentElement).getPropertyValue('--colors-gama-700').trim(),
        )
    })

    it('never marks a disabled row pressed', async () => {
        const { container } = mount(
            <ul>
                <StyledSelectItem disabled>Disabled</StyledSelectItem>
            </ul>,
        )
        const row = container.querySelector<HTMLElement>('[role="option"]')!
        const resting = fillOf(row)
        const { x, y } = centreOf(row)

        await mouse('mousePressed', { x, y })
        try {
            await expect(row).not.toHaveAttribute('data-pressed')
            await expect(fillOf(row)).toBe(resting)
        } finally {
            await mouse('mouseReleased', { x, y })
        }
    })
})
