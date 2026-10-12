import { test, expect } from '@playwright/test'
import { installVrtRouteBlock, prepareStoryFrame } from './vrt-shared'

// Figma's Scroll variant includes a visible native scrollbar. Chromium's headless default
// hides it even when CSS reserves a gutter. This worker override affects only the menu gallery.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

test('navigation-styled-menu--gallery', async ({ page }) => {
    await installVrtRouteBlock(page)
    await prepareStoryFrame(page, 'navigation-styled-menu--gallery')
    // This worker is the one place the bar is really drawn (the launch override above), so assert
    // the designed 16px width instead of a declared CSS value: box width minus the 1px surface
    // border each side, minus the content box — 2 + 16.
    const scrollSurface = page.locator('#storybook-root ul[data-menu-scroll]')
    expect(await scrollSurface.evaluate((list) => list.offsetWidth - list.clientWidth - 2)).toBe(16)
    await expect(page).toHaveScreenshot('navigation-styled-menu--gallery.png')
})
