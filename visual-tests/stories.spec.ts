import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'

interface IndexEntry {
    id: string
    type: string
}

// package.json is `type: module`, so specs load as ESM — no __dirname.
const here = path.dirname(fileURLToPath(import.meta.url))
const staticDir = path.resolve(here, '..', process.env.VRT_STATIC_DIR ?? 'storybook-static')
const index = JSON.parse(readFileSync(path.join(staticDir, 'index.json'), 'utf8')) as {
    entries: Record<string, IndexEntry>
}
const stories = Object.values(index.entries).filter((e) => e.type === 'story')

// vrt-skip: story-id -> reason (only add with evidence from TASK-116; never skip as a reflex).
// These oscillate >1000px between consecutive frames (rAF/Floating-UI/ResizeObserver loops that
// `animations: 'disabled'` cannot stop) — not benign AA, so a tolerance can't absorb them without
// making the whole suite too loose. All are overlay/large-reference stories with low pixel-baseline
// value (interaction states are covered by the addon-vitest interaction tests). RISK-101/102.
const SKIP = new Map<string, string>([
    ['datadisplay-tooltip--hovered', 'Floating-UI tooltip repositions on a rAF loop; oscillates ~1–3k px'],
    ['icons-catalog--icons', 'huge SVG icon grid oscillates ~23k px frame-to-frame'],
    ['icons-all-icons--all-icons', 'huge SVG icon grid, same instability as icons-catalog'],
])

// Hermetic capture (REQ-101): serve only from our static server, block all external hosts.
// iframe.html links Google Fonts (Roboto); fetching it over the network makes text-heavy
// stories flake (document.fonts.ready resolves before the glyph-triggered fetch settles).
// Blocking forces a consistent local/fallback font every run and removes CI's internet dep.
test.beforeEach(async ({ page }) => {
    await page.route('**/*', (route) => {
        const host = new URL(route.request().url()).hostname
        return host === '127.0.0.1' || host === 'localhost' ? route.continue() : route.abort()
    })
})

// DEC-VRT-007: fixed "today" so date/time-picker stories don't drift monthly.
// setFixedTime overrides Date only (timers stay real — rendering never stalls).
// @see asma-modules/_docs/frontend/plans/2026-07-11-00-45-plan-visual-regression-playwright-pilot.md:25
const FIXED_TIME = new Date('2026-01-15T10:00:00Z')

for (const story of stories) {
    if (SKIP.has(story.id)) continue
    test(story.id, async ({ page }) => {
        await page.clock.setFixedTime(FIXED_TIME)
        await page.goto(`/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'load' })
        await page.locator('#storybook-root').waitFor({ state: 'attached' })
        // never let a crashed story become (or diff against) a baseline
        await expect(page.locator('.sb-errordisplay')).toBeHidden()
        await page.evaluate(() => document.fonts.ready)
        // Playwright's `animations: 'disabled'` freezes CSS animations only — SVG SMIL
        // (e.g. LoadingIcon's indefinite <animateTransform> rotate) spins forever and never
        // stabilizes. Removing the SMIL elements reverts the animated attributes to their
        // base values (rotate→0°, dash→drawn) — fully deterministic, no timeline (RISK-102).
        await page.evaluate(() => {
            document.querySelectorAll('animate, animateTransform, animateMotion, set').forEach((el) => el.remove())
        })
        await expect(page).toHaveScreenshot(`${story.id}.png`)
    })
}

test('no orphan baselines', () => {
    const dir = path.join(here, '__screenshots__')
    const baselines = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')) : []
    const live = new Set(stories.map((s) => `${s.id}.png`))
    const orphans = baselines.filter((f) => !live.has(f))
    expect(
        orphans,
        `stale baselines for deleted stories — run pnpm vrt:accept to prune: ${orphans.join(', ')}`,
    ).toEqual([])
})
