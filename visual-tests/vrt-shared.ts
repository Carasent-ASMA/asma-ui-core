import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const FIXED_TIME = new Date('2026-01-15T10:00:00Z')

/** Hermetic capture + font/SMIL stabilization shared by closed- and open-state VRT. */
export const installVrtRouteBlock = async (page: Page): Promise<void> => {
    await page.route('**/*', (route) => {
        const host = new URL(route.request().url()).hostname
        return host === '127.0.0.1' || host === 'localhost' ? route.continue() : route.abort()
    })
}

/**
 * Blocks until the story's DOM has stopped mutating for `quietMs`, capped at `capMs`.
 *
 * `sb-show-main` only says the story started rendering — a `play` function may still be
 * typing, and any timer it kicked off is still pending. `inputs-styled-select-autocomplete--async-loading`
 * is the worst case: its `play` types "Test", so `onInputChange` fires four times and each
 * keystroke schedules an uncancelled 300ms `setTimeout` that calls `setOptions` and
 * `setLoading(false)`. `findByRole` resolves as soon as the expected option appears, while
 * those timers keep landing and the loading spinner keeps toggling. Capture could then hit
 * a settled list, a spinner, or a half-updated list — which is exactly why its diff
 * measured 3239, then 3410, then 448 pixels: a timing race, not a rendering change.
 *
 * Waiting for DOM quiet fixes the class of bug rather than that one story, and it is a
 * no-op for stories that are already settled, so it does not move their pixels. The cap
 * keeps a genuinely never-settling story (the rAF/ResizeObserver oscillators in the
 * vrt-skip map) from hanging the run.
 */
const waitForDomToSettle = async (page: Page, quietMs = 150, capMs = 4000): Promise<void> => {
    await page.evaluate(
        async ({ quietMs, capMs }) => {
            const root = document.querySelector('#storybook-root') ?? document.body
            await new Promise<void>((resolve) => {
                const observer = new MutationObserver(() => {
                    clearTimeout(quietTimer)
                    quietTimer = setTimeout(finish, quietMs)
                })
                const finish = () => {
                    observer.disconnect()
                    clearTimeout(quietTimer)
                    clearTimeout(capTimer)
                    resolve()
                }
                let quietTimer = setTimeout(finish, quietMs)
                const capTimer = setTimeout(finish, capMs)
                observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true })
            })
        },
        { quietMs, capMs },
    )
}

export const prepareStoryFrame = async (page: Page, storyId: string): Promise<void> => {
    await page.clock.setFixedTime(FIXED_TIME)
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: 'load' })
    await page.locator('#storybook-root').waitFor({ state: 'attached' })
    await page.waitForFunction(() => document.body.classList.contains('sb-show-main'))
    await expect(page.locator('.sb-preparing-story')).toBeHidden()
    await expect(page.locator('.sb-errordisplay')).toBeHidden()
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => {
        document.querySelectorAll('animate, animateTransform, animateMotion, set').forEach((el) => {
            el.remove()
        })
    })
    await waitForDomToSettle(page)
}
