import { afterEach, describe, it } from 'vitest'
import { expect } from 'storybook/test'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledTab } from 'src/components/navigation/tabs/StyledTab'
import { StyledTabs } from 'src/components/navigation/tabs/StyledTabs'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { fillOf, holdPressed } from 'src/test-utils/pressedInteraction'
import { page } from 'src/test-utils/interaction-api'

/**
 * ASMA-8210 (TB-02) — the touch-readiness primitives in `src/styles/index.css`.
 *
 * Real Chromium rather than the unit project, because every claim here is a computed-style or a
 * hit-testing question: `::after` geometry, `touch-action` and "is this point inside the target"
 * are exactly what a DOM emulator invents. The suite mounts components directly (no stories), so
 * it adds no VRT baseline — see `docs/a11y-keyboard-contract.md`.
 */

/** The `min-height` the mobile-gated `.asma-touch-target` rule declares, or null if it is missing. */
const touchTargetMinHeightUnderMobileMedia = (): string | null => {
    const findInRules = (rules: CSSRuleList): string | null => {
        for (const rule of Array.from(rules)) {
            if (rule instanceof CSSMediaRule && rule.conditionText.includes('743px')) {
                for (const inner of Array.from(rule.cssRules)) {
                    if (inner instanceof CSSStyleRule && inner.selectorText.includes('.asma-touch-target')) {
                        return inner.style.getPropertyValue('min-height')
                    }
                }
            }

            if ('cssRules' in rule) {
                const result = findInRules(rule.cssRules as CSSRuleList)
                if (result !== null) {
                    return result
                }
            }
        }

        return null
    }

    for (const sheet of Array.from(document.styleSheets)) {
        try {
            const result = findInRules(sheet.cssRules)
            if (result !== null) {
                return result
            }
        } catch {
            // Ignore inaccessible stylesheets.
        }
    }

    return null
}

const alphaOf = (color: string): number => {
    const channels = /rgba?\(([^)]+)\)/.exec(color)?.[1]?.split(',') ?? []
    // rgb() has no alpha channel, so an unparsed or 3-channel colour is fully opaque.
    return channels.length < 4 ? 1 : Number(channels[3])
}

describe('touch-readiness primitives', () => {
    afterEach(cleanup)

    it('gives .asma-hit-area a 44px pointer target without changing the drawn size', async () => {
        // Fixed positioning pins the probe away from the body edge so the hit tests below are
        // arithmetic, not a guess about layout. A fixed box is still the containing block its
        // ::after resolves against.
        const { container } = mount(
            <button className='asma-hit-area' style={{ position: 'fixed', left: 100, top: 100, width: 24, height: 24 }}>
                probe
            </button>,
        )
        const probe = container.querySelector('button')!

        // The class supplies `position: relative` WITHOUT `!important` — the rule lives outside
        // `@layer utilities` precisely so Tailwind's `important: true` cannot importantify it
        // (ASMA-8210 review). If this assertion fails, the rule regressed back into the layer and
        // the inline `fixed` (and any Tailwind position utility) would silently lose again.
        await expect(getComputedStyle(probe).position).toBe('fixed')

        // The visual box is untouched — this is hit-area padding, not a size change (ASMA-8210).
        const box = probe.getBoundingClientRect()
        await expect(box.width).toBe(24)
        await expect(box.height).toBe(24)

        const overlay = getComputedStyle(probe, '::after')
        await expect(overlay.minWidth).toBe('44px')
        await expect(overlay.minHeight).toBe('44px')

        // 92px is outside the 24px box (which starts at 100) but inside the 44px overlay centred on
        // it (90 → 134). A press there must still land on the control.
        await expect(document.elementFromPoint(92, 112)).toBe(probe)
        // …and the target stays bounded: 85px is outside the overlay entirely.
        await expect(document.elementFromPoint(85, 112)).not.toBe(probe)
    })

    it('suppresses the tap flash and the double-tap-zoom delay on a pressable control', async () => {
        // The primitive on its own: ASMA-9003 moved the menu item and the tab — its old probes — to
        // `.asma-touch-ready`; the accordion trigger, field buttons and Pathfinder card still use it.
        const { container } = mount(
            <button type='button' className='asma-pressable'>
                probe
            </button>,
        )
        const probe = container.querySelector('button')!

        const style = getComputedStyle(probe)
        await expect(style.touchAction).toBe('manipulation')
        await expect(alphaOf(style.getPropertyValue('-webkit-tap-highlight-color'))).toBe(0)
        // Resting opacity is untouched — the pressed feedback lives entirely under `:active`, which
        // is why no VRT baseline moves.
        await expect(style.opacity).toBe('1')
    })

    it('gives the menu item and the tab the touch fixes without the opacity fade (ASMA-9003)', async () => {
        const { container } = mount(
            <>
                <StyledTabs value={0}>
                    <StyledTab label='Tab' />
                </StyledTabs>
                <StyledMenuItem>Item</StyledMenuItem>
            </>,
        )
        const tab = container.querySelector('[role="tab"]')!
        const item = container.querySelector('li')!

        await expect(item.classList.contains('asma-touch-target')).toBe(true)
        for (const control of [tab, item]) {
            // Never pressable: its 0.7 opacity would wash out the Figma pressed fill both now paint.
            await expect(control.classList.contains('asma-touch-ready')).toBe(true)
            await expect(control.classList.contains('asma-pressable')).toBe(false)

            const style = getComputedStyle(control)
            await expect(style.touchAction).toBe('manipulation')
            await expect(alphaOf(style.getPropertyValue('-webkit-tap-highlight-color'))).toBe(0)
            await expect(style.opacity).toBe('1')

            // Pressed: the Figma fill at full opacity, never a fade.
            await holdPressed(control, async () => {
                await expect(getComputedStyle(control).opacity).toBe('1')
                await expect(fillOf(control)).toBe(resolveTokenColor('--colors-gama-200'))
            })
        }
    })

    it('keeps the 44px row growth on phones only, so tablet and desktop are unchanged', async () => {
        await expect(touchTargetMinHeightUnderMobileMedia()).toBe('var(--asma-touch-target-size, 44px)')

        // The interaction project runs at 1280x720 (vite.config.ts), i.e. the VRT viewport. The rule
        // above must not apply here, or every desktop baseline would shift.
        await expect(window.matchMedia('(max-width: 743px)').matches).toBe(false)
        const { container } = mount(<StyledMenuItem>Item</StyledMenuItem>)
        await expect(getComputedStyle(container.querySelector('li')!).minHeight).toBe('40px')
    })

    it('on a phone viewport, grows sub-44px rows and never shrinks a designed minimum', async () => {
        // 390x700 puts the tester iframe under the 743px gate — the cascade CI otherwise never
        // sees (interaction and VRT both run at 1280x720). Guards ASMA-8210 review B1: the
        // touch-target utility is a later-source override, not a floor, so a mis-scoped opt-in
        // would silently change a tab's designed minimum. The tabs keep the Figma Tab heights — 48px
        // default, 40px small (ASMA-9003 dropped the old min-h stacking quirk) — so NEITHER may carry
        // the override.
        await page.viewport(390, 700)
        try {
            await expect(window.matchMedia('(max-width: 743px)').matches).toBe(true)
            const { container } = mount(
                <>
                    <StyledTabs value={0}>
                        <StyledTab label='Default' />
                    </StyledTabs>
                    <StyledTabs size='small' value={0}>
                        <StyledTab label='Small' />
                    </StyledTabs>
                    <StyledMenuItem>Item</StyledMenuItem>
                </>,
            )
            const tabs = Array.from(container.querySelectorAll('[role="tab"]'))
            await expect(tabs.length).toBe(2)

            // Tabs carry no touch-target class: the Figma 48px / 40px heights and the 90px minimum
            // width survive on a phone, neither grown nor shrunk.
            for (const [tab, height] of [
                [tabs[0]!, '48px'],
                [tabs[1]!, '40px'],
            ] as const) {
                const tabStyle = getComputedStyle(tab)
                await expect(tabStyle.minHeight).toBe(height)
                await expect(tab.getBoundingClientRect().height).toBe(Number.parseFloat(height))
                await expect(tabStyle.minWidth).toBe('90px')
                await expect(tab.classList.contains('asma-touch-target')).toBe(false)
            }

            // Menu item: 40px → 44px, and it must not gain a min-width it never declared
            // (Chromium resolves the initial `min-width: auto` to 0px on a block-level li).
            const itemStyle = getComputedStyle(container.querySelector('li')!)
            await expect(itemStyle.minHeight).toBe('44px')
            await expect(itemStyle.minWidth).toBe('0px')
        } finally {
            // The desktop viewport every other test in this project assumes (vite.config.ts).
            await page.viewport(1280, 720)
        }
    })

    it('opts the button into touch readiness without dimming its designed pressed state', async () => {
        const { container } = mount(<StyledButton dataTest='touch-ready-probe'>Save</StyledButton>)
        const button = container.querySelector('button')!

        await expect(button.classList.contains('asma-touch-ready')).toBe(true)
        // StyledButton.module.scss already paints `:active` from the button colour tokens. Taking
        // `.asma-pressable` as well would layer a 0.7 opacity over those designed colours.
        await expect(button.classList.contains('asma-pressable')).toBe(false)
        await expect(getComputedStyle(button).touchAction).toBe('manipulation')
    })
})
