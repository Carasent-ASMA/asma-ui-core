import { afterEach, describe, it } from 'vitest'
import { page } from '@vitest/browser/context'
import { expect } from 'storybook/test'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledTab } from 'src/components/navigation/tabs/StyledTab'
import { StyledTabs } from 'src/components/navigation/tabs/StyledTabs'
import { cleanup, mount } from 'src/test-utils/renderInteraction'

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
    for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRule[]
        try {
            rules = Array.from(sheet.cssRules)
        } catch {
            continue // cross-origin sheet; ours are inline <style> tags, so nothing of interest here
        }
        for (const rule of rules) {
            if (!(rule instanceof CSSMediaRule) || !rule.conditionText.includes('743px')) continue
            for (const inner of Array.from(rule.cssRules)) {
                if (inner instanceof CSSStyleRule && inner.selectorText.includes('.asma-touch-target')) {
                    return inner.style.getPropertyValue('min-height')
                }
            }
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
        const { container } = mount(<StyledMenuItem>Item</StyledMenuItem>)
        const item = container.querySelector('li')!

        await expect(item.classList.contains('asma-pressable')).toBe(true)
        await expect(item.classList.contains('asma-touch-target')).toBe(true)

        const style = getComputedStyle(item)
        await expect(style.touchAction).toBe('manipulation')
        await expect(alphaOf(style.getPropertyValue('-webkit-tap-highlight-color'))).toBe(0)
        // Resting opacity is untouched — the pressed feedback lives entirely under `:active`, which
        // is why no VRT baseline moves.
        await expect(style.opacity).toBe('1')
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
        // would silently SHRINK a tab's effective 48x90 minimum to 44px. Both tab variants rest
        // at 48px — the small variant's `min-h-10` loses to the base `min-h-12` by emitted
        // order (pre-existing quirk, `cn` is plain clsx) — so NEITHER may carry the override.
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

            // Tabs carry no touch-target class: the effective 48px/90px minimums survive on
            // both variants, and neither shrinks.
            for (const tab of tabs) {
                const tabStyle = getComputedStyle(tab)
                await expect(tabStyle.minHeight).toBe('48px')
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
