import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'
import { installVrtRouteBlock, prepareStoryFrame } from './vrt-shared'

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
const DYNAMIC_TOOLBAR_STORIES = [
    'modules-dynamictoolbar--full-view-normal-mode',
    'modules-dynamictoolbar--workspaces-toolbar-layout',
    'modules-dynamictoolbar--workspaces-selection-mode',
    'modules-dynamictoolbar--utilities-stacked-normal',
    'modules-dynamictoolbar--wide-kartlegging-inline',
    'modules-dynamictoolbar--full-view-selection-mode',
    'modules-dynamictoolbar--reserved-space-comparison',
    'modules-dynamictoolbar--selection-two-row-layout',
    'modules-dynamictoolbar--compact-normal-mode',
    'modules-dynamictoolbar--compact-selection-mode',
    'modules-dynamictoolbar--bulk-overflow-rule',
    'modules-dynamictoolbar--single-overflow-shows-directly',
    'modules-dynamictoolbar--labels-collapse-right-to-left',
    'modules-dynamictoolbar--labels-collapse-left-to-right',
    'modules-dynamictoolbar--icon-only-mode',
    'modules-dynamictoolbar--normal-actions-hidden-in-selection',
    'modules-dynamictoolbar--disabled-actions',
    'modules-dynamictoolbar--long-selection-label',
] as const

const SKIP = new Map<string, string>([
    ['datadisplay-tooltip--hovered', 'Floating-UI tooltip repositions on a rAF loop; oscillates ~1–3k px'],
    ['icons-catalog--icons', 'huge SVG icon grid oscillates ~23k px frame-to-frame'],
    ['icons-all-icons--all-icons', 'huge SVG icon grid, same instability as icons-catalog'],
    ['base-ui-styled-radio--group', 'v3.34.0 golden captured a transient loading spinner, not the rendered story'],
    [
        'base-ui-styled-radio--unchecked-disabled',
        'v3.34.0 golden captured a transient loading spinner, not the rendered disabled radio',
    ],
    [
        'inputs-inputfield--focused',
        'v3.34.0 golden captured only the transitioning label, without the rendered input outline',
    ],
    [
        'data-display-styledtable--sizing-persistence-and-control-alignment',
        'ResizeObserver row-height recalculation races the screenshot after the row-expand interaction',
    ],
    ...DYNAMIC_TOOLBAR_STORIES.map(
        (id) => [id, 'ResizeObserver/measurement layout oscillates by ~0.2–3k px between identical captures'] as const,
    ),
])

test.beforeEach(async ({ page }) => {
    await installVrtRouteBlock(page)
})

for (const story of stories) {
    if (SKIP.has(story.id)) continue
    test(story.id, async ({ page }) => {
        await prepareStoryFrame(page, story.id)
        await expect(page).toHaveScreenshot(`${story.id}.png`)
    })
}

test('no orphan baselines', () => {
    const dir = path.join(here, '__screenshots__')
    const baselines = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')) : []
    const live = new Set(stories.map((s) => `${s.id}.png`))
    const orphans = baselines.filter((f) => !/--(?:calendar-|popper-|time-)?open\.png$/.test(f) && !live.has(f))
    expect(
        orphans,
        `stale baselines for deleted stories — run pnpm vrt:accept to prune: ${orphans.join(', ')}`,
    ).toEqual([])
})
