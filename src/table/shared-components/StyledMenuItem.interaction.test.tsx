import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, parkPointer, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { key, mouse, systemColor, transitionOf } from 'src/test-utils/pressedInteraction'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledMenuItem as CheckMenuItem } from './menu-item'

/** ASMA-7539 — Figma "Menus item" is 40px tall; table row-action menus rendered 44px. */
describe('table menu item height', () => {
    afterEach(() => {
        cleanup()
    })

    it('renders row-action menu items at the Figma 40px', async () => {
        const { container } = mount(
            <ul>
                <StyledMenuItem>Archive</StyledMenuItem>
                <CheckMenuItem>View details</CheckMenuItem>
            </ul>,
        )

        for (const item of Array.from(container.querySelectorAll('[role="menuitem"]'))) {
            await expect(item.getBoundingClientRect().height, item.textContent ?? '').toBe(40)
        }
    })
})

/**
 * ASMA-9003 (Figma Pressed state 47847:229830): the table's check menu item presses like the core menu
 * item — row fill gama-200, label gama-700, and a selected row's check gama-700 — at once; an
 * unselected row's check stays hidden and a disabled row shows nothing.
 */
describe('table check menu item pressed state (ASMA-9003)', () => {
    afterEach(async () => {
        await mouse('mouseReleased', { x: 0, y: 0 })
        await parkPointer()
        cleanup()
    })

    const lookOf = (item: Element): { fill: string; label: string; check: string } => ({
        fill: getComputedStyle(item).backgroundColor,
        label: getComputedStyle(item).color,
        check: getComputedStyle(item.querySelector('svg')!).color,
    })

    it.each([
        ['selected', true],
        ['unselected', false],
    ] as const)('%s: fills the pressed row gama-200 with a gama-700 label at once', async (_state, selected) => {
        const { container } = mount(
            <ul role='menu'>
                <CheckMenuItem selected={selected}>View details</CheckMenuItem>
            </ul>,
        )
        const item = container.querySelector('[role="menuitem"]')!
        const rest = lookOf(item)
        try {
            await mouse('mouseMoved', item)
            await mouse('mousePressed', item)
            const pressed = lookOf(item)
            await expect(pressed.fill).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(pressed.label).toBe(resolveTokenColor('--colors-gama-700'))
            await expect(pressed.check, 'the check').toBe(selected ? resolveTokenColor('--colors-gama-700') : rest.check)
            await expect(getComputedStyle(item).transitionDuration, 'no transition into pressed').toBe('0s')
            await expect(item.classList.contains('asma-pressable'), 'no opacity fade').toBe(false)
            await expect(getComputedStyle(item).opacity).toBe('1')
        } finally {
            await mouse('mouseReleased', item)
        }
    })

    it('shows nothing on a disabled row', async () => {
        const { container } = mount(
            <ul role='menu'>
                <CheckMenuItem disabled>View details</CheckMenuItem>
            </ul>,
        )
        const item = container.querySelector('[role="menuitem"]')!
        const rest = lookOf(item)
        try {
            await mouse('mouseMoved', item)
            await mouse('mousePressed', item)
            await expect(lookOf(item)).toEqual(rest)
        } finally {
            await mouse('mouseReleased', item)
        }
    })
})

/**
 * Figma Menus item, Type=Check mark (16048:31636 / 16073:20261 / 45276:212431): a 40px row with a 20px
 * check, 8px padding, a 4px gap and 8px after the label; selected rows rest on bg/selected (gama-25) and
 * hover on bg/hover-selected (gama-50) with a gama-500 check.
 */
// ASMA-9003: in forced colours a pressed row shows an inset Highlight outline. It must beat the row's own
// `outline-hidden` (an `!important` utility), which an arbitrary property without `!` does not.
describe('table menu items in forced colours', () => {
    afterEach(async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [] })
        cleanup()
    })

    it.each([
        ['row-action item', <StyledMenuItem key='a'>Archive</StyledMenuItem>],
        ['check item', <CheckMenuItem key='c'>View details</CheckMenuItem>],
    ] as const)('%s: a pressed row shows an inset Highlight outline', async (_kind, item) => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        const { container } = mount(<ul role='menu'>{item}</ul>)
        const row = container.querySelector<HTMLElement>('[role="menuitem"]')!
        const highlight = systemColor('Highlight')

        await expect(getComputedStyle(row).outlineColor, 'no Highlight at rest').not.toBe(highlight)
        row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }))
        await expect(row).toHaveAttribute('data-pressed')
        const style = getComputedStyle(row)
        await expect([style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset]).toEqual([
            'solid',
            '2px',
            highlight,
            '-2px',
        ])
    })
})

describe('table check menu item Figma geometry', () => {
    afterEach(async () => {
        await parkPointer()
        cleanup()
    })

    it('draws the Check mark row: 40px, 20px check, 8px padding, 4px gap, 8px after the label', async () => {
        const { container } = mount(
            <ul role='menu'>
                <CheckMenuItem selected>View details</CheckMenuItem>
            </ul>,
        )
        const item = container.querySelector('[role="menuitem"]')!
        const check = item.querySelector('svg')!
        const label = item.querySelector('span')!
        const style = getComputedStyle(item)

        await expect(item.getBoundingClientRect().height).toBe(40)
        await expect({ width: check.getBoundingClientRect().width, height: check.getBoundingClientRect().height }).toEqual({
            width: 20,
            height: 20,
        })
        await expect([style.paddingLeft, style.paddingRight, style.columnGap]).toEqual(['8px', '8px', '4px'])
        await expect(getComputedStyle(label).paddingRight).toBe('8px')
        await expect(getComputedStyle(check).color).toBe(resolveTokenColor('--colors-gama-500'))
    })

    it('rests a selected row on gama-25 and hovers it on gama-50', async () => {
        const { container } = mount(
            <ul role='menu'>
                <CheckMenuItem selected>View details</CheckMenuItem>
            </ul>,
        )
        const item = container.querySelector('[role="menuitem"]')!

        await expect(getComputedStyle(item).backgroundColor).toBe(resolveTokenColor('--colors-gama-25'))
        await mouse('mouseMoved', item)
        // Resolved outside `waitFor`: its probe span mutates the DOM, which re-runs the callback forever.
        const hoverSelected = resolveTokenColor('--colors-gama-50')
        await waitFor(() => expect(getComputedStyle(item).backgroundColor).toBe(hoverSelected))
    })
})

/**
 * Figma Menus item for the table row-action item: hover bg/hover-default (delta-50); a selected row rests
 * on bg/selected (gama-25) and hovers to bg/hover-selected (gama-50); a press (gama-200) wins over both.
 */
describe('table row-action menu item fills', () => {
    afterEach(async () => {
        await mouse('mouseReleased', { x: 0, y: 0 })
        await parkPointer()
        cleanup()
    })

    it.each([
        ['selected', true, '--colors-gama-25', '--colors-gama-50'],
        ['unselected', false, null, '--colors-delta-50'],
    ] as const)('%s: rest, hover and pressed fills', async (_state, selected, restToken, hoverToken) => {
        const { container } = mount(
            <ul role='menu'>
                <StyledMenuItem selected={selected}>Archive</StyledMenuItem>
            </ul>,
        )
        const item = container.querySelector('[role="menuitem"]')!
        // Resolved outside `waitFor`: the probe span mutates the DOM, which would re-run the callback forever.
        const rest = restToken ? resolveTokenColor(restToken) : 'rgba(0, 0, 0, 0)'
        const hover = resolveTokenColor(hoverToken)
        const pressed = resolveTokenColor('--colors-gama-200')

        await expect(getComputedStyle(item).backgroundColor).toBe(rest)
        await mouse('mouseMoved', item)
        await waitFor(() => expect(getComputedStyle(item).backgroundColor).toBe(hover))
        try {
            await mouse('mousePressed', item)
            await expect(getComputedStyle(item).backgroundColor, 'pressed wins over hover and selected').toBe(pressed)
        } finally {
            await mouse('mouseReleased', item)
        }
    })
})

/**
 * ASMA-9003 timing: hover and selection keep master's (none on the row, `color 0.2s ease` on the check); a press goes in at
 * once and eases back over 150ms only after it (`data-press-released`).
 */
describe('table menu items: master timing, and the 150ms ease only after a press', () => {
    afterEach(async () => {
        await mouse('mouseReleased', { x: 0, y: 0 })
        await parkPointer()
        cleanup()
    })

    it.each([
        ['row-action item', <StyledMenuItem key='a' selected>Archive</StyledMenuItem>],
        ['check item', <CheckMenuItem key='c' selected>View details</CheckMenuItem>],
    ] as const)('%s: no transition at rest or on hover, none into pressed, 150ms ease-out back', async (_kind, element) => {
        const { container } = mount(<ul role='menu'>{element}</ul>)
        const item = container.querySelector('[role="menuitem"]')!

        await expect(transitionOf(item).duration, 'at rest').toBe('0s')
        await mouse('mouseMoved', item)
        await expect(transitionOf(item).duration, 'hovered').toBe('0s')
        await mouse('mousePressed', item)
        await expect(transitionOf(item).duration, 'pressed').toBe('0s')
        await mouse('mouseReleased', item)
        await expect(item).toHaveAttribute('data-press-released', '')
        await expect(transitionOf(item).duration.split(', ').every((part) => part === '0.15s'), 'released').toBe(true)
        await expect(transitionOf(item).property).toContain('background-color')
        await expect(transitionOf(item).timing).toContain('ease-out')

        await parkPointer()
        await expect(item, 'the release marker goes with the pointer').not.toHaveAttribute('data-press-released')
        await expect(transitionOf(item).duration, 'hover out after a press').toBe('0s')
    })

    it('times the check of a selected check item as master (color 0.2s ease), at once into pressed, 150ms back', async () => {
        const { container } = mount(
            <ul role='menu'>
                <CheckMenuItem selected>View details</CheckMenuItem>
            </ul>,
        )
        const item = container.querySelector('[role="menuitem"]')!
        const check = item.querySelector('svg')!

        await expect(transitionOf(check)).toEqual({ property: 'color', duration: '0.2s', timing: 'ease' })
        await mouse('mouseMoved', item)
        await expect(transitionOf(check), 'hovered').toEqual({ property: 'color', duration: '0.2s', timing: 'ease' })
        await mouse('mousePressed', item)
        await expect(transitionOf(check).property, 'pressed').toBe('none')
        await mouse('mouseReleased', item)
        await expect(transitionOf(check), 'released').toEqual({ property: 'color', duration: '0.15s', timing: 'ease-out' })
    })
})

/** ASMA-9003 review: Enter and Space activate an item once per press; a held key's auto-repeat does nothing. */
describe('table menu items activate once per key press', () => {
    afterEach(cleanup)

    it.each([
        ['row-action item', 'Enter'],
        ['row-action item', ' '],
        ['check item', 'Enter'],
        ['check item', ' '],
    ] as const)('%s: a held %j activates once', async (kind, name) => {
        let activations = 0
        const activate = (): void => {
            activations += 1
        }
        const { container } = mount(
            <ul role='menu'>
                {kind === 'row-action item' ? (
                    <StyledMenuItem onClick={activate}>Archive</StyledMenuItem>
                ) : (
                    <CheckMenuItem onClick={activate}>View details</CheckMenuItem>
                )}
            </ul>,
        )
        container.querySelector<HTMLElement>('[role="menuitem"]')!.focus()

        await key('keyDown', name)
        for (let repeat = 0; repeat < 3; repeat += 1) await key('keyDown', name, { repeat: true })
        await key('keyUp', name)

        await expect(activations).toBe(1)
    })
})
