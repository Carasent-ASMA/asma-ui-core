import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'

// DEC-VRT-002: baselines are Linux pixels — refuse native (mac) capture so they can't be polluted.
// @see asma-modules/_docs/frontend/plans/2026-07-11-00-45-plan-visual-regression-playwright-pilot.md:20
if (!process.env.VRT_CONTAINER) {
    throw new Error('VRT runs only inside the pinned Playwright container — use `pnpm vrt` / `pnpm vrt:accept`.')
}

// package.json is `type: module`, so the config loads as ESM — no __dirname.
const here = path.dirname(fileURLToPath(import.meta.url))
const staticDir = path.resolve(here, '..', process.env.VRT_STATIC_DIR ?? 'storybook-static')

export default defineConfig({
    testDir: '.',
    fullyParallel: true,
    workers: 4,
    retries: 0,
    reporter: [['list'], ['html', { outputFolder: '../playwright-report', open: 'never' }]],
    snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
    // GUD-102: started strict (maxDiffPixels:0); TASK-116 shakedown showed complex stories with
    // async/Floating-UI positioning settle at fractional pixels, giving benign <60px AA jitter
    // frame-to-frame. 120px (~0.013% of a 1280×720 frame — still far stricter than Chromatic's
    // default) absorbs that while cleanly separating it from real changes (>1000px in the A/B).
    // Genuine >1000px oscillators (rAF/ResizeObserver loops) are handled by the SKIP list, not
    // by loosening this further. 15s stabilization budget lets heavier stories fully converge.
    expect: { timeout: 15000, toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixels: 120 } },
    use: {
        baseURL: 'http://127.0.0.1:6006',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        timezoneId: 'UTC',
        contextOptions: { reducedMotion: 'reduce' },
    },
    webServer: {
        command: `node ${path.join(here, 'serve-static.mjs')} ${staticDir} 6006`,
        url: 'http://127.0.0.1:6006/index.json',
        reuseExistingServer: false,
    },
})
