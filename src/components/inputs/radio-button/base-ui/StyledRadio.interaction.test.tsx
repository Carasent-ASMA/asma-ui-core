import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, isEntirelyObscured, mount } from 'src/test-utils/renderInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledRadio } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'

const RadioFixture = (): JSX.Element => (
    <>
        {/* The question text lives outside the group, exactly as the questionnaire renderer puts it. */}
        <h2 id='delivery-method-question'>Delivery method</h2>
        <StyledRadioGroup
            aria-labelledby='delivery-method-question'
            dataTest='delivery-method'
            error
            errorText='Choose one method'
            name='delivery-method'
        >
            <StyledFormControlLabel label='Email' control={<StyledRadio dataTest='email' value='email' />} />
            <StyledFormControlLabel label='Post' control={<StyledRadio dataTest='post' value='post' />} />
            <StyledFormControlLabel label='Phone' control={<StyledRadio dataTest='phone' value='phone' disabled />} />
        </StyledRadioGroup>
        <button type='button'>After radios</button>
    </>
)

describe('StyledRadioGroup keyboard contract', () => {
    afterEach(cleanup)

    it('uses one tab stop and wrapping arrow navigation over enabled radios (2.1.1)', async () => {
        const { container } = mount(<RadioFixture />)
        const [email, post, phone] = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
        const group = container.querySelector<HTMLElement>('[role="radiogroup"]')!

        // Pins the naming route the editor relies on (A-15): the group takes its name from the
        // visible question heading through `aria-labelledby`, with no label of its own.
        await expect(group).toHaveAccessibleName('Delivery method')
        await expect(group).toHaveAttribute('aria-describedby')
        await expect(document.getElementById(group.getAttribute('aria-describedby')!)).toHaveTextContent('Choose one method')
        await expect(email).toHaveAccessibleName('Email')
        await expect(phone).toBeDisabled()

        await userEvent.tab()
        await expect(document.activeElement).toBe(email)
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(post)
        await expect(post).toBeChecked()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(email)
        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelector('button'))
    })
})

/**
 * ASMA-8338 hover regression. The hover halo is a 40px opaque (bg/hover-default delta-50) disc
 * centred on the 40px target, so the 20px circle must paint above it; if the halo ever layers back
 * on top, the ring disappears under the disc on hover. Asserted through `elementFromPoint` (a
 * paint-order question), not a z-index read.
 */
describe('StyledRadio hover', () => {
    afterEach(cleanup)

    it('keeps the circle visible above the hover halo (ASMA-8338)', async () => {
        const { container } = mount(<RadioFixture />)
        const input = container.querySelector<HTMLInputElement>('input[type="radio"]:not([disabled])')!
        const wrapper = input.closest('label')!
        // The visual circle is the wrapper's last element child: `<input>`, then the ripple
        // container, then the circle.
        const circle = wrapper.lastElementChild as HTMLElement
        // Guard, so a DOM reshuffle cannot leave this green by measuring something else: the medium
        // circle is 20px (Figma Radio).
        await expect(circle.getBoundingClientRect().width, 'the wrapper child under test is the 20px circle').toBe(20)

        await userEvent.hover(wrapper)

        await expect(isEntirelyObscured(circle), 'the hover halo entirely covers the radio circle').toBe(false)
    })
})

/**
 * ASMA-8338 press-ripple regression. The opaque hover halo is a `::after` painted after the ripple
 * at the same stacking level, so a hovered press animated invisibly underneath it; the radio copy
 * had the same structure and the same defect. The ripple is frozen at full size (its 400 ms
 * grow-in starts at scale 0, which has no hit area) and probed at a point inside the halo but
 * outside the 20px circle: the topmost element there must be the ripple itself, not the element
 * that owns the halo pseudo-element.
 */
describe('StyledRadio press ripple', () => {
    afterEach(cleanup)

    it('paints the press ripple above the hover halo (ASMA-8338)', async () => {
        const { container } = mount(<RadioFixture />)
        const input = container.querySelector<HTMLInputElement>('input[type="radio"]:not([disabled])')!
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
        // 8px below the top edge, horizontally centred: inside the 40px halo, above the 20px circle
        // (which starts 10px down).
        const topmost = document.elementFromPoint(rect.left + rect.width / 2, rect.top + 8)
        await expect(topmost, 'the hover halo paints over the press ripple').toBe(ripple)
    })
})
