import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, isEntirelyObscured, mount } from 'src/test-utils/renderInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledCheckbox as TableStyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
import { StyledCheckbox } from './StyledCheckbox'

const CheckboxFixture = ({ table = false }: { table?: boolean }): JSX.Element => {
    const [checked, setChecked] = useState(false)
    const Checkbox = table ? TableStyledCheckbox : StyledCheckbox
    return (
        <>
            <StyledFormControlLabel
                label='Receive updates'
                control={<Checkbox dataTest='checkbox' checked={checked} onChange={(_, next) => setChecked(next)} />}
            />
            <StyledFormControlLabel label='Unavailable' control={<Checkbox dataTest='disabled-checkbox' disabled />} />
        </>
    )
}

describe.each([
    ['input', false],
    ['table', true],
] as const)('%s StyledCheckbox keyboard contract', (_copy, table) => {
    afterEach(cleanup)

    it('is named by its visible label, reached by Tab, and toggled by Space (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<CheckboxFixture table={table} />)
        const checkbox = container.querySelector<HTMLInputElement>('input:not([disabled])')!

        await expect(checkbox).toHaveAccessibleName('Receive updates')
        await userEvent.tab()
        await expect(document.activeElement).toBe(checkbox)
        await userEvent.keyboard(' ')
        await expect(checkbox).toBeChecked()
    })

    it('skips disabled controls in the Tab order (2.1.1)', async () => {
        const { container } = mount(<CheckboxFixture table={table} />)
        const enabled = container.querySelector<HTMLInputElement>('input:not([disabled])')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(enabled)
        await userEvent.tab()
        await expect(document.activeElement).toBe(document.body)
    })
})

/**
 * ASMA-8338 hover regression. The hover halo is a 40px opaque (bg/hover-default delta-50) disc
 * centred on the 40px target, so it fully covers the 16px box; it must paint below the box, or an
 * unchecked box becomes a bare grey disc on hover and a checked one a white tick on a grey disc.
 * Asserted through `elementFromPoint` (a paint-order question), not a z-index read, so it fails if
 * the halo is ever layered back on top of the box — the bug this pinned.
 */
describe.each([
    ['input', false],
    ['table', true],
] as const)('%s StyledCheckbox hover', (_copy, table) => {
    afterEach(cleanup)

    it('keeps the box visible above the hover halo (ASMA-8338)', async () => {
        const { container } = mount(<CheckboxFixture table={table} />)
        const input = container.querySelector<HTMLInputElement>('input:not([disabled])')!
        const wrapper = input.closest('label')!
        // The visual box is the wrapper's last element child in both copies: `<input>`, then the
        // ripple container, then the box.
        const box = wrapper.lastElementChild as HTMLElement
        // Guard, so a DOM reshuffle cannot leave this green by measuring something else: the box
        // is the one Figma size both copies share.
        await expect(box.getBoundingClientRect().width, 'the wrapper child under test is the 16px box').toBe(16)

        await userEvent.hover(wrapper)

        await expect(isEntirelyObscured(box), 'the hover halo entirely covers the checkbox box').toBe(false)
    })
})

/**
 * ASMA-8338 press-ripple regression. The opaque hover halo is a `::after` painted after the ripple at
 * the same stacking level, so a hovered press animated invisibly underneath it. The ripple is frozen
 * at full size (its 400 ms grow-in starts at scale 0, which has no hit area) and probed at a point
 * inside the halo but outside the 16px box: the topmost element there must be the ripple itself, not
 * the element that owns the halo pseudo-element.
 */
describe.each([
    ['input', false],
    ['table', true],
] as const)('%s StyledCheckbox press ripple', (_copy, table) => {
    afterEach(cleanup)

    it('paints the press ripple above the hover halo (ASMA-8338)', async () => {
        const { container } = mount(<CheckboxFixture table={table} />)
        const input = container.querySelector<HTMLInputElement>('input:not([disabled])')!
        const wrapper = input.closest('label')!

        await userEvent.hover(wrapper)
        // Let the halo finish its 200 ms grow-in (scale 0.7 → 1) so the probe point is inside it.
        await new Promise((resolve) => setTimeout(resolve, 300))
        wrapper.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
        const ripple = wrapper.querySelector<HTMLElement>('[class*="RippleContainer"] > span')
        await expect(ripple, 'a press appends a ripple').not.toBeNull()
        ripple!.style.animation = 'none'
        ripple!.style.transform = 'translate(-50%, -50%) scale(1)'

        const rect = wrapper.getBoundingClientRect()
        // 8px below the top edge, horizontally centred: inside the 40px halo, above the 16px box
        // (which starts 12px down).
        const topmost = document.elementFromPoint(rect.left + rect.width / 2, rect.top + 8)
        await expect(topmost, 'the hover halo paints over the press ripple').toBe(ripple)
    })
})
