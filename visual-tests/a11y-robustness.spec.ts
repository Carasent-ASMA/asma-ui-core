/**
 * ASMA-8140 — zoom/reflow, text-spacing, target-size and forced-colors robustness.
 *
 * These are the WCAG criteria the axe job cannot see. Verified against the installed
 * axe-core 4.7.2: `target-size` (SC 2.5.8) ships disabled by default, and no rule at all
 * is tagged `wcag1410`. So a green axe run says nothing about any criterion in this file.
 * ASMA-8136 documents the full coverage limits in docs/a11y-allowlist.md, which lands
 * with PR #171 — not present on this base, so this file does not link it as a path.
 *
 * Assertion-based on purpose — no screenshots. A number tells a reviewer *why* a check
 * failed and by how much, and adding no baselines keeps this suite out of the way of
 * `vrt.sh accept`, which rewrites every png it can see.
 *
 * Runs in the `vrt` CI job: `scripts/vrt.sh check` invokes `playwright test -c visual-tests`
 * whose testDir is '.', so this file is collected with no workflow change.
 *
 * Tests marked `fixme` are confirmed defects with measurements recorded in
 * visual-tests/A11Y-ROBUSTNESS.md. Per the ASMA-8132 coordinator ruling, geometry and
 * paint are design decisions: this ticket measures and documents them, it does not
 * change component code. Each `fixme` names the criterion and the source file to change.
 */
import { expect, test } from '@playwright/test'
import type { ClippedText } from './a11y-probes'
import {
    clippedTextKey,
    collectClippedText,
    collectForcedColorOptOuts,
    collectTargets,
    forcedColorsActive,
    measureDocumentOverflow,
    probeControlPaint,
    TARGET_SELECTOR,
    TEXT_SPACING_CSS,
    TEXT_ZOOM_200_CSS,
} from './a11y-probes'
import { installVrtRouteBlock, prepareStoryFrame } from './vrt-shared'

/**
 * Pin the desktop viewport explicitly rather than inheriting it from the config.
 *
 * These components branch on width — `StyledDialog` goes fullScreen below 743px and the
 * date/time pickers swap to a bottom-sheet Drawer at <=768px — so an unpinned viewport
 * means measuring a different component than the one named in the test. 1280x720 matches
 * VRT. The reflow block below deliberately overrides this, and asserts that it took.
 */
test.use({ viewport: { width: 1280, height: 720 } })

test.beforeEach(async ({ page }) => {
    await installVrtRouteBlock(page)
})

test('the desktop viewport this file assumes is actually in effect', async ({ page }) => {
    /* Guards the pin above. `test.use({ forcedColors })` is silently dropped by this
     * project's `use.contextOptions` (see the forced-colors block), so "the option is
     * declared" is not evidence the emulation applied — measure it. */
    await prepareStoryFrame(page, 'inputs-inputfield--default')
    expect(await page.evaluate(measureDocumentOverflow)).toMatchObject({ clientWidth: 1280 })
})

/**
 * Stories whose pointer targets all conform today, either at 24x24 or via the spacing
 * exception. Curated rather than swept: the audit found five stories that genuinely fail,
 * and a library-wide sweep would assert those too.
 */
const TARGET_SIZE_CLEAN_STORIES = [
    'inputs-checkbox--unchecked-default',
    'inputs-checkbox--checked-default',
    'base-ui-checkbox--checkbox',
    'base-ui-styled-radio--gallery',
    'base-ui-styled-switch--gallery',
    'datadisplay-chip--figma-padding-medium',
    'modules-pageheader--root-desktop',
    'feedback-dialog--default',
    'datetime-datepicker-calendar-states--all-day-states',
] as const

/** Fluid stories — no fixed-width story frame — that fit 320 CSS px today. */
const REFLOW_FLUID_STORIES = [
    'inputs-inputfield--default',
    'inputs-inputfield--error',
    'searchfield--prefilled',
    'form-inputs--form-inputs',
    'inputs-checkbox--unchecked-default',
    'base-ui-styled-radio--gallery',
    'base-ui-styled-switch--gallery',
    'datadisplay-chip--figma-padding-medium',
] as const

/** Key components that survive the SC 1.4.12 override with no new clipping today. */
const TEXT_SPACING_CLEAN_STORIES = [
    'inputs-inputfield--default',
    'inputs-inputfield--error',
    'inputs-inputfield--read-only',
    'searchfield--prefilled',
    'form-inputs--form-inputs',
    'feedback-dialog--default',
    'modules-pageheader--root-desktop',
    'data-display-styledtable--footer-row-count-boundary',
    'inputs-checkbox--unchecked-default',
    'datadisplay-chip--figma-padding-medium',
] as const

/** Components that survive 200% text zoom with no new clipping today. */
const TEXT_ZOOM_CLEAN_STORIES = [
    'inputs-checkbox--unchecked-default',
    'inputs-checkbox--checked-default',
    'base-ui-styled-radio--gallery',
    'base-ui-styled-switch--gallery',
    'datadisplay-chip--figma-padding-medium',
] as const

/**
 * Re-measures until two consecutive reads agree, so a result is never taken mid-reflow.
 *
 * Necessary, not defensive: an override that changes the root font-size or the inherited
 * line-height relays out asynchronously, and reading straight after `addStyleTag` misses
 * the clipping entirely — the field label defect reads as 0 newly-clipped elements
 * immediately and 1 once settled. Polling to stability beats a fixed sleep: no arbitrary
 * number to tune, and it cannot pass by measuring too early.
 */
const stableClippedText = async (page: import('@playwright/test').Page): Promise<ClippedText[]> => {
    let previous = await page.evaluate(collectClippedText)
    for (let attempt = 0; attempt < 20; attempt++) {
        await page.waitForTimeout(50)
        const current = await page.evaluate(collectClippedText)
        const same =
            current.length === previous.length &&
            current.every((clipped, index) => clippedTextKey(clipped) === clippedTextKey(previous[index]!))
        if (same) return current
        previous = current
    }
    return previous
}

/** Runs a probe before and after a style override and returns what the override broke. */
const newlyClippedAfterStyle = async (
    page: import('@playwright/test').Page,
    storyId: string,
    css: string,
): Promise<ClippedText[]> => {
    await prepareStoryFrame(page, storyId)
    const before = await stableClippedText(page)
    await page.addStyleTag({ content: css })
    const after = await stableClippedText(page)

    const known = new Set(before.map(clippedTextKey))
    return after.filter((clipped) => !known.has(clippedTextKey(clipped)))
}

test.describe('SC 2.5.8 target size (minimum)', () => {
    for (const storyId of TARGET_SIZE_CLEAN_STORIES) {
        test(`${storyId} — every target is 24x24 or meets the spacing exception`, async ({ page }) => {
            await prepareStoryFrame(page, storyId)
            const undersized = await page.evaluate(collectTargets, TARGET_SELECTOR)

            const failing = undersized.filter((target) => !target.spacingExceptionMet)
            expect(
                failing,
                `targets under 24px whose 24px circle also reaches a neighbour:\n${failing
                    .map((t) => `  ${t.tag}[${t.role}] ${t.width}x${t.height} "${t.label}" clashes with ${t.clash?.with}`)
                    .join('\n')}`,
            ).toEqual([])
        })
    }

    test('checkbox and radio expose a 38x38 hit area, not their 1x1 sr-only input', async ({ page }) => {
        await prepareStoryFrame(page, 'inputs-checkbox--unchecked-default')
        const wrapper = page.locator('label[class*="_CheckboxWrapper_"]').first()
        const box = await wrapper.boundingBox()

        /* The native input is sr-only at 1x1; the wrapper is the real target. Pinning 38px
         * keeps the core control's hit area from collapsing the way the table's drifted
         * copy did (15x15 — see A11Y-ROBUSTNESS.md F-04). */
        expect(box?.width).toBeGreaterThanOrEqual(24)
        expect(box?.height).toBeGreaterThanOrEqual(24)
        expect(Math.round(box?.width ?? 0)).toBe(38)
        expect(Math.round(box?.height ?? 0)).toBe(38)
    })

    test('date picker day cells are at least 24x24', async ({ page }) => {
        await prepareStoryFrame(page, 'datetime-datepicker-calendar-states--all-day-states')
        const cells = await page.evaluate(() =>
            [...document.querySelectorAll('button')]
                .filter((button) => /^\d{1,2}$/.test((button.textContent ?? '').trim()))
                .map((button) => {
                    const rect = button.getBoundingClientRect()
                    return { width: Math.round(rect.width), height: Math.round(rect.height) }
                }),
        )

        expect(cells.length).toBeGreaterThan(27)
        expect(cells.filter((cell) => cell.width < 24 || cell.height < 24)).toEqual([])
    })

    /* SC 2.5.8, src/components/inputs/switch/base-ui/StyledSwitch.module.scss.
     * The track is 38x22 — 2px short vertically. It conforms today only through the
     * spacing exception, which its `margin: 6px` happens to provide. Any consumer that
     * packs switches tighter loses that. Design call: grow the track to 24px, or keep
     * 22px and make the 6px margin a documented part of the contract. */
    test.fixme('switch track meets 24px without relying on its margin', async ({ page }) => {
        await prepareStoryFrame(page, 'base-ui-styled-switch--unchecked-default')
        const box = await page.locator('[role=switch]').first().boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(24)
    })

    /* SC 2.5.8, src/components/data-display/chip/ (delete button, `h-5 w-5`).
     * 20x20. Usually saved by the spacing exception, but not in
     * inputs-styled-select-autocomplete--performance-multiple-chips, where a chip's
     * delete button sits within 12px of the field's `autocomplete-clear` button. */
    test.fixme('chip delete button meets 24px', async ({ page }) => {
        await prepareStoryFrame(page, 'datadisplay-chip--figma-padding-medium')
        const box = await page.locator('[data-testid="figma-chip-padding-delete"]').boundingBox()
        expect(box?.width).toBeGreaterThanOrEqual(24)
        expect(box?.height).toBeGreaterThanOrEqual(24)
    })

    /* SC 2.5.8, src/table/shared-components/StyledCheckbox.module.scss and
     * src/table/components/StyledTable.module.scss. The table's drifted checkbox copy
     * collapses to 15x15 (core is 40x40) and the row-header toggle is 10x32. Both also
     * fail the spacing exception. Same drifted-geometry family as ASMA-8137. */
    test.fixme('table row controls meet 24px', async ({ page }) => {
        await prepareStoryFrame(page, 'data-display-styledtable--sizing-persistence-and-control-alignment')
        const undersized = await page.evaluate(collectTargets, TARGET_SELECTOR)
        expect(undersized.filter((target) => !target.spacingExceptionMet)).toEqual([])
    })
})

test.describe('SC 1.4.10 reflow at 320 CSS px', () => {
    test.use({ viewport: { width: 320, height: 640 } })

    for (const storyId of REFLOW_FLUID_STORIES) {
        test(`${storyId} — no horizontal scrolling at 320px`, async ({ page }) => {
            await prepareStoryFrame(page, storyId)
            const { scrollWidth, clientWidth } = await page.evaluate(measureDocumentOverflow)

            /* Self-verifying: at 1280 every one of these stories fits trivially, so the
             * assertion below would pass while proving nothing if the override were
             * dropped the way `forcedColors` is. */
            expect(clientWidth, 'the 320px viewport override did not take effect').toBe(320)
            expect(
                scrollWidth - clientWidth,
                `document scrolls horizontally at 320px (scrollWidth ${scrollWidth} vs ${clientWidth})`,
            ).toBeLessThanOrEqual(1)
        })
    }
})

test.describe('SC 1.4.12 text spacing', () => {
    for (const storyId of TEXT_SPACING_CLEAN_STORIES) {
        test(`${storyId} — no new clipping under the 1.4.12 overrides`, async ({ page }) => {
            const clipped = await newlyClippedAfterStyle(page, storyId, TEXT_SPACING_CSS)

            expect(
                clipped,
                `text newly clipped by line-height 1.5 / letter 0.12em / word 0.16em:\n${clipped
                    .map((c) => `  ${c.tag}.${c.className} +${c.overflowX}x/+${c.overflowY}y "${c.text}"`)
                    .join('\n')}`,
            ).toEqual([])
        })
    }

    /* SC 1.4.12, src/components/custom/pathfinder-card/Pathfinder.module.scss
     * (`.compactItems`). The collapsed metadata row is a single nowrap line with
     * overflow hidden; the overrides push 93-275px of it out of view, with no ellipsis
     * and no expanded affordance for the hidden text. Worst measured case:
     * datadisplay-pathfinder-card--breakpoint-matrix-with-avatar, +275px. */
    test.fixme('pathfinder card compact row survives the 1.4.12 overrides', async ({ page }) => {
        const clipped = await newlyClippedAfterStyle(
            page,
            'datadisplay-pathfinder-card--desktop-collapsed-without-avatar',
            TEXT_SPACING_CSS,
        )
        expect(clipped).toEqual([])
    })

    /* SC 1.4.12, src/components/inputs/dynamic-select/ option rows (`min-w-0 truncate`)
     * and src/table/components/StyledTable.module.scss date cells. Option labels lose a
     * further 6-100px and the table's "14.07.2026 · 14:21" cell loses 10px. */
    test.fixme('dynamic select options and table date cells survive the overrides', async ({ page }) => {
        const clipped = await newlyClippedAfterStyle(
            page,
            'inputs-styled-dynamic-select--long-labels-and-disabled-options',
            TEXT_SPACING_CSS,
        )
        expect(clipped).toEqual([])
    })
})

test.describe('SC 1.4.4 resize text to 200%', () => {
    for (const storyId of TEXT_ZOOM_CLEAN_STORIES) {
        test(`${storyId} — no new clipping at 200% text zoom`, async ({ page }) => {
            const clipped = await newlyClippedAfterStyle(page, storyId, TEXT_ZOOM_200_CSS)

            expect(
                clipped,
                `text newly clipped at 200% text zoom:\n${clipped
                    .map((c) => `  ${c.tag}.${c.className} +${c.overflowX}x/+${c.overflowY}y "${c.text}"`)
                    .join('\n')}`,
            ).toEqual([])
        })
    }

    /* SC 1.4.4, src/components/inputs/field-styles.ts — `floatingLabelClass`.
     * The label's line box is pinned in px (`leading-[23px]` resting, `leading-[16px]`
     * shrunk) while its font-size scales with the root, so at 200% the glyphs overflow
     * their own line box by 6-7px and `max-w-[calc(100%-1.75rem)] truncate` takes up to
     * 116px off the end. Every field with a floating label is affected: InputField,
     * SearchField, Select, and the form-inputs composition.
     *
     * Note for whoever picks this up: the ticket predicted the fixed 40px heights in
     * `singleLineShellLayoutStyle` would be the 1.4.12 problem. They are not — see
     * A11Y-ROBUSTNESS.md F-06. The px `leading-*` on the label is the real defect, and
     * it surfaces under 1.4.4, not 1.4.12. */
    test.fixme('field floating label survives 200% text zoom', async ({ page }) => {
        const clipped = await newlyClippedAfterStyle(page, 'inputs-inputfield--default', TEXT_ZOOM_200_CSS)
        expect(clipped).toEqual([])
    })
})

test.describe('forced-colors (Windows High Contrast)', () => {
    /* `test.use({ forcedColors: 'active' })` does NOT work here — this project's
     * playwright.config.ts sets `use.contextOptions`, which replaces the emulation
     * options Playwright would have derived from the fixture, so the media query stays
     * inactive and every assertion below would silently measure ordinary colours.
     * Emulate per page instead, and assert it took (see `assertForcedColors`). */
    const assertForcedColors = async (page: import('@playwright/test').Page, storyId: string): Promise<void> => {
        await page.emulateMedia({ forcedColors: 'active' })
        await prepareStoryFrame(page, storyId)
        expect(
            await page.evaluate(forcedColorsActive),
            'forced-colors emulation is not active — this test would prove nothing',
        ).toBe(true)
    }

    test('nothing opts out of the forced-colors palette', async ({ page }) => {
        /* `forced-color-adjust: none` would keep author colours in High Contrast mode.
         * The library sets it nowhere today (every control computes `auto`); this keeps
         * a future "fix" from silencing the OS palette instead of adapting to it. */
        for (const storyId of ['inputs-checkbox--checked-default', 'base-ui-styled-switch--checked-default']) {
            await assertForcedColors(page, storyId)
            expect(await page.evaluate(collectForcedColorOptOuts), `${storyId} opts out of forced-colors`).toEqual([])
        }
    })

    /* forced-colors, src/components/inputs/checkbox/base-ui/StyledCheckbox.module.scss.
     * THE STATE INVERTS. `.Indicator { color: transparent }` is how the tick is hidden
     * when unchecked. forced-colors overrides `color` to CanvasText, so the tick paints
     * black in BOTH states: measured indicator colour rgb(0, 0, 0) unchecked and
     * rgb(0, 0, 0) checked. Every checkbox reads as checked in High Contrast mode.
     * Hiding by `color: transparent` cannot survive forced-colors; the tick has to be
     * removed from the box or hidden with a property forced-colors does not override. */
    test.fixme('checkbox does not paint its tick when unchecked', async ({ page }) => {
        await assertForcedColors(page, 'inputs-checkbox--unchecked-default')
        const unchecked = await page.evaluate(probeControlPaint, '[class*="_Checkbox_"]')
        await assertForcedColors(page, 'inputs-checkbox--checked-default')
        const checked = await page.evaluate(probeControlPaint, '[class*="_Checkbox_"]')

        expect(unchecked.indicator?.color).not.toBe(checked.indicator?.color)
    })

    /* forced-colors, src/components/inputs/switch/base-ui/StyledSwitch.module.scss.
     * State is unreadable. The track carries it as a background-color (gama-500 on,
     * delta-400 off) with `border: none`; forced-colors rewrites both to Canvas, so on
     * and off both measure rgb(255, 255, 255) with border-width 0px, and the white thumb
     * sits on a white track. Read-only and error states lean on box-shadow, which
     * forced-colors drops entirely. */
    test.fixme('switch track distinguishes on from off under forced-colors', async ({ page }) => {
        await assertForcedColors(page, 'base-ui-styled-switch--checked-default')
        const on = await page.evaluate(probeControlPaint, '[role=switch]')
        await assertForcedColors(page, 'base-ui-styled-switch--unchecked-default')
        const off = await page.evaluate(probeControlPaint, '[role=switch]')

        expect(on.background).not.toBe(off.background)
    })

    /* forced-colors, src/components/inputs/radio-button/base-ui/StyledRadio.module.scss.
     * The checked dot is a gama-500 background-color inside a transparent ring;
     * forced-colors rewrites it to Canvas, so the dot measures rgb(255, 255, 255) on a
     * white field — invisible. Only `opacity` still differs between states, and opacity
     * alone paints nothing a user can see. */
    test.fixme('radio checked dot stays visible under forced-colors', async ({ page }) => {
        await assertForcedColors(page, 'base-ui-styled-radio--checked-default')
        const checked = await page.evaluate(probeControlPaint, '[class*="_Radio_"]')

        expect(checked.indicator?.background).not.toBe('rgb(255, 255, 255)')
    })
})
