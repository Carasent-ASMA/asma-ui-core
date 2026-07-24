import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'
import { INTERACTION_CAPTURES } from './interaction-states'
import { installVrtRouteBlock, prepareStoryFrame } from './vrt-shared'

const here = path.dirname(fileURLToPath(import.meta.url))

test.beforeEach(async ({ page }) => {
    await installVrtRouteBlock(page)
})

for (const capture of INTERACTION_CAPTURES) {
    test(`open ${capture.screenshot}`, async ({ page }) => {
        await prepareStoryFrame(page, capture.storyId)
        await capture.act(page)
        await expect(page).toHaveScreenshot(capture.screenshot)
    })
}

test('no orphan interaction baselines', () => {
    const dir = path.join(here, '__screenshots__')
    const baselines = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')) : []
    const live = new Set(INTERACTION_CAPTURES.map((c) => c.screenshot))
    const interactionBaselines = baselines.filter((f) => /--(?:calendar-|popper-|time-)?open\.png$/.test(f))
    const orphans = interactionBaselines.filter((f) => !live.has(f))
    expect(
        orphans,
        `stale interaction baselines — run pnpm vrt:accept to prune: ${orphans.join(', ')}`,
    ).toEqual([])
})
