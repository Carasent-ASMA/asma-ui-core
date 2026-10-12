import { afterEach, describe, it } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledMenuItem } from './StyledMenuItem'
import { StyledMenuItem as CheckMenuItem } from './menu-item'

/** ASMA-7539 — Figma "Menus item" is 40px tall; table row-action menus rendered 44px. */
describe('table menu item height', () => {
    afterEach(() => {
        cleanup()
    })

    it('renders row-action menu items at the Figma 40px', async () => {
        const { container } = mount(
            <ul>
                <StyledMenuItem>Archive</StyledMenuItem>
                <CheckMenuItem>View details</CheckMenuItem>
            </ul>,
        )

        for (const item of Array.from(container.querySelectorAll('[role="menuitem"]'))) {
            await expect(item.getBoundingClientRect().height, item.textContent ?? '').toBe(40)
        }
    })
})
