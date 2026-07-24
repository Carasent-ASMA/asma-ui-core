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
}
