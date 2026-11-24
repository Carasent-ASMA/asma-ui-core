import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount, parkPointer, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { mouse, space, systemColor, transitionOf } from 'src/test-utils/pressedInteraction'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledSwitch } from './StyledSwitch'

const SwitchFixture = (): JSX.Element => {
    const [checked, setChecked] = useState(false)
    return (
        <>
            <StyledFormControlLabel
                label='Enable notifications'
                control={<StyledSwitch dataTest='notifications' checked={checked} onChange={(_, next) => setChecked(next)} />}
            />
            <StyledFormControlLabel label='Unavailable' control={<StyledSwitch dataTest='disabled-switch' disabled />} />
        </>
    )
}

describe('StyledSwitch keyboard contract', () => {
    afterEach(cleanup)

    it('is named by its visible label, reached by Tab, and toggled by Space (2.1.1, 4.1.2)', async () => {
        const { container } = mount(<SwitchFixture />)
        const control = container.querySelector<HTMLButtonElement>('[data-testid="notifications"]')!

        await expect(control).toHaveAccessibleName('Enable notifications')
        await userEvent.tab()
        await expect(document.activeElement).toBe(control)
        await userEvent.keyboard(' ')
        await expect(control).toHaveAttribute('aria-checked', 'true')
    })

    it('skips disabled controls in the Tab order (2.1.1)', async () => {
        const { container } = mount(
            <>
                <StyledFormControlLabel label='Unavailable' control={<StyledSwitch dataTest='disabled-switch' disabled />} />
                <button type='button'>After</button>
            </>,
        )

        await userEvent.tab()
        await expect(document.activeElement).toBe(
            Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'After'),
        )
    })
})

/** Master's (HEAD's) timing of the track and the knob's dash/check, at rest and on hover. */
const MASTER = {
    track: { property: 'background-color', duration: '0.3s', timing: 'ease' },
    icon: { property: 'color', duration: '0.3s', timing: 'ease' },
}
/** After a press only (`data-press-released`): both ease back over 150ms. */
const RELEASED = {
    track: { property: 'background-color', duration: '0.15s', timing: 'ease-out' },
    icon: { property: 'color', duration: '0.15s', timing: 'ease-out' },
}

const timingOf = (control: Element): typeof MASTER => ({
    track: transitionOf(control),
    icon: transitionOf(control.querySelector('[class*="iconContent"]')!),
})

const lookOf = (control: Element): { track: string; knob: string; knobX: number; icon: string } => {
    const knob = control.firstElementChild!
    return {
        track: getComputedStyle(control).backgroundColor,
        knob: getComputedStyle(knob).backgroundColor,
        knobX: knob.getBoundingClientRect().left,
        icon: getComputedStyle(control.querySelector('svg')!).color,
    }
}

/**
 * ASMA-9003 (Figma Pressed state 47847:229830, pattern-pressed-state). A press turns the track
 * gama-800 in both states, at once and over the hover colour; the knob keeps its fill and place and
 * its dash/check turns gama-700. Both ease back over 150 ms after the press only
 * (`data-press-released`); hover and toggling keep master's timing. Disabled and read-only show
 * nothing. The mouse is always released in `finally`, so a failure cannot leave it held.
 */
describe('StyledSwitch pressed state (ASMA-9003)', () => {
    afterEach(async () => {
        await mouse('mouseReleased', { x: 0, y: 0 })
        await parkPointer()
        cleanup()
    })

    it.each([
        ['off', false],
        ['on', true],
    ] as const)('%s: a press turns the track gama-800 and the knob icon gama-700, instantly', async (_state, checked) => {
        const { container } = mount(<StyledSwitch dataTest='s' aria-label='Switch' defaultChecked={checked} />)
        const control = container.querySelector('[data-testid="s"]')!
        const rest = lookOf(control)

        try {
            await mouse('mousePressed', control)
            const pressed = lookOf(control)
            await expect(pressed.track).toBe(resolveTokenColor('--colors-gama-800'))
            await expect(pressed.icon).toBe(resolveTokenColor('--colors-gama-700'))
            await expect(pressed.knob, 'the knob keeps its fill (Figma: delta-10 off, white on)').toBe(rest.knob)
            await expect(pressed.knobX, 'the knob keeps its position').toBe(rest.knobX)
            await expect(getComputedStyle(control).transitionDuration, 'no transition into pressed').toBe('0s')
            await expect(getComputedStyle(control).opacity).toBe('1')
        } finally {
            await mouse('mouseReleased', control)
        }
        await expect(control).toHaveAttribute('aria-checked', String(!checked))
        await expect(control).toHaveAttribute('data-press-released', '')
        await expect(timingOf(control), 'eases back').toEqual(RELEASED)
    })

    it('times hover in and out as master: the track and its dash/check over 0.3s', async () => {
        const { container } = mount(<StyledSwitch dataTest='s' aria-label='Switch' />)
        const control = container.querySelector('[data-testid="s"]')!

        await expect(timingOf(control), 'at rest').toEqual(MASTER)
        await mouse('mouseMoved', control)
        await expect(timingOf(control), 'hovered').toEqual(MASTER)

        await mouse('mousePressed', control)
        await mouse('mouseReleased', control)
        await parkPointer()
        await expect(control, 'the release marker goes with the pointer').not.toHaveAttribute('data-press-released')
        await expect(timingOf(control), 'hover out after a press').toEqual(MASTER)
    })

    it('shows the pressed track while Space is held, with the focus ring still drawn', async () => {
        const { container } = mount(<SwitchFixture />)
        const control = container.querySelector<HTMLElement>('[data-testid="notifications"]')!

        await userEvent.tab()
        await expect(document.activeElement).toBe(control)
        try {
            await space('keyDown')
            await expect(lookOf(control).track).toBe(resolveTokenColor('--colors-gama-800'))
            await expect(getComputedStyle(control, '::before').outlineColor).toBe(resolveTokenColor('--colors-focus-ring'))
        } finally {
            await space('keyUp')
        }
        await expect(control).toHaveAttribute('aria-checked', 'true')
    })

    it('shows no pressed look when disabled or read-only, even when its label is pressed', async () => {
        mount(
            <>
                <StyledFormControlLabel label='Off' control={<StyledSwitch dataTest='disabled' disabled />} />
                <StyledFormControlLabel label='Fixed' control={<StyledSwitch dataTest='ro' readOnly defaultChecked />} />
            </>,
        )
        for (const [label, dataTest] of [
            ['Off', 'disabled'],
            ['Fixed', 'ro'],
        ] as const) {
            const control = document.querySelector(`[data-testid="${dataTest}"]`)!
            const text = [...document.querySelectorAll('label span')].find((el) => el.textContent === label)!
            const rest = lookOf(control)
            for (const target of [text, control]) {
                try {
                    await mouse('mousePressed', target)
                    await expect(lookOf(control), `${dataTest} while pressed`).toEqual(rest)
                } finally {
                    await mouse('mouseReleased', target)
                }
            }
        }
    })
})

describe('StyledSwitch pressed state, more (ASMA-9003)', () => {
    afterEach(async () => {
        await mouse('mouseReleased', { x: 0, y: 0 })
        await cdp().send('Emulation.setEmulatedMedia', { features: [] })
        await parkPointer()
        cleanup()
    })

    it('drops the pressed track as soon as the pointer is dragged off, and toggles nothing', async () => {
        const { container } = mount(<StyledSwitch dataTest='s' aria-label='Switch' />)
        const control = container.querySelector('[data-testid="s"]')!
        const rect = control.getBoundingClientRect()
        await mouse('mousePressed', control)
        await expect(control).toHaveAttribute('data-pressed')
        await mouse('mouseMoved', { x: rect.right + 200, y: rect.bottom + 200 }, { held: true })
        await expect(control, 'leaving the switch cancels the press').not.toHaveAttribute('data-pressed')
        await expect(timingOf(control), 'eases back from a drag-off').toEqual(RELEASED)
        await mouse('mouseReleased', { x: rect.right + 200, y: rect.bottom + 200 })
        await expect(control).toHaveAttribute('aria-checked', 'false')
    })

    it('presses the switch when its label text is pressed', async () => {
        mount(<StyledFormControlLabel label='Notify' control={<StyledSwitch dataTest='s' />} />)
        const control = document.querySelector('[data-testid="s"]')!
        const text = [...document.querySelectorAll('label span')].find((el) => el.textContent === 'Notify')!
        try {
            await mouse('mousePressed', text)
            await expect(lookOf(control).track).toBe(resolveTokenColor('--colors-gama-800'))
        } finally {
            await mouse('mouseReleased', text)
        }
        await expect(timingOf(control), 'eases back from the label too').toEqual(RELEASED)
    })

    it('shows a Highlight outline in forced colours while pressed, with the focus ring kept', async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        const { container } = mount(<SwitchFixture />)
        const control = container.querySelector<HTMLElement>('[data-testid="notifications"]')!
        await userEvent.tab()
        const ring = getComputedStyle(control, '::before').outlineStyle
        await expect(getComputedStyle(control).outlineStyle, 'no press outline at rest').toBe('none')
        try {
            await space('keyDown')
            await expect(getComputedStyle(control).outlineColor).toBe(systemColor('Highlight'))
            await expect(getComputedStyle(control, '::before').outlineStyle, 'the focus ring stays').toBe(ring)
        } finally {
            await space('keyUp')
        }
    })

    it('draws the Figma knob and icon colours: off knob delta-10, disabled and read-only icons', async () => {
        const { container } = mount(
            <>
                <StyledSwitch dataTest='off' aria-label='Off' />
                <StyledSwitch dataTest='on' aria-label='On' defaultChecked />
                <StyledSwitch dataTest='disabled-off' aria-label='Disabled off' disabled />
                <StyledSwitch dataTest='disabled-on' aria-label='Disabled on' disabled defaultChecked />
                <StyledSwitch dataTest='ro-off' aria-label='Read-only off' readOnly />
            </>,
        )
        const at = (dataTest: string) => lookOf(container.querySelector(`[data-testid="${dataTest}"]`)!)

        await expect(at('off').knob).toBe(resolveTokenColor('--colors-delta-10'))
        await expect(at('on').knob).toBe('rgb(255, 255, 255)')
        await expect(at('disabled-off').icon).toBe(resolveTokenColor('--colors-delta-300'))
        await expect(at('disabled-on').icon).toBe(resolveTokenColor('--colors-gama-300'))
        await expect(at('ro-off').knob, 'read-only knob stays white').toBe('rgb(255, 255, 255)')
        await expect(at('ro-off').icon).toBe(resolveTokenColor('--colors-delta-600'))
    })
})
