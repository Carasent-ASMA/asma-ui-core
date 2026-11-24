import { afterEach, describe, it, vi } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { centreOf, fillOf, holdPressed, key, mouse, systemColor, transitionOf } from 'src/test-utils/pressedInteraction'
import { StyledChip } from './StyledChip'

/**
 * Disabled contract — StyledChip (ASMA-8305). disabled-states DIS-1…DIS-3; WCAG 2.1.1, 4.1.2.
 */

const chip = (): HTMLElement => document.querySelector<HTMLElement>('[data-testid="filter"]')!

describe('StyledChip disabledReason', () => {
    afterEach(cleanup)

    it('keeps a disabled clickable chip focusable even without its own reason (DIS-3)', async () => {
        mount(<StyledChip dataTest='filter' label='Open' onClick={() => undefined} disabled />)

        await expect(chip()).toHaveAttribute('tabindex', '0')
        await expect(chip()).toHaveAttribute('aria-disabled', 'true')
    })

    it('gives a tappable disabled chip with a reason the touch fixes, but no press (round 5 item 12)', async () => {
        mount(<StyledChip dataTest='filter' label='SMS' onClick={vi.fn()} disabled disabledReason='Add a number first' />)
        const style = getComputedStyle(chip())

        // A tap opens its reason, so it must not flash grey or wait for a double-tap.
        await expect(chip().classList.contains('asma-touch-ready')).toBe(true)
        await expect(style.touchAction).toBe('manipulation')
        await expect(style.getPropertyValue('-webkit-tap-highlight-color')).toBe('rgba(0, 0, 0, 0)')
        await holdPressed(chip(), async () => {
            await expect(chip()).not.toHaveAttribute('data-pressed')
        })
    })

    it('keeps a disabled non-clickable chip out of the tab order', async () => {
        mount(<StyledChip dataTest='filter' label='Open' disabled />)

        await expect(chip()).not.toHaveAttribute('tabindex')
        await expect(chip()).not.toHaveAttribute('aria-disabled')
    })

    it('stays focusable, announces the reason and ignores activation', async () => {
        const onClick = vi.fn()
        mount(
            <StyledChip
                dataTest='filter'
                label='Open'
                onClick={onClick}
                disabled
                disabledReason='No open items in this period'
            />,
        )

        await userEvent.tab()

        await expect(document.activeElement).toBe(chip())
        await expect(chip()).toHaveAttribute('role', 'button')
        await expect(chip()).toHaveAttribute('aria-disabled', 'true')
        await waitFor(() => expect(chip()).toHaveAccessibleDescription('No open items in this period'))

        await userEvent.keyboard('{Enter}')
        chip().click()
        await expect(onClick).not.toHaveBeenCalled()
    })
})

/*
 * ASMA-9003 — the chip's pressed look (Figma Pressed state sheet, Chip tag Quick filter): an instant gama-200
 * fill that eases out over 150 ms on release only, gama-700 label, the border kept, no ring; held by the pointer
 * and by Space. Hover keeps master's timing (none). Real Chromium, trusted input through the DevTools protocol.
 */
const accentOf = (element: Element): string => getComputedStyle(element).getPropertyValue('--control-pressed-accent').trim()
const rootToken = (token: string): string =>
    getComputedStyle(document.documentElement).getPropertyValue(token).trim()

describe('StyledChip pressed state (ASMA-9003)', () => {
    afterEach(cleanup)

    it('fills gama-200 with a gama-700 label, keeps the border, draws no ring, and cancels on drag-off', async () => {
        const onClick = vi.fn()
        mount(<StyledChip dataTest='filter' label='Quick filter' clickable onClick={onClick} />)
        const resting = getComputedStyle(chip())
        const restingBorder = { color: resting.borderColor, width: resting.borderWidth }
        const { x, y, width, height } = chip().getBoundingClientRect()
        const restingRect = { x, y, width, height }
        const at = centreOf(chip())

        await mouse('mouseMoved', at)
        await mouse('mousePressed', at)
        try {
            await expect(chip()).toHaveAttribute('data-pressed')
            const style = getComputedStyle(chip())
            await expect(fillOf(chip())).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(style.color).toBe(resolveTokenColor('--colors-gama-700'))
            await expect(transitionOf(chip()).duration).toBe('0s')
            await expect({ color: style.borderColor, width: style.borderWidth }).toEqual(restingBorder)
            await expect(style.boxShadow).toBe('none')
            const pressedBox = chip().getBoundingClientRect()
            await expect({ x: pressedBox.x, y: pressedBox.y, width: pressedBox.width, height: pressedBox.height }).toEqual(restingRect)
            await expect(accentOf(chip())).toBe(rootToken('--colors-gama-700'))

            // Drag off: the press is cancelled at once and, marked released, the fill eases out over 150 ms.
            await mouse('mouseMoved', { x: at.x + 300, y: at.y + 200 }, { held: true })
            await expect(chip()).not.toHaveAttribute('data-pressed')
            await expect(chip()).toHaveAttribute('data-press-released')
            await expect(transitionOf(chip())).toMatchObject({ duration: '0.15s', timing: 'ease-out' })
        } finally {
            await mouse('mouseReleased', { x: at.x + 300, y: at.y + 200 })
        }
        await expect(onClick).not.toHaveBeenCalled()
    })

    it("keeps master's hover timing: the hover fill comes and goes at once (round 5, T)", async () => {
        mount(<StyledChip dataTest='filter' label='Quick filter' clickable onClick={vi.fn()} />)
        const resting = fillOf(chip())
        await mouse('mouseMoved', chip())
        await expect(transitionOf(chip()).duration).toBe('0s')
        await expect(fillOf(chip())).toBe(resolveTokenColor('--colors-delta-50'))
        await mouse('mouseMoved', { x: 1, y: 1 })
        await expect(fillOf(chip())).toBe(resting)
    })

    it('holds the press while Space is held, keeps the focus ring, and activates once on release', async () => {
        const onClick = vi.fn()
        mount(<StyledChip dataTest='filter' label='Quick filter' clickable onClick={onClick} />)
        await userEvent.tab()
        await expect(document.activeElement).toBe(chip())
        const ring = getComputedStyle(chip(), '::after')
        const restingRing = { border: ring.borderColor, shadow: ring.boxShadow }
        await expect(restingRing.border).toBe(resolveTokenColor('--colors-focus-ring'))

        await key('keyDown', ' ')
        try {
            await expect(chip()).toHaveAttribute('data-pressed')
            await expect(fillOf(chip())).toBe(resolveTokenColor('--colors-gama-200'))
            const pressedRing = getComputedStyle(chip(), '::after')
            await expect({ border: pressedRing.borderColor, shadow: pressedRing.boxShadow }).toEqual(restingRing)
            // Like a native button: nothing on keydown, nothing on key repeat (review 3)…
            await key('keyDown', ' ', { repeat: true })
            await key('keyDown', ' ', { repeat: true })
            await expect(onClick).not.toHaveBeenCalled()
        } finally {
            await key('keyUp', ' ')
        }
        // …one activation on release.
        await expect(onClick).toHaveBeenCalledTimes(1)
        await expect(chip()).not.toHaveAttribute('data-pressed')
    })

    it('still activates once when the pointer passes over and off during a held Space (review #1)', async () => {
        const onClick = vi.fn()
        mount(<StyledChip dataTest='filter' label='Quick filter' clickable onClick={onClick} />)
        await userEvent.tab()
        const at = centreOf(chip())

        await key('keyDown', ' ')
        try {
            await mouse('mouseMoved', at)
            await mouse('mouseMoved', { x: at.x + 300, y: at.y + 200 })
            await expect(chip()).toHaveAttribute('data-pressed', 'key')
        } finally {
            await key('keyUp', ' ')
        }
        await expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('activates on Enter keydown with no pressed look', async () => {
        const onClick = vi.fn()
        mount(<StyledChip dataTest='filter' label='Quick filter' clickable onClick={onClick} />)
        await userEvent.tab()

        await key('keyDown', 'Enter')
        try {
            await expect(onClick).toHaveBeenCalledTimes(1)
            await expect(chip()).not.toHaveAttribute('data-pressed')
        } finally {
            await key('keyUp', 'Enter')
        }
    })

    it('does not press a clickable chip from its delete button, by pointer or by Space (CARD-15)', async () => {
        const onClick = vi.fn()
        const onDelete = vi.fn()
        mount(<StyledChip dataTest='filter' label='Removable' clickable onClick={onClick} onDelete={onDelete} />)
        const remove = document.querySelector<HTMLButtonElement>('[data-testid="filter-delete"]')!

        const at = centreOf(remove)
        await mouse('mouseMoved', at)
        await mouse('mousePressed', at)
        try {
            await expect(chip()).not.toHaveAttribute('data-pressed')
            await expect(fillOf(chip())).not.toBe(resolveTokenColor('--colors-gama-200'))
        } finally {
            await mouse('mouseReleased', at)
        }
        await expect(onDelete).toHaveBeenCalledTimes(1)
        await expect(onClick).not.toHaveBeenCalled()

        // Space on the focused delete button is the button's own: it neither presses nor activates the chip.
        remove.focus()
        await key('keyDown', ' ')
        await expect(chip()).not.toHaveAttribute('data-pressed')
        await key('keyUp', ' ')
        await expect(onDelete).toHaveBeenCalledTimes(2)
        await expect(onClick).not.toHaveBeenCalled()
    })

    it('never presses a disabled or a read-only chip (DIS-4, DIS-6)', async () => {
        const { container } = mount(
            <>
                <StyledChip dataTest='filter' label='Disabled' clickable disabled onClick={vi.fn()} />
                <StyledChip dataTest='readonly' label='Read only' clickable readOnly onClick={vi.fn()} />
            </>,
        )
        const gama200 = resolveTokenColor('--colors-gama-200')

        // The disabled chip stays focusable (DIS-3): a real press and a real held Space both reach it.
        const at = centreOf(chip())
        await mouse('mousePressed', at)
        await expect(chip()).not.toHaveAttribute('data-pressed')
        await mouse('mouseReleased', at)
        chip().focus()
        await key('keyDown', ' ')
        await expect(chip()).not.toHaveAttribute('data-pressed')
        await expect(fillOf(chip())).not.toBe(gama200)
        await key('keyUp', ' ')

        // The read-only chip lets presses through to what is behind it (`pointer-events: none`), and even
        // a pointerdown dispatched straight at it — past hit-testing — does not press it.
        const readonly = container.querySelector<HTMLElement>('[data-testid="readonly"]')!
        await expect(document.elementFromPoint(centreOf(readonly).x, centreOf(readonly).y)).not.toBe(readonly)
        readonly.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }))
        await expect(readonly).not.toHaveAttribute('data-pressed')
        await expect(fillOf(readonly)).not.toBe(gama200)
    })

    it('in forced colours shows the press as an inset Highlight outline and keeps the ring', async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        try {
            mount(<StyledChip dataTest='filter' label='Quick filter' clickable onClick={vi.fn()} />)
            await userEvent.tab()
            const ring = getComputedStyle(chip(), '::after').borderColor
            await expect(ring).toBe(systemColor('CanvasText'))

            const restingOutline = getComputedStyle(chip()).outline
            await key('keyDown', ' ')
            try {
                const style = getComputedStyle(chip())
                await expect(style.outline).toBe(`${systemColor('Highlight')} solid 2px`)
                await expect(style.outlineOffset).toBe('-2px')
                // The focus ring stays CanvasText (review 18).
                await expect(getComputedStyle(chip(), '::after').borderColor).toBe(systemColor('CanvasText'))
            } finally {
                await key('keyUp', ' ')
            }
            await expect(getComputedStyle(chip()).outline).toBe(restingOutline)
        } finally {
            await cdp().send('Emulation.setEmulatedMedia', { features: [] })
        }
    })
})
