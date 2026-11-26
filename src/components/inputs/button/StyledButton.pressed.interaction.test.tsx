import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { StyledDatePicker } from 'src/datetime/components/date-picker/StyledDatePicker'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { centreOf, holdPressed, mouse, settle, systemColor, transitionOf } from 'src/test-utils/pressedInteraction'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledButton } from './StyledButton'

/**
 * Pressed state of StyledButton and the date pickers' button (ASMA-9003).
 * @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
 */

const byTest = (id: string): HTMLButtonElement => document.querySelector<HTMLButtonElement>(`[data-testid="${id}"]`)!

/** What a token resolves to in the current theme. */
const tokenColor = (property: string): string => systemColor(`var(${property})`)

const look = (element: HTMLElement): { text: string; background: string; border: string } => {
    const style = getComputedStyle(element)
    return { text: style.color, background: style.backgroundColor, border: style.borderTopColor }
}

const tokenLook = (
    type: string,
    color: string,
    state: string,
): { text: string; background: string; border: string } => {
    const prefix = `--colors-button-${type}-${color}-${state === 'base' ? '' : `${state}-`}`
    return {
        text: tokenColor(`${prefix}text-color`),
        background: tokenColor(`${prefix}bg-color`),
        border: tokenColor(`${prefix}border-color`),
    }
}

/** Windows contrast themes, emulated for the body of `run`. */
const inForcedColours = async (run: () => Promise<void>): Promise<void> => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
    try {
        await run()
    } finally {
        await cdp().send('Emulation.setEmulatedMedia', { features: [] })
    }
}

const ROWS = [
    { variant: 'contained', error: false },
    { variant: 'outlined', error: false },
    { variant: 'text', error: false },
    { variant: 'textGray', error: false },
    { variant: 'contained', error: true },
    { variant: 'outlined', error: true },
    { variant: 'text', error: true },
] as const

describe('StyledButton pressed state (ASMA-9003)', () => {
    afterEach(async () => {
        cleanup()
        await userEvent.keyboard('{/Space}')
    })

    it.each(ROWS)(
        'shows the $variant (error: $error) pressed look over its hover look under a held mouse button',
        async ({ variant, error }) => {
            const color = error ? 'error' : 'common'
            mount(
                <StyledButton dataTest='press' variant={variant} {...(error ? { error: true } : {})}>
                    Save
                </StyledButton>,
            )
            const button = byTest('press')

            await mouse('mouseMoved', button)
            await expect(button.matches(':hover')).toBe(true)

            await mouse('mousePressed', button)
            try {
                await expect(button).toHaveAttribute('data-pressed')
                // Instant in: the pressed colours are the computed value the moment the button goes down.
                await expect(look(button)).toEqual(tokenLook(variant, color, 'active'))
                await expect(look(button)).not.toEqual(tokenLook(variant, color, 'hover'))
            } finally {
                await mouse('mouseReleased', button)
            }
            await expect(button).not.toHaveAttribute('data-pressed')
        },
    )

    it('clears the pressed look at once when the pointer is dragged off, and does not activate', async () => {
        let clicks = 0
        mount(
            <StyledButton dataTest='press' variant='outlined' onClick={() => (clicks += 1)}>
                Save
            </StyledButton>,
        )
        const button = byTest('press')

        await mouse('mouseMoved', button)
        await mouse('mousePressed', button)
        await expect(button).toHaveAttribute('data-pressed')
        await mouse('mouseMoved', centreOf(button, { dy: 120 }), { held: true })
        try {
            await expect(button).not.toHaveAttribute('data-pressed')
            // Back to rest over the 150 ms ease-out.
            await settle(200)
            await expect(look(button)).toEqual(tokenLook('outlined', 'common', 'base'))
        } finally {
            await mouse('mouseReleased', centreOf(button, { dy: 120 }))
        }
        await expect(clicks).toBe(0)
    })

    it('shows the press again when dragged back on while held, and then activates', async () => {
        let clicks = 0
        mount(
            <StyledButton dataTest='press' variant='outlined' onClick={() => (clicks += 1)}>
                Save
            </StyledButton>,
        )
        const button = byTest('press')

        await mouse('mouseMoved', button)
        await mouse('mousePressed', button)
        await mouse('mouseMoved', centreOf(button, { dy: 120 }), { held: true })
        await expect(button).not.toHaveAttribute('data-pressed')
        await mouse('mouseMoved', button, { held: true })
        await expect(button).toHaveAttribute('data-pressed', '')
        await mouse('mouseReleased', button)
        await expect(button).not.toHaveAttribute('data-pressed')
        await expect(clicks).toBe(1)
    })

    it('keeps a held Space press while the mouse moves over and off, and activates once', async () => {
        let clicks = 0
        mount(
            <StyledButton dataTest='press' variant='outlined' onClick={() => (clicks += 1)}>
                Save
            </StyledButton>,
        )
        const button = byTest('press')

        await userEvent.tab()
        await userEvent.keyboard('{Space>}')
        await mouse('mouseMoved', button)
        await mouse('mouseMoved', centreOf(button, { dy: 120 }))
        await expect(button).toHaveAttribute('data-pressed', 'key')
        await userEvent.keyboard('{/Space}')
        await expect(button).not.toHaveAttribute('data-pressed')
        await expect(clicks).toBe(1)
    })

    it('keeps the master hover timing, presses instantly and eases back 150 ms only after a release', async () => {
        mount(
            <StyledButton dataTest='press' variant='outlined'>
                Save
            </StyledButton>,
        )
        const button = byTest('press')
        const master = {
            property: 'color, background-color, border-color, box-shadow',
            duration: '0.3s, 0.3s, 0.3s, 0.3s',
            timing: 'ease-in-out, ease-in-out, ease-in-out, ease-in-out',
        }
        const release = {
            property: 'color, background-color, border-color',
            duration: '0.15s, 0.15s, 0.15s',
            timing: 'ease-out, ease-out, ease-out',
        }

        await expect(transitionOf(button)).toEqual(master)
        await mouse('mouseMoved', button)
        await expect(transitionOf(button)).toEqual(master)
        await holdPressed(button, async () => {
            await expect(transitionOf(button).duration).toBe('0s')
        })
        await expect(button).toHaveAttribute('data-press-released')
        await expect(transitionOf(button)).toEqual(release)
        // Leaving ends the release ease: the hover-out runs on master timing again.
        await mouse('mouseMoved', centreOf(button, { dy: 120 }))
        await expect(button).not.toHaveAttribute('data-press-released')
        await expect(transitionOf(button)).toEqual(master)
    })

    it('eases a focused button back over 150 ms after a Space press, beating focus-visible none', async () => {
        mount(
            <StyledButton dataTest='press' variant='outlined'>
                Save
            </StyledButton>,
        )

        for (const button of [byTest('press')]) {
            await userEvent.tab()
            await expect(button).toHaveFocus()
            // Master: a focused button has no transition, so the ring appears at once.
            await expect(transitionOf(button).duration).toBe('0s')

            await userEvent.keyboard('{Space>}')
            await expect(button).toHaveAttribute('data-pressed')
            await userEvent.keyboard('{/Space}')
            await expect(button).not.toHaveAttribute('data-pressed')
            await expect(button).toHaveAttribute('data-press-released')
            await expect(transitionOf(button).duration).toBe('0.15s, 0.15s, 0.15s')
            // Released: the fill eases back instead of snapping (criterion 2).
            const easing = button.getAnimations().map((animation) => (animation as CSSTransition).transitionProperty)
            await expect(easing).toContain('background-color')
            await settle(200)
        }
    })

    it('keeps the focus ring visible while Space is held on a focused button', async () => {
        mount(
            <StyledButton dataTest='press' variant='outlined'>
                Save
            </StyledButton>,
        )
        const button = byTest('press')

        await userEvent.tab()
        await expect(button).toHaveFocus()
        await expect(button.matches(':focus-visible')).toBe(true)

        await userEvent.keyboard('{Space>}')
        try {
            await expect(button).toHaveAttribute('data-pressed')
            await expect(look(button).background).toBe(tokenLook('outlined', 'common', 'active').background)
            await expect(look(button).text).toBe(tokenLook('outlined', 'common', 'active').text)
            // The ring is the focus-coloured border plus a 2px inset shadow; the press must not replace either.
            await expect(look(button).border).toBe(tokenColor('--colors-focus-ring'))
            await expect(getComputedStyle(button).boxShadow).toContain(
                `${tokenColor('--colors-focus-ring')} 0px 0px 0px 2px inset`,
            )
        } finally {
            await userEvent.keyboard('{/Space}')
        }
    })

    it('shows no pressed look on an aria-disabled button, by mouse or by Space', async () => {
        mount(
            <StyledButton dataTest='press' variant='outlined' disabled disabledReason='Locked for editing'>
                Edit
            </StyledButton>,
        )
        const button = byTest('press')
        const disabled = tokenLook('outlined', 'common', 'disabled')

        await holdPressed(button, async () => {
            await expect(look(button).background).toBe(disabled.background)
            await expect(look(button).text).toBe(disabled.text)
        })

        button.focus()
        await userEvent.keyboard('{Space>}')
        try {
            await expect(look(button).background).toBe(disabled.background)
            await expect(look(button).text).toBe(disabled.text)
        } finally {
            await userEvent.keyboard('{/Space}')
        }
    })

    it('never presses a button that a consumer marks aria-disabled, by mouse or by Space', async () => {
        mount(
            <StyledButton dataTest='press' variant='outlined' aria-disabled='true'>
                Edit
            </StyledButton>,
        )
        const button = byTest('press')
        const active = tokenLook('outlined', 'common', 'active').background

        await holdPressed(button, async () => {
            await expect(button).not.toHaveAttribute('data-pressed')
            await expect(look(button).background).not.toBe(active)
        })

        button.focus()
        await userEvent.keyboard('{Space>}')
        try {
            await expect(button).not.toHaveAttribute('data-pressed')
            await expect(look(button).background).not.toBe(active)
        } finally {
            await userEvent.keyboard('{/Space}')
        }
    })

    it('shows no pressed colours at any point when the press itself starts a busy state', async () => {
        const BusyOnPress = (): JSX.Element => {
            const [loading, setLoading] = useState(false)
            return (
                <StyledButton
                    dataTest='press'
                    variant='contained'
                    loading={loading}
                    onPointerDown={() => setLoading(true)}
                >
                    Save
                </StyledButton>
            )
        }
        mount(<BusyOnPress />)
        const button = byTest('press')
        const active = tokenLook('contained', 'common', 'active').background
        // Every time `data-pressed` appears or `aria-busy` changes, record the fill the button paints right then.
        const seen: string[] = []
        const observer = new MutationObserver(() => seen.push(getComputedStyle(button).backgroundColor))
        observer.observe(button, { attributes: true, attributeFilter: ['data-pressed', 'aria-busy'] })

        await mouse('mouseMoved', button)
        await mouse('mousePressed', button)
        try {
            await expect(button).toHaveAttribute('aria-busy', 'true')
            await expect(look(button).background).not.toBe(active)
        } finally {
            await mouse('mouseReleased', button)
            observer.disconnect()
        }
        await expect(seen.length).toBeGreaterThan(0)
        await expect(seen).not.toContain(active)
    })

    it('shows no pressed look on a natively disabled button', async () => {
        mount(
            <StyledButton dataTest='press' variant='contained' disabled>
                Save
            </StyledButton>,
        )
        const button = byTest('press')

        await holdPressed(button, async () => {
            await expect(look(button)).toEqual(tokenLook('contained', 'common', 'disabled'))
        })
    })

    it('presses a date picker’s own button like StyledButton (criterion 11, ASMA-8137 core button)', async () => {
        const { container } = mount(<StyledDatePicker dataTest='date' mode='single' label='Date' />)
        const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!

        await holdPressed(trigger, async () => {
            await expect(trigger).toHaveAttribute('data-pressed', '')
            await expect(look(trigger).background).toBe(tokenLook('outlined', 'common', 'active').background)
        })
        await expect(trigger).not.toHaveAttribute('data-pressed')
    })

    it('does not press on Enter, only on a held Space', async () => {
        mount(
            <StyledButton dataTest='press' variant='contained'>
                Save
            </StyledButton>,
        )
        const button = byTest('press')
        button.focus()

        await userEvent.keyboard('{Enter>}')
        await expect(button).not.toHaveAttribute('data-pressed')
        await userEvent.keyboard('{/Enter}')

        await userEvent.keyboard('{Space>}')
        await expect(button).toHaveAttribute('data-pressed')
        await userEvent.keyboard('{/Space}')
        await expect(button).not.toHaveAttribute('data-pressed')
    })

    it('shows no pressed look while busy (DIS-8: activation is ignored)', async () => {
        mount(
            <StyledButton dataTest='press' variant='contained' loading>
                Save
            </StyledButton>,
        )
        const button = byTest('press')

        await holdPressed(button, async () => {
            await expect(button).not.toHaveAttribute('data-pressed')
            // The hover fade-in (master 300 ms) settles on hover, never on the pressed colours.
            await settle(350)
            await expect(look(button)).toEqual(tokenLook('contained', 'common', 'hover'))
        })
    })

    it('gives textWhite (dark surfaces, not designed yet) no pressed look', async () => {
        mount(
            <StyledButton dataTest='press' variant='textWhite'>
                Close
            </StyledButton>,
        )
        const button = byTest('press')

        await holdPressed(button, async () => {
            await expect(button).not.toHaveAttribute('data-pressed')
        })
    })

    it('fills a pressed button with Highlight in forced colours and keeps the focus outline', async () => {
        mount(
            <StyledButton dataTest='press' variant='outlined'>
                Save
            </StyledButton>,
        )
        const button = byTest('press')

        await inForcedColours(async () => {
            const highlight = systemColor('Highlight')
            await userEvent.tab()
            await userEvent.keyboard('{Space>}')
            await expect(getComputedStyle(button).backgroundColor).toBe(highlight)
            await expect(getComputedStyle(button).outlineStyle).toBe('solid')
            await expect(getComputedStyle(button).outlineWidth).toBe('3px')
            await userEvent.keyboard('{/Space}')
        })
    })

    it('shows no pressed look on an aria-disabled button in forced colours either', async () => {
        mount(
            <StyledButton dataTest='press' variant='outlined' disabled disabledReason='Locked for editing'>
                Edit
            </StyledButton>,
        )
        const button = byTest('press')

        await inForcedColours(async () => {
            const rest = getComputedStyle(button).backgroundColor
            await holdPressed(button, async () => {
                await expect(button).not.toHaveAttribute('data-pressed')
                await expect(getComputedStyle(button).forcedColorAdjust).toBe('auto')
                await expect(getComputedStyle(button).backgroundColor).toBe(rest)
            })
        })
    })
})
