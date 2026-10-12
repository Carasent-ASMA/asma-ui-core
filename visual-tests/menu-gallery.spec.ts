import { test, expect } from '@playwright/test'
import { installVrtRouteBlock, prepareStoryFrame } from './vrt-shared'

// Figma's Scroll variant includes a visible native scrollbar. Chromium's headless default
// hides it even when CSS reserves a gutter. This worker override affects only the menu gallery.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

test('navigation-styled-menu--gallery', async ({ page }) => {
    await installVrtRouteBlock(page)
    await prepareStoryFrame(page, 'navigation-styled-menu--gallery')
    await expect(page).toHaveScreenshot('navigation-styled-menu--gallery.png')
})
