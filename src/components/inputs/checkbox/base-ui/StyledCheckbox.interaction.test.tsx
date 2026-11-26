import React, { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, isEntirelyObscured, mount, parkPointer, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { mouse, settle, space, systemColor, transitionOf } from 'src/test-utils/pressedInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledCheckbox } from './StyledCheckbox'

const CheckboxFixture = (): JSX.Element => {
    const [checked, setChecked] = useState(false)
    return (
        <>
            <StyledFormControlLabel
                label='Receive updates'
                control={<StyledCheckbox dataTest='checkbox' checked={checked} onChange={(_, next) => setChecked(next)} />}
            />
            <StyledFormControlLabel label='Unavailable' control={<StyledCheckbox dataTest='disabled-checkbox' disabled />} />
        </>
    )
}

describe('StyledCheckbox keyboard contract', () => {
    afterEach(cleanup)

    it('is named by its visible label, reached by Tab, and toggled by Space (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<CheckboxFixture />)
        const checkbox = container.querySelector<HTMLInputElement>('input:not([disabled])')!

        await expect(checkbox).toHaveAccessibleName('Receive updates')
        await userEvent.tab()
        await expect(document.activeElement).toBe(checkbox)
        await userEvent.keyboard(' ')
        await expect(checkbox).toBeChecked()
    })

    it('skips disabled controls in the Tab order (2.1.1)', async () => {
        const { container } = mount(<CheckboxFixture />)
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
describe('StyledCheckbox hover', () => {
    afterEach(cleanup)

    it('keeps the box visible above the hover halo (ASMA-8338)', async () => {
        const { container } = mount(<CheckboxFixture />)
        const input = container.querySelector<HTMLInputElement>('input:not([disabled])')!
        const wrapper = input.closest('label')!
        // The visual box is the wrapper's last element child in both copies: `<input>`, the circle,
        // then the box.
        const box = wrapper.lastElementChild as HTMLElement
        // Guard, so a DOM reshuffle cannot leave this green by measuring something else: the box
        // is the one Figma size both copies share.
        await expect(box.getBoundingClientRect().width, 'the wrapper child under test is the 16px box').toBe(16)

        await userEvent.hover(wrapper)

        await expect(isEntirelyObscured(box), 'the hover halo entirely covers the checkbox box').toBe(false)
    })
})

interface Look {
    circle: string
    circleOpacity: string
    edge: string
    fill: string
}

/** The hover/pressed circle span both copies render; `null` when the checkbox has no circle at all. */
const circleOf = (wrapper: Element): CSSStyleDeclaration | null => {
    const circle = wrapper.querySelector('[class*="CheckboxCircle"]')
    return circle && getComputedStyle(circle)
}

const boxElementOf = (wrapper: Element): Element => wrapper.querySelector('[class*="Checkbox_"], [class*="_Checkbox_"]')!

/** Master's (HEAD's) hover timing of the circle; the box has no transition there. */
const MASTER_CIRCLE = { property: 'opacity, transform', duration: '0.2s, 0.2s', timing: 'ease, ease' }
/** After a press only (`data-press-released`): the circle fades at full size, the box colours ease back. */
const RELEASED_CIRCLE = { property: 'opacity, background-color', duration: '0.15s, 0.15s', timing: 'ease-out, ease-out' }
const RELEASED_BOX = { property: 'background-color, border-color', duration: '0.15s, 0.15s', timing: 'ease-out, ease-out' }
const FULL_SIZE = 'matrix(1, 0, 0, 1, 0, 0)'

const pressedLookOf = (wrapper: Element): Look => {
    const box = getComputedStyle(boxElementOf(wrapper))
    const circle = circleOf(wrapper)
    return {
        circle: circle?.backgroundColor ?? 'none',
        circleOpacity: circle?.opacity ?? '0',
        edge: box.borderTopColor,
        fill: box.backgroundColor,
    }
}

const wrapperOf = (root: ParentNode, dataTest: string): Element =>
    root.querySelector(`[data-testid="${dataTest}"], [data-test="${dataTest}"]`)!

/** The keyboard focus indicator the checkbox draws: its frame. */
const focusIndicatorOf = (wrapper: Element): string => getComputedStyle(wrapper, '::before').backgroundColor

/**
 * ASMA-9003 (Figma Pressed state 47847:229830, pattern-pressed-state); the table uses this checkbox too
 * (ASMA-8137). The press ripple is gone: a
 * press turns the 40px circle gama-200 at once, above the delta-50 hover circle, and the box edge
 * (unchecked) or fill (checked) gama-800; both ease back over 150 ms after the press only
 * (`data-press-released`), while hover keeps master's timing. Disabled and read-only show nothing. The
 * mouse is always released in `finally`, so a failure cannot leave it held.
 */
describe('StyledCheckbox pressed state (ASMA-9003)', () => {

    afterEach(async () => {
        await mouse('mouseReleased', { x: 0, y: 0 })
        await parkPointer()
        cleanup()
    })

    it('never appends a ripple, and a hovered press turns the circle gama-200 and the edge gama-800 at once', async () => {
        const gama200 = resolveTokenColor('--colors-gama-200')
        const gama800 = resolveTokenColor('--colors-gama-800')
        const { container } = mount(<CheckboxFixture />)
        const wrapper = container.querySelector('input:not([disabled])')!.closest('label')!
        const box = wrapper.lastElementChild as HTMLElement
        const elementsAtRest = wrapper.querySelectorAll('*').length

        await mouse('mouseMoved', wrapper)
        await settle(300)
        await expect(pressedLookOf(wrapper).circle, 'hovered: the delta-50 circle').toBe(
            resolveTokenColor('--colors-delta-50'),
        )
        try {
            await mouse('mousePressed', wrapper)
            const pressed = pressedLookOf(wrapper)
            await expect(pressed.circle, 'pressed wins over hover').toBe(gama200)
            await expect(pressed.circleOpacity).toBe('1')
            await expect(pressed.edge, 'the unchecked box edge').toBe(gama800)
            await expect(circleOf(wrapper)!.transitionDuration, 'no transition into pressed').toMatch(/^0s(, 0s)*$/)
            await expect(isEntirelyObscured(box), 'the pressed circle covers the box').toBe(false)
            await expect(wrapper.querySelectorAll('*').length, 'a press adds no element (no ripple)').toBe(elementsAtRest)
        } finally {
            await mouse('mouseReleased', wrapper)
        }
        await expect(wrapper).toHaveAttribute('data-press-released', '')
        await expect(transitionOf(wrapper.querySelector('[class*="CheckboxCircle"]')!), 'the circle eases back').toEqual(RELEASED_CIRCLE)
        await expect(transitionOf(boxElementOf(wrapper)), 'the box eases back').toEqual(RELEASED_BOX)
        await settle(300)
        await expect(pressedLookOf(wrapper).circle, 'back to the hover circle').toBe(resolveTokenColor('--colors-delta-50'))
        await expect(container.querySelector('input:not([disabled])'), 'the press toggled it').toBeChecked()
    })

    it('fills a checked box gama-800 and keeps its white mark while pressed', async () => {
        const { container } = mount(<StyledCheckbox dataTest='c' checked onChange={() => undefined} />)
        const wrapper = wrapperOf(container, 'c')
        try {
            await mouse('mousePressed', wrapper)
            await expect(pressedLookOf(wrapper).fill).toBe(resolveTokenColor('--colors-gama-800'))
            await expect(getComputedStyle(wrapper.querySelector('[class*="Indicator"]')!).color).toBe('rgb(255, 255, 255)')
        } finally {
            await mouse('mouseReleased', wrapper)
        }
    })

    it('shows the pressed look when the option text of its label is pressed', async () => {
        mount(<StyledFormControlLabel label='Receive updates' control={<StyledCheckbox dataTest='c' />} />)
        const text = [...document.querySelectorAll('label span')].find((el) => el.textContent === 'Receive updates')!
        const wrapper = wrapperOf(document, 'c')
        try {
            await mouse('mousePressed', text)
            await expect(pressedLookOf(wrapper).circle).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(pressedLookOf(wrapper).edge).toBe(resolveTokenColor('--colors-gama-800'))
        } finally {
            await mouse('mouseReleased', text)
        }
        await expect(transitionOf(wrapper.querySelector('[class*="CheckboxCircle"]')!), 'eases back from the label too').toEqual(
            RELEASED_CIRCLE,
        )
    })

    it('shows the pressed look while Space is held, with the focus indicator still drawn', async () => {
        const { container } = mount(<CheckboxFixture />)
        const input = container.querySelector<HTMLInputElement>('input:not([disabled])')!
        const wrapper = input.closest('label')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(input)
        const focused = focusIndicatorOf(wrapper)
        try {
            await space('keyDown')
            await expect(pressedLookOf(wrapper).circle).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(pressedLookOf(wrapper).edge).toBe(resolveTokenColor('--colors-gama-800'))
            await expect(focusIndicatorOf(wrapper), 'the focus indicator').toBe(focused)
            await expect(focused).toBe(resolveTokenColor('--colors-focus-ring'))
        } finally {
            await space('keyUp')
        }
        await expect(input).toBeChecked()
    })

    it('shows no pressed look when disabled or read-only, even when its label is pressed', async () => {
        mount(
            <>
                <StyledFormControlLabel label='Off' control={<StyledCheckbox dataTest='disabled' disabled />} />
                <StyledFormControlLabel label='Fixed' control={<StyledCheckbox dataTest='ro' readOnly checked />} />
            </>,
        )
        for (const [label, dataTest] of [
            ['Off', 'disabled'],
            ['Fixed', 'ro'],
        ] as const) {
            const text = [...document.querySelectorAll('label span')].find((el) => el.textContent === label)!
            const wrapper = wrapperOf(document, dataTest)
            const rest = pressedLookOf(wrapper)
            try {
                await mouse('mousePressed', text)
                await expect(pressedLookOf(wrapper), `${dataTest} while pressed`).toEqual(rest)
                await expect(rest.circle, `${dataTest} has no circle`).toBe('none')
            } finally {
                await mouse('mouseReleased', text)
            }
        }
    })

    it('never declares the pressed accent at rest, so a decorative box takes a pressed parent\'s colour', async () => {
        const accent = 'rgb(1, 2, 3)'
        const { container } = mount(
            <>
                <StyledCheckbox dataTest='rest' />
                <div style={{ '--control-pressed-accent': accent } as React.CSSProperties}>
                    <StyledCheckbox dataTest='unchecked' decorative hideWrapper />
                    <StyledCheckbox dataTest='checked' decorative hideWrapper checked />
                </div>
            </>,
        )

        await expect(getComputedStyle(wrapperOf(container, 'rest')).getPropertyValue('--control-pressed-accent')).toBe('')
        await expect(pressedLookOf(wrapperOf(container, 'rest')).edge).toBe(resolveTokenColor('--colors-delta-500'))
        await expect(pressedLookOf(wrapperOf(container, 'unchecked')).edge).toBe(accent)
        await expect(pressedLookOf(wrapperOf(container, 'checked')).fill).toBe(accent)
    })

    it('keeps the pressed look when a focused checkbox is pressed with the mouse (its mousedown blurs the input)', async () => {
        const { container } = mount(<CheckboxFixture />)
        const input = container.querySelector<HTMLInputElement>('input:not([disabled])')!
        const wrapper = input.closest('label')!
        input.focus()
        try {
            await mouse('mousePressed', wrapper)
            await expect(wrapper).toHaveAttribute('data-pressed')
            await expect(pressedLookOf(wrapper).circle).toBe(resolveTokenColor('--colors-gama-200'))
        } finally {
            await mouse('mouseReleased', wrapper)
        }
        await expect(wrapper).not.toHaveAttribute('data-pressed')
    })

    it('drops the pressed look as soon as the pointer is dragged off, and toggles nothing', async () => {
        const { container } = mount(<CheckboxFixture />)
        const input = container.querySelector<HTMLInputElement>('input:not([disabled])')!
        const wrapper = input.closest('label')!
        const rect = wrapper.getBoundingClientRect()
        try {
            await mouse('mousePressed', wrapper)
            await expect(wrapper).toHaveAttribute('data-pressed')
            await mouse('mouseMoved', { x: rect.right + 200, y: rect.bottom + 200 }, { held: true })
            await expect(wrapper, 'leaving the checkbox cancels the press').not.toHaveAttribute('data-pressed')
            await expect(circleOf(wrapper)!.transform, 'it fades at full size').toBe(FULL_SIZE)
            await settle(300)
            await expect(pressedLookOf(wrapper).edge).toBe(resolveTokenColor('--colors-delta-500'))
            await expect(circleOf(wrapper)!.opacity, 'faded out').toBe('0')
        } finally {
            await mouse('mouseReleased', { x: rect.right + 200, y: rect.bottom + 200 })
        }
        await expect(input, 'released outside: nothing toggled').not.toBeChecked()
    })

    it('never scales on a press: full size at once while pressed and while it fades; hover keeps master\'s grow (criterion 2)', async () => {
        const { container } = mount(<CheckboxFixture />)
        const wrapper = container.querySelector('input:not([disabled])')!.closest('label')!
        const transforms: string[] = []

        transforms.push(circleOf(wrapper)!.transform)
        await mouse('mouseMoved', wrapper)
        await settle(300)
        transforms.push(circleOf(wrapper)!.transform)
        await parkPointer()
        await settle(300)
        await mouse('mouseMoved', wrapper)
        try {
            // Pressed in the middle of the hover grow: full size at once.
            await mouse('mousePressed', wrapper)
            transforms.push(circleOf(wrapper)!.transform)
        } finally {
            await mouse('mouseReleased', wrapper)
        }
        transforms.push(circleOf(wrapper)!.transform)

        await expect(transforms).toEqual(['matrix(0.7, 0, 0, 0.7, 0, 0)', FULL_SIZE, FULL_SIZE, FULL_SIZE])
    })

    it('times hover in and out as master: the circle over 0.2s, the box with none', async () => {
        const { container } = mount(<CheckboxFixture />)
        const wrapper = container.querySelector('input:not([disabled])')!.closest('label')!
        const circle = wrapper.querySelector('[class*="CheckboxCircle"]')!

        await expect(transitionOf(circle), 'at rest').toEqual(MASTER_CIRCLE)
        await expect(transitionOf(boxElementOf(wrapper)).duration, 'box at rest').toBe('0s')
        await mouse('mouseMoved', wrapper)
        await expect(transitionOf(circle), 'hovered').toEqual(MASTER_CIRCLE)
        await expect(transitionOf(boxElementOf(wrapper)).duration, 'box hovered').toBe('0s')

        await mouse('mousePressed', wrapper)
        await mouse('mouseReleased', wrapper)
        await parkPointer()
        await expect(wrapper, 'the release marker goes with the pointer').not.toHaveAttribute('data-press-released')
        await expect(transitionOf(circle), 'hover out after a press').toEqual(MASTER_CIRCLE)
        await expect(transitionOf(boxElementOf(wrapper)).duration).toBe('0s')
    })

    it('shows a Highlight ring in forced colours while pressed, with the focus indicator kept', async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        try {
            const { container } = mount(<CheckboxFixture />)
            const input = container.querySelector<HTMLInputElement>('input:not([disabled])')!
            const wrapper = input.closest('label')!
            await userEvent.tab()
            const focused = focusIndicatorOf(wrapper)
            await expect(circleOf(wrapper)!.outlineStyle, 'no ring at rest').toBe('none')
            try {
                await space('keyDown')
                await expect(circleOf(wrapper)!.outlineStyle).toBe('solid')
                await expect(circleOf(wrapper)!.outlineColor).toBe(systemColor('Highlight'))
                await expect(focusIndicatorOf(wrapper), 'the focus indicator stays').toBe(focused)
            } finally {
                await space('keyUp')
            }
        } finally {
            await cdp().send('Emulation.setEmulatedMedia', { features: [] })
        }
    })
})

describe('StyledCheckbox read-only state (Figma State=Read only)', () => {
    afterEach(cleanup)

    const indicatorColor = (container: HTMLElement, dataTest: string): string => {
        const wrapper = container.querySelector<HTMLElement>(`[data-testid="${dataTest}"]`)!
        const indicator = wrapper.querySelector<HTMLElement>('[class*="Indicator"]')!
        return getComputedStyle(indicator).color
    }

    it('keeps an unchecked box empty and marks a checked one', async () => {
        const { container } = mount(
            <>
                <StyledCheckbox dataTest='unchecked' readOnly checked={false} />
                <StyledCheckbox dataTest='checked' readOnly checked />
            </>,
        )

        const box = (dataTest: string): CSSStyleDeclaration =>
            getComputedStyle(
                container
                    .querySelector(`[data-testid="${dataTest}"]`)!
                    .querySelector<HTMLElement>('[class*="Checkbox_"], [class*="_Checkbox_"]')!,
            )

        await expect(indicatorColor(container, 'unchecked')).toBe('rgba(0, 0, 0, 0)')
        await expect(indicatorColor(container, 'checked')).toBe('rgb(98, 110, 126)')
        await expect(box('unchecked').borderTopColor).toBe('rgb(189, 196, 207)')
        await expect(box('checked').borderTopColor).toBe('rgb(98, 110, 126)')
    })
})
