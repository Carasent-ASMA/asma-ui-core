import type { ReactNode } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { centreOf, holdPressed, key, mouse, space } from 'src/test-utils/pressedInteraction'
import { composeHandlers, pressedStateHandlers, withPressedState } from './pressedState'

/** ASMA-9003 — the one pressed mechanism: `data-pressed` held by pointer and (opt-in) Space. Real Chromium. */

const Probe = ({
    enabled = true,
    keyboard = false,
    children = 'Probe',
}: {
    enabled?: boolean
    keyboard?: boolean
    children?: ReactNode
}): JSX.Element => (
    <div
        data-testid='probe'
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a bare probe for the handlers
        tabIndex={0}
        style={{ width: 200, height: 40, margin: 40 }}
        {...pressedStateHandlers({ enabled, keyboard })}
    >
        {children}
    </div>
)

const probe = (): HTMLElement => document.querySelector<HTMLElement>('[data-testid="probe"]')!

describe('pressedStateHandlers — pointer', () => {
    afterEach(cleanup)

    it('holds data-pressed from a primary press until release, and drops it on drag-off', async () => {
        mount(<Probe />)
        const at = centreOf(probe())

        await mouse('mousePressed', at)
        await expect(probe()).toHaveAttribute('data-pressed')
        await mouse('mouseReleased', at)
        await expect(probe()).not.toHaveAttribute('data-pressed')

        await mouse('mousePressed', at)
        await expect(probe()).toHaveAttribute('data-pressed')
        await mouse('mouseMoved', { x: at.x + 400, y: at.y + 300 }, { held: true })
        await expect(probe()).not.toHaveAttribute('data-pressed')
        await mouse('mouseReleased', { x: at.x + 400, y: at.y + 300 })
    })

    it('ignores a secondary-button press', async () => {
        mount(<Probe />)
        const at = centreOf(probe())
        await mouse('mousePressed', at, { button: 'right' })
        try {
            await expect(probe()).not.toHaveAttribute('data-pressed')
        } finally {
            await mouse('mouseReleased', at, { button: 'right' })
        }
    })

    it('does not press the owner when the press starts in a nested control (CARD-15)', async () => {
        mount(
            <Probe>
                <button type='button' data-testid='nested'>
                    Delete
                </button>
            </Probe>,
        )
        const at = centreOf(document.querySelector('[data-testid="nested"]')!)
        await mouse('mousePressed', at)
        try {
            await expect(probe()).not.toHaveAttribute('data-pressed')
        } finally {
            await mouse('mouseReleased', at)
        }
    })

    it("presses a label from its own checkbox input, but not from another control's", async () => {
        mount(
            <label data-testid='label' style={{ display: 'block', margin: 40 }} {...pressedStateHandlers({ enabled: true })}>
                <input type='checkbox' data-testid='own' />
                Option
                <button type='button' data-testid='other'>
                    Info
                </button>
            </label>,
        )
        const label = document.querySelector<HTMLElement>('[data-testid="label"]')!

        const own = centreOf(document.querySelector('[data-testid="own"]')!)
        await mouse('mousePressed', own)
        await expect(label).toHaveAttribute('data-pressed')
        await mouse('mouseReleased', own)

        const other = centreOf(document.querySelector('[data-testid="other"]')!)
        await mouse('mousePressed', other)
        try {
            await expect(label).not.toHaveAttribute('data-pressed')
        } finally {
            await mouse('mouseReleased', other)
        }
    })

    it('keeps a mouse press on a label whose input already has focus until release', async () => {
        // Regression (SWE-B, live on base-ui-checkbox--interactive): the label's mousedown default moves
        // focus off the focused input; that focusout bubbles to the label and must not end a pointer press.
        mount(
            <label data-testid='label' style={{ display: 'block', margin: 40 }} {...pressedStateHandlers({ enabled: true, keyboard: true })}>
                <input type='checkbox' data-testid='own' />
                <span data-testid='text'>Option text</span>
            </label>,
        )
        const label = document.querySelector<HTMLElement>('[data-testid="label"]')!
        const input = document.querySelector<HTMLInputElement>('[data-testid="own"]')!
        input.focus()
        await expect(document.activeElement).toBe(input)

        const at = centreOf(document.querySelector('[data-testid="text"]')!)
        await mouse('mouseMoved', at)
        await mouse('mousePressed', at)
        try {
            await expect(label).toHaveAttribute('data-pressed', '')
        } finally {
            await mouse('mouseReleased', at)
        }
        await expect(label).not.toHaveAttribute('data-pressed')
    })

    it('does not press a row from a real checkbox nested in it (review #13)', async () => {
        mount(
            <Probe>
                <label data-testid='nested-checkbox'>
                    <input type='checkbox' />
                    Nested
                </label>
                <span data-testid='row-text'>Row text</span>
            </Probe>,
        )
        for (const testId of ['nested-checkbox', 'row-text'] as const) {
            const at = centreOf(document.querySelector(`[data-testid="${testId}"]`)!)
            await mouse('mousePressed', at)
            try {
                if (testId === 'row-text') await expect(probe()).toHaveAttribute('data-pressed', '')
                else await expect(probe()).not.toHaveAttribute('data-pressed')
            } finally {
                await mouse('mouseReleased', at)
            }
        }
    })

    it('restores the press when the pointer comes back while still held, and not after release (review #8)', async () => {
        mount(
            <>
                <Probe />
                <div data-testid='elsewhere' style={{ width: 200, height: 40, margin: 40 }} />
            </>,
        )
        const at = centreOf(probe())
        const away = centreOf(document.querySelector('[data-testid="elsewhere"]')!)

        await mouse('mousePressed', at)
        await mouse('mouseMoved', away, { held: true })
        await expect(probe()).not.toHaveAttribute('data-pressed')
        await mouse('mouseMoved', at, { held: true })
        await expect(probe()).toHaveAttribute('data-pressed', '')
        await mouse('mouseReleased', at)
        await expect(probe()).not.toHaveAttribute('data-pressed')

        // A press released elsewhere is over: passing back with no button held restores nothing.
        await mouse('mousePressed', at)
        await mouse('mouseMoved', away, { held: true })
        await mouse('mouseReleased', away)
        await mouse('mouseMoved', at)
        await expect(probe()).not.toHaveAttribute('data-pressed')
    })

    it('restores the press of a control nested in another owner (SWE-B: a switch in a form label)', async () => {
        mount(
            <>
                <div data-testid='outer' style={{ margin: 40, padding: 8 }} {...pressedStateHandlers({ enabled: true })}>
                    <button
                        type='button'
                        data-testid='inner'
                        style={{ width: 120, height: 32 }}
                        {...pressedStateHandlers({ enabled: true, keyboard: true })}
                    >
                        Inner
                    </button>
                </div>
                <div data-testid='elsewhere' style={{ width: 200, height: 40, margin: 40 }} />
            </>,
        )
        const inner = document.querySelector<HTMLElement>('[data-testid="inner"]')!
        const at = centreOf(inner)
        const away = centreOf(document.querySelector('[data-testid="elsewhere"]')!)

        await mouse('mousePressed', at)
        try {
            await expect(inner).toHaveAttribute('data-pressed', '')
            await expect(document.querySelector('[data-testid="outer"]')).not.toHaveAttribute('data-pressed')
            await mouse('mouseMoved', away, { held: true })
            await expect(inner).not.toHaveAttribute('data-pressed')
            await mouse('mouseMoved', at, { held: true })
            await expect(inner).toHaveAttribute('data-pressed', '')
        } finally {
            await mouse('mouseReleased', at)
        }
    })

    it('never sets it while disabled, and still ends a press that began before the control turned disabled', async () => {
        const { rerender } = mount(<Probe enabled={false} />)
        const at = centreOf(probe())

        await mouse('mousePressed', at)
        await expect(probe()).not.toHaveAttribute('data-pressed')
        await mouse('mouseReleased', at)

        // A press that began while enabled, then the control turned disabled (or busy) mid-press.
        rerender(<Probe />)
        await mouse('mousePressed', at)
        await expect(probe()).toHaveAttribute('data-pressed', '')
        rerender(<Probe enabled={false} />)
        await mouse('mouseReleased', at)
        await expect(probe()).not.toHaveAttribute('data-pressed')
    })

    it("never removes a data-pressed or release marker it did not set (the Card's own hold)", async () => {
        mount(<Probe />)
        const at = centreOf(probe())
        // Another mechanism (e.g. Card's usePressedHold) owns these attributes on the same element.
        probe().setAttribute('data-pressed', '')
        probe().setAttribute('data-press-released', '')

        await mouse('mouseMoved', at)
        await mouse('mouseMoved', { x: at.x + 400, y: at.y + 300 })
        await mouse('mouseMoved', at)
        await expect(probe()).toHaveAttribute('data-pressed', '')
        await expect(probe()).toHaveAttribute('data-press-released', '')
        window.dispatchEvent(new FocusEvent('blur'))
        await expect(probe()).toHaveAttribute('data-pressed', '')
    })
})

describe('pressedStateHandlers — keyboard', () => {
    afterEach(cleanup)

    it('holds data-pressed while Space is held; keyup and blur clear it', async () => {
        mount(<Probe keyboard />)
        probe().focus()

        await key('keyDown', ' ')
        await expect(probe()).toHaveAttribute('data-pressed', 'key')
        await key('keyUp', ' ')
        await expect(probe()).not.toHaveAttribute('data-pressed')

        await key('keyDown', ' ')
        await expect(probe()).toHaveAttribute('data-pressed', 'key')
        probe().blur()
        await expect(probe()).not.toHaveAttribute('data-pressed')
        await key('keyUp', ' ')
    })

    it('never sets it for Enter, the arrow keys or a repeat', async () => {
        mount(<Probe keyboard />)
        probe().focus()

        for (const name of ['Enter', 'ArrowDown'] as const) {
            await key('keyDown', name)
            await expect(probe(), name).not.toHaveAttribute('data-pressed')
            await key('keyUp', name)
        }
        // An auto-repeat keydown alone (its first keydown went elsewhere) does not press.
        await key('keyDown', ' ', { repeat: true })
        await expect(probe()).not.toHaveAttribute('data-pressed')
        await key('keyUp', ' ')
    })

    it('keeps a Space press while the pointer passes over and off (review #1)', async () => {
        mount(
            <>
                <Probe keyboard />
                <div data-testid='elsewhere' style={{ width: 200, height: 40, margin: 40 }} />
            </>,
        )
        probe().focus()
        await key('keyDown', ' ')
        const over = centreOf(probe())
        const away = centreOf(document.querySelector('[data-testid="elsewhere"]')!)
        await mouse('mouseMoved', over)
        await mouse('mouseMoved', away)
        try {
            await expect(probe()).toHaveAttribute('data-pressed', 'key')
        } finally {
            await key('keyUp', ' ')
        }
        await expect(probe()).not.toHaveAttribute('data-pressed')
    })

    it('leaves Space alone unless keyboard is on', async () => {
        mount(<Probe />)
        probe().focus()
        await key('keyDown', ' ')
        try {
            await expect(probe()).not.toHaveAttribute('data-pressed')
        } finally {
            await key('keyUp', ' ')
        }
    })
})

describe('withPressedState', () => {
    afterEach(cleanup)

    it("composes the consumer's handlers before the pressed-state ones", async () => {
        const calls: string[] = []
        const onPointerDown = fn(() => calls.push(`consumer:${probe().getAttribute('data-pressed') ?? 'none'}`))
        const onKeyUp = fn()
        mount(
            <div
                data-testid='probe'
                style={{ width: 200, height: 40, margin: 40 }}
                {...withPressedState({ onPointerDown, onKeyUp }, { enabled: true })}
            />,
        )
        const at = centreOf(probe())
        await mouse('mousePressed', at)
        try {
            // The consumer ran first (before the attribute was set), then the press was marked.
            await expect(calls).toEqual(['consumer:none'])
            await expect(probe()).toHaveAttribute('data-pressed', '')
        } finally {
            await mouse('mouseReleased', at)
        }
        await expect(probe()).not.toHaveAttribute('data-pressed')
    })
})

describe('composeHandlers', () => {
    it('calls every defined handler in order and is undefined when there is none', async () => {
        const calls: string[] = []
        const first = fn(() => calls.push('first'))
        const second = fn(() => calls.push('second'))
        composeHandlers<string>(first, undefined, second)!('event')

        await expect(calls).toEqual(['first', 'second'])
        await expect(first).toHaveBeenCalledWith('event')
        await expect(composeHandlers<string>(undefined, undefined)).toBeUndefined()
    })
})

describe('pressedStateHandlers — release marker and window blur (ASMA-9003 round 5)', () => {
    afterEach(cleanup)

    it('marks a pointer release with data-press-released until the pointer leaves or presses again', async () => {
        mount(
            <>
                <Probe />
                <div data-testid='elsewhere' style={{ width: 200, height: 40, margin: 40 }} />
            </>,
        )
        const elsewhere = document.querySelector('[data-testid="elsewhere"]')!

        await holdPressed(probe(), async () => {
            await expect(probe()).toHaveAttribute('data-pressed', '')
            await expect(probe()).not.toHaveAttribute('data-press-released')
        })
        await expect(probe()).not.toHaveAttribute('data-pressed')
        await expect(probe()).toHaveAttribute('data-press-released', '')

        // A new press drops the marker; a drag-off release sets it again; leaving unpressed drops it.
        await mouse('mousePressed', probe())
        await expect(probe()).not.toHaveAttribute('data-press-released')
        await mouse('mouseMoved', elsewhere, { held: true })
        await expect(probe()).toHaveAttribute('data-press-released', '')
        await mouse('mouseReleased', elsewhere)
        await mouse('mouseMoved', probe())
        await expect(probe()).not.toHaveAttribute('data-press-released')
        await mouse('mouseMoved', elsewhere)
        await expect(probe()).not.toHaveAttribute('data-press-released')
    })

    it('marks a Space release, and a keydown drops the marker', async () => {
        mount(<Probe keyboard />)
        probe().focus()

        await space('keyDown')
        await space('keyUp')
        await expect(probe()).not.toHaveAttribute('data-pressed')
        await expect(probe()).toHaveAttribute('data-press-released', '')
        await key('keyDown', 'ArrowDown')
        await expect(probe()).not.toHaveAttribute('data-press-released')
        await key('keyUp', 'ArrowDown')
    })

    it('ends a pointer press when the window loses focus (review item 3)', async () => {
        mount(<Probe />)
        await mouse('mousePressed', probe())
        try {
            await expect(probe()).toHaveAttribute('data-pressed', '')
            // The release never reaches the page (Alt-Tab, an OS dialog): only the window's blur does.
            window.dispatchEvent(new FocusEvent('blur'))
            await expect(probe()).not.toHaveAttribute('data-pressed')
            await expect(probe()).toHaveAttribute('data-press-released', '')
        } finally {
            await mouse('mouseReleased', probe())
        }
    })
})
