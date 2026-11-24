import type { CSSProperties } from 'react'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, isEntirelyObscured, mount, parkPointer, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { mouse, settle, space, systemColor, transitionOf } from 'src/test-utils/pressedInteraction'
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
 * centred on the 40px target, so the 16px circle must paint above it; if the halo ever layers back
 * on top, the ring disappears under the disc on hover. Asserted through `elementFromPoint` (a
 * paint-order question), not a z-index read.
 */
describe('StyledRadio hover', () => {
    afterEach(cleanup)

    it('keeps the circle visible above the hover halo (ASMA-8338)', async () => {
        const { container } = mount(<RadioFixture />)
        const input = container.querySelector<HTMLInputElement>('input[type="radio"]:not([disabled])')!
        const wrapper = input.closest('label')!
        // The visual circle is the wrapper's last element child: `<input>`, the hover/pressed circle
        // span, then the svg.
        const circle = wrapper.lastElementChild as HTMLElement
        // Guard, so a DOM reshuffle cannot leave this green by measuring something else: the medium
        // circle is 16px (Figma Radiobutton).
        await expect(circle.getBoundingClientRect().width, 'the wrapper child under test is the 16px circle').toBe(16)

        await userEvent.hover(wrapper)

        await expect(isEntirelyObscured(circle), 'the hover halo entirely covers the radio circle').toBe(false)
    })
})

/** Master's (HEAD's) timing: the hover circle over 0.2s, the ring's colour over 0.3s, the dot's fade-in over 0.5s. */
const MASTER = {
    circle: { property: 'opacity, transform', duration: '0.2s, 0.2s', timing: 'ease, ease' },
    ring: { property: 'stroke', duration: '0.3s', timing: 'ease' },
    dot: { property: 'opacity', duration: '0.5s', timing: 'ease' },
}
/** After a press only (`data-press-released`): the circle fades at full size, the ring and dot colours ease back. */
const RELEASED = {
    circle: { property: 'opacity, background-color', duration: '0.15s, 0.15s', timing: 'ease-out, ease-out' },
    ring: { property: 'stroke', duration: '0.15s', timing: 'ease-out' },
    dot: { property: 'opacity, fill', duration: '0.5s, 0.15s', timing: 'ease, ease-out' },
}
const FULL_SIZE = 'matrix(1, 0, 0, 1, 0, 0)'

const timingOf = (wrapper: Element): typeof MASTER => {
    const [ring, dot] = Array.from(wrapper.querySelectorAll('circle'))
    return {
        circle: transitionOf(wrapper.querySelector('[class*="RadioCircle"]')!),
        ring: transitionOf(ring!),
        dot: transitionOf(dot!),
    }
}

const lookOf = (wrapper: Element): { circle: string; circleOpacity: string; ring: string; dot: string } => {
    const halo = getComputedStyle(wrapper.querySelector('[class*="RadioCircle"]')!)
    const [ring, dot] = Array.from(wrapper.querySelectorAll('circle')).map((circle) => getComputedStyle(circle))
    return { circle: halo.backgroundColor, circleOpacity: halo.opacity, ring: ring!.stroke, dot: dot!.fill }
}

const radioOf = (container: ParentNode, dataTest: string): Element => container.querySelector(`[data-testid="${dataTest}"]`)!

/**
 * ASMA-9003 (Figma Pressed state 47847:229830, pattern-pressed-state). The press ripple is gone: a
 * press turns the 40px circle gama-200 at once, above the delta-50 hover circle, and the ring and dot
 * gama-800; both ease back over 150 ms after the press only (`data-press-released`), while hover and
 * selection keep master's timing. Arrow-key moves never show it; disabled shows nothing. The mouse is
 * always released in `finally`, so a failure cannot leave it held.
 */
describe('StyledRadio pressed state (ASMA-9003)', () => {
    afterEach(async () => {
        await mouse('mouseReleased', { x: 0, y: 0 })
        await parkPointer()
        cleanup()
    })

    it('never appends a ripple, and a hovered press turns the circle gama-200 and the ring gama-800 at once', async () => {
        const gama200 = resolveTokenColor('--colors-gama-200')
        const gama800 = resolveTokenColor('--colors-gama-800')
        const { container } = mount(<RadioFixture />)
        const wrapper = radioOf(container, 'email')
        const circle = wrapper.lastElementChild as HTMLElement

        await mouse('mouseMoved', wrapper)
        await settle(300)
        await expect(lookOf(wrapper).circle, 'hovered: the delta-50 circle').toBe(resolveTokenColor('--colors-delta-50'))
        try {
            await mouse('mousePressed', wrapper)
            const pressed = lookOf(wrapper)
            await expect(pressed.circle, 'pressed wins over hover').toBe(gama200)
            await expect(pressed.circleOpacity).toBe('1')
            await expect(pressed.ring).toBe(gama800)
            await expect(getComputedStyle(wrapper.querySelector('circle')!).transitionDuration, 'no transition in').toBe('0s')
            await expect(isEntirelyObscured(circle), 'the pressed circle covers the radio').toBe(false)
            await expect(wrapper.querySelector('[class*="RadioCircle"]')!.childElementCount, 'no ripple').toBe(0)
        } finally {
            await mouse('mouseReleased', wrapper)
        }
        await expect(wrapper).toHaveAttribute('data-press-released', '')
        await expect(timingOf(wrapper), 'eases back').toEqual(RELEASED)
        await settle(300)
        await expect(lookOf(wrapper).ring, 'selected after release').toBe(resolveTokenColor('--colors-gama-500'))
    })

    it('turns a selected radio\'s dot gama-800 while pressed, and keeps it', async () => {
        const { container } = mount(<StyledRadio dataTest='r' checked />)
        const wrapper = radioOf(container, 'r')
        try {
            await mouse('mousePressed', wrapper)
            await expect(lookOf(wrapper).dot).toBe(resolveTokenColor('--colors-gama-800'))
            await expect(getComputedStyle(wrapper.querySelectorAll('circle')[1]!).opacity, 'the dot stays').toBe('1')
        } finally {
            await mouse('mouseReleased', wrapper)
        }
    })

    it('shows the pressed look when the option text of its label is pressed', async () => {
        const { container } = mount(<RadioFixture />)
        const text = [...container.querySelectorAll('label span')].find((el) => el.textContent === 'Post')!
        const wrapper = radioOf(container, 'post')
        try {
            await mouse('mousePressed', text)
            await expect(lookOf(wrapper).circle).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(lookOf(wrapper).ring).toBe(resolveTokenColor('--colors-gama-800'))
        } finally {
            await mouse('mouseReleased', text)
        }
    })

    it('shows the pressed look while Space is held, keeps the focus ring, and shows none on arrow-key moves', async () => {
        const { container } = mount(<RadioFixture />)
        const email = radioOf(container, 'email')
        const post = radioOf(container, 'post')
        const focusRing = resolveTokenColor('--colors-focus-ring')

        await userEvent.tab()
        try {
            await space('keyDown')
            await expect(lookOf(email).circle).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(lookOf(email).ring).toBe(resolveTokenColor('--colors-gama-800'))
            await expect(getComputedStyle(email.querySelector('svg')!).boxShadow).toContain(focusRing)
        } finally {
            await space('keyUp')
        }

        await userEvent.keyboard('{ArrowRight}')
        await expect(post.querySelector('input')).toBeChecked()
        await settle(300)
        await expect(lookOf(post).circleOpacity, 'an arrow-key move is not a press').toBe('0')
        await expect(lookOf(post).ring).toBe(resolveTokenColor('--colors-gama-500'))
        await expect(lookOf(post).dot).toBe(resolveTokenColor('--colors-gama-500'))
    })

    it('shows no pressed look when disabled, even when its label is pressed', async () => {
        const { container } = mount(<RadioFixture />)
        const text = [...container.querySelectorAll('label span')].find((el) => el.textContent === 'Phone')!
        const wrapper = radioOf(container, 'phone')
        const rest = lookOf(wrapper)
        try {
            await mouse('mousePressed', text)
            await expect(lookOf(wrapper)).toEqual(rest)
            await expect(rest.circleOpacity).toBe('0')
        } finally {
            await mouse('mouseReleased', text)
        }
    })

    it('never declares the pressed accent at rest, so a decorative radio takes a pressed parent\'s colour', async () => {
        const accent = 'rgb(1, 2, 3)'
        const { container } = mount(
            <>
                <StyledRadio dataTest='rest' checked />
                <div style={{ '--control-pressed-accent': accent } as CSSProperties}>
                    <StyledRadio dataTest='decorative' decorative checked />
                </div>
            </>,
        )

        await expect(getComputedStyle(radioOf(container, 'rest')).getPropertyValue('--control-pressed-accent')).toBe('')
        await expect(lookOf(radioOf(container, 'rest')).ring).toBe(resolveTokenColor('--colors-gama-500'))
        await expect(lookOf(radioOf(container, 'decorative')).ring).toBe(accent)
        await expect(lookOf(radioOf(container, 'decorative')).dot).toBe(accent)
    })

    it('shows no pressed look in a read-only group, even while Space is held (DIS-10)', async () => {
        const { container } = mount(
            <StyledRadioGroup aria-label='Delivery' name='ro' value='email' readOnly>
                <StyledFormControlLabel label='Email' control={<StyledRadio dataTest='email' value='email' />} />
                <StyledFormControlLabel label='Post' control={<StyledRadio dataTest='post' value='post' />} />
            </StyledRadioGroup>,
        )
        const email = radioOf(container, 'email')
        await expect(email.className, 'the group makes its radios read-only').toContain('ReadOnly')

        container.querySelector<HTMLInputElement>('input[value="email"]')!.focus()
        try {
            await space('keyDown')
            await expect(email).not.toHaveAttribute('data-pressed')
            await expect(lookOf(email).circleOpacity).toBe('0')
            await expect(lookOf(email).ring, 'Figma Read-only: checked ring delta-500').toBe(
                resolveTokenColor('--colors-delta-500'),
            )
        } finally {
            await space('keyUp')
        }
    })

    it('keeps the pressed look when a focused radio is pressed with the mouse (its mousedown blurs the input)', async () => {
        const { container } = mount(<RadioFixture />)
        const wrapper = radioOf(container, 'email')
        wrapper.querySelector('input')!.focus()
        try {
            await mouse('mousePressed', wrapper)
            await expect(wrapper).toHaveAttribute('data-pressed')
            await expect(lookOf(wrapper).circle).toBe(resolveTokenColor('--colors-gama-200'))
        } finally {
            await mouse('mouseReleased', wrapper)
        }
    })

    it('drops the pressed look as soon as the pointer is dragged off, never scaling the circle on a press', async () => {
        const { container } = mount(<RadioFixture />)
        const wrapper = radioOf(container, 'email')
        const circle = wrapper.querySelector('[class*="RadioCircle"]')!
        const rect = wrapper.getBoundingClientRect()
        try {
            await mouse('mouseMoved', wrapper)
            await mouse('mousePressed', wrapper)
            await expect(wrapper).toHaveAttribute('data-pressed')
            await expect(getComputedStyle(circle).transform, 'full size at once').toBe(FULL_SIZE)
            await mouse('mouseMoved', { x: rect.right + 200, y: rect.bottom + 200 }, { held: true })
            await expect(wrapper, 'leaving the radio cancels the press').not.toHaveAttribute('data-pressed')
            await settle(60)
            await expect(getComputedStyle(circle).transform, 'no shrink on the way out').toBe(FULL_SIZE)
        } finally {
            await mouse('mouseReleased', { x: rect.right + 200, y: rect.bottom + 200 })
        }
        await expect(wrapper.querySelector('input'), 'released outside: nothing selected').not.toBeChecked()
    })

    it('times hover in and out, and selection, as master', async () => {
        const { container } = mount(<RadioFixture />)
        const wrapper = radioOf(container, 'email')
        const circle = wrapper.querySelector('[class*="RadioCircle"]')!

        await expect(timingOf(wrapper), 'at rest').toEqual(MASTER)
        await expect(getComputedStyle(circle).transform, 'hidden at 70%').toBe('matrix(0.7, 0, 0, 0.7, 0, 0)')
        await mouse('mouseMoved', wrapper)
        await expect(timingOf(wrapper), 'hovered').toEqual(MASTER)
        await settle(300)
        await expect(getComputedStyle(circle).transform, 'grown to full size').toBe(FULL_SIZE)

        await mouse('mousePressed', wrapper)
        await mouse('mouseReleased', wrapper)
        await parkPointer()
        await expect(wrapper, 'the release marker goes with the pointer').not.toHaveAttribute('data-press-released')
        await expect(timingOf(wrapper), 'hover out after a press').toEqual(MASTER)
    })

    it('shows a Highlight ring in forced colours while pressed, with the focus ring kept', async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        try {
            const { container } = mount(<RadioFixture />)
            const email = radioOf(container, 'email')
            const circle = email.querySelector('[class*="RadioCircle"]')!
            await userEvent.tab()
            const focusRing = getComputedStyle(email.querySelector('svg')!).boxShadow
            await expect(getComputedStyle(circle).outlineStyle, 'no ring at rest').toBe('none')
            try {
                await space('keyDown')
                await expect(getComputedStyle(circle).outlineStyle).toBe('solid')
                await expect(getComputedStyle(circle).outlineColor).toBe(systemColor('Highlight'))
                await expect(getComputedStyle(email.querySelector('svg')!).boxShadow, 'the focus ring stays').toBe(focusRing)
            } finally {
                await space('keyUp')
            }
        } finally {
            await cdp().send('Emulation.setEmulatedMedia', { features: [] })
        }
    })
})
