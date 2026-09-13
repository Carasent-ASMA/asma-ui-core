import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, describeFocusIndicator, focusStyleOf, mount } from 'src/test-utils/renderInteraction'
import { StyledTab } from './StyledTab'
import { StyledTabs } from './StyledTabs'

/**
 * Keyboard & focus contract — StyledTabs / StyledTab (ASMA-8139).
 * WAI-ARIA Tabs pattern; WCAG 2.1.1, 2.4.3, 2.4.7, 4.1.2.
 */

const TabsFixture = ({ initial = 'one' }: { initial?: string }): JSX.Element => {
    const [value, setValue] = useState<string>(initial)
    return (
        <StyledTabs value={value} onChange={(_event, next) => setValue(next as string)}>
            <StyledTab value='one' label='One' />
            <StyledTab value='two' label='Two' />
            <StyledTab value='three' label='Three' disabled />
            <StyledTab value='four' label='Four' />
        </StyledTabs>
    )
}

const tabsOf = (container: HTMLElement): HTMLButtonElement[] =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'))

describe('StyledTabs keyboard contract', () => {
    afterEach(cleanup)

    it('exposes the tablist/tab roles and selected state (4.1.2)', async () => {
        const { container } = mount(<TabsFixture />)

        await expect(container.querySelector('[role="tablist"]')).not.toBeNull()
        const [one, two] = tabsOf(container)
        await expect(one).toHaveAttribute('aria-selected', 'true')
        await expect(two).toHaveAttribute('aria-selected', 'false')
        await expect(one).toHaveAccessibleName('One')
    })

    it('is a single tab stop — roving tabindex, not one stop per tab (2.4.3)', async () => {
        const { container } = mount(<TabsFixture initial='two' />)
        const tabs = tabsOf(container)

        // Exactly one tab is reachable by Tab; the rest are -1 and reached with arrows.
        await expect(tabs.filter((tab) => tab.tabIndex === 0)).toHaveLength(1)
        await expect(tabs.find((tab) => tab.tabIndex === 0)).toHaveAttribute('aria-selected', 'true')
    })

    it('moves focus with ArrowRight/ArrowLeft and wraps at both ends (2.1.1)', async () => {
        const { container } = mount(<TabsFixture />)
        const tabs = tabsOf(container)
        tabs[0]!.focus()

        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[1])

        // 'three' is disabled and must be skipped, not focused.
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[3])

        // Wrap forward past the end, back to the first enabled tab.
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[0])

        // And wrap backwards.
        await userEvent.keyboard('{ArrowLeft}')
        await expect(document.activeElement).toBe(tabs[3])
    })

    it('moves focus to the first/last enabled tab with Home/End (2.1.1)', async () => {
        const { container } = mount(<TabsFixture />)
        const tabs = tabsOf(container)
        tabs[1]!.focus()

        await userEvent.keyboard('{End}')
        await expect(document.activeElement).toBe(tabs[3])

        await userEvent.keyboard('{Home}')
        await expect(document.activeElement).toBe(tabs[0])
    })

    it('activates the focused tab with Enter and Space (2.1.1)', async () => {
        const { container } = mount(<TabsFixture />)
        const tabs = tabsOf(container)

        tabs[0]!.focus()
        await userEvent.keyboard('{ArrowRight}')
        await userEvent.keyboard('{Enter}')
        await expect(tabs[1]).toHaveAttribute('aria-selected', 'true')

        await userEvent.keyboard('{ArrowRight}')
        await userEvent.keyboard(' ')
        await expect(tabs[3]).toHaveAttribute('aria-selected', 'true')
    })

    it('does not change selection on focus alone — manual activation (3.2.1)', async () => {
        const { container } = mount(<TabsFixture />)
        const tabs = tabsOf(container)
        tabs[0]!.focus()

        await userEvent.keyboard('{ArrowRight}')

        // Focus moved, but selection must not follow until the user activates.
        await expect(document.activeElement).toBe(tabs[1])
        await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
        await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    })

    it('paints a visible focus indicator on the keyboard-focused tab (2.4.7)', async () => {
        const { container } = mount(<TabsFixture />)
        const tabs = tabsOf(container)
        const before = focusStyleOf(tabs[0]!)

        // Tab in from outside so :focus-visible matches — a programmatic .focus() does not
        // reliably trigger it in Chromium, and the tab's ring is a focus-visible: rule.
        await userEvent.tab()
        await expect(document.activeElement).toBe(tabs[0])

        const indicator = describeFocusIndicator(before, focusStyleOf(tabs[0]!))
        await expect(indicator, 'focused tab paints no perceivable focus indicator').not.toBeNull()
    })
})
