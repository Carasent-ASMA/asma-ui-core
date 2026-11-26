import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor, within } from 'src/test-utils/interaction-api'
import {
    cleanup,
    describeFocusIndicator,
    focusStyleOf,
    mount,
    resolveTokenColor,
} from 'src/test-utils/renderInteraction'
import { holdPressed, mouse, space, transitionOf } from 'src/test-utils/pressedInteraction'
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
            <StyledTab value='three' label='Three' disabled tooltip='Save first' />
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

        // 'three' is disabled but stays reachable, so its state and reason can be found (DIS-3).
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[2])

        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[3])

        // Wrap forward past the end, back to the first enabled tab.
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[0])

        // And wrap backwards.
        await userEvent.keyboard('{ArrowLeft}')
        await expect(document.activeElement).toBe(tabs[3])
    })

    it('keeps a disabled tab with a reason reachable but unselectable (disabled-states DIS-3)', async () => {
        const ReasonFixture = (): JSX.Element => {
            const [value, setValue] = useState<string>('one')
            return (
                <StyledTabs value={value} onChange={(_event, next) => setValue(next as string)}>
                    <StyledTab value='one' label='One' />
                    <StyledTab value='two' label='Two' disabled disabledReason='Only administrators can open this' />
                </StyledTabs>
            )
        }
        const { container } = mount(<ReasonFixture />)
        const tabs = tabsOf(container)
        tabs[0]!.focus()

        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[1])
        await expect(tabs[1]).toHaveAttribute('aria-disabled', 'true')
        await expect(tabs[1]).toHaveAccessibleDescription('Only administrators can open this')

        await userEvent.keyboard('{Enter}')
        await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
        await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    })

    it('moves focus to the first/last tab with Home/End (2.1.1)', async () => {
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

        await userEvent.keyboard('{ArrowRight}{ArrowRight}')
        await userEvent.keyboard(' ')
        await expect(tabs[3]).toHaveAttribute('aria-selected', 'true')
    })

    it('focuses a disabled tab, gives its reason, and does not select it (DIS-2, DIS-3)', async () => {
        const { container } = mount(<TabsFixture />)
        const tabs = tabsOf(container)

        await expect(tabs[2]).toHaveAttribute('aria-disabled', 'true')
        await expect(tabs[2]).not.toBeDisabled()

        tabs[1]!.focus()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(tabs[2])
        await waitFor(async () => expect(within(document.body).getByRole('tooltip')).toHaveTextContent('Save first'))
        await expect(tabs[2]).toHaveAccessibleDescription('Save first')

        await userEvent.keyboard('{Enter}')
        await userEvent.keyboard(' ')
        await expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
        await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
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

    it('drops the scroll button when shorter labels fit a content-sized tab bar (ASMA-8879)', async () => {
        const RelabelFixture = ({ labels }: { labels: [string, string] }): JSX.Element => (
            <div className='w-max max-w-full'>
                <StyledTabs value='two' variant='scrollable'>
                    <StyledTab value='one' label={labels[0]} />
                    <StyledTab value='two' label={labels[1]} />
                </StyledTabs>
            </div>
        )
        const waitForUnderline = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 400))
        const { container, rerender } = mount(<RelabelFixture labels={['Oversikt', 'Timer registrerte (lang)']} />)
        await waitForUnderline()
        await expect(container.querySelector('[aria-label="scroll tabs right"]')).toBeNull()

        // The underline still spans the old, wider tab while it animates; that is not tab overflow.
        rerender(<RelabelFixture labels={['Overview', 'Time registered']} />)
        await expect(container.querySelector('[aria-label="scroll tabs right"]')).toBeNull()
        await waitForUnderline()
        await expect(container.querySelector('[aria-label="scroll tabs right"]')).toBeNull()
    })

    it.each(['default', 'small'] as const)('renders 3px active and hover indicators without changing the %s tab geometry', async size => {
        const { container } = mount(
            <StyledTabs value='one' size={size}>
                <StyledTab value='one' label='One' />
                <StyledTab value='two' label='Two' />
            </StyledTabs>,
        )
        const tablist = container.querySelector<HTMLElement>('[role="tablist"]')!
        const tabs = tabsOf(container)
        const activeIndicator = tablist.lastElementChild as HTMLElement

        await expect(getComputedStyle(activeIndicator).height).toBe('3px')
        await expect(activeIndicator.getBoundingClientRect().bottom).toBe(tablist.getBoundingClientRect().bottom)

        const tabHeight = tabs[1]!.getBoundingClientRect().height
        await userEvent.hover(tabs[1]!)
        await expect(getComputedStyle(tabs[1]!).boxShadow).toContain('0px -3px 0px 0px')
        await expect(tabs[1]!.getBoundingClientRect().height).toBe(tabHeight)
    })
})

/** A held Space key, which Chromium marks `:active` on a focused native button. */
const holdSpace = async (whileHeld: () => Promise<void>): Promise<void> => {
    await space('keyDown')
    try {
        await whileHeld()
    } finally {
        await space('keyUp')
    }
}

describe('StyledTab pressed state (ASMA-9003)', () => {
    afterEach(cleanup)

    it('fills a pressed inactive tab gama-200 and shows the 1px separator, not the hover underline', async () => {
        const { container } = mount(<TabsFixture />)
        const [, two] = tabsOf(container)
        const restingRect = two!.getBoundingClientRect()

        // Rest and hover keep master's `transition-colors` (150 ms, Tailwind's default curve).
        const masterTiming = { duration: '0.15s', timing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
        await expect(transitionOf(two!)).toMatchObject(masterTiming)
        await mouse('mouseMoved', two!)
        await expect(transitionOf(two!)).toMatchObject(masterTiming)

        await holdPressed(two!, async () => {
            const style = getComputedStyle(two!)
            // Instant in.
            await expect(style.transitionProperty).toBe('none')
            await expect(style.backgroundColor).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(style.color).toBe(resolveTokenColor('--colors-gama-700'))
            await expect(style.opacity).toBe('1')
            // The tablist's 1px separator, drawn as a background line under the fill (no box-shadow, so the
            // focus ring never competes) — the 3px hover underline does not show.
            await expect(style.backgroundImage).toBe(
                `linear-gradient(to top, ${resolveTokenColor('--colors-delta-200')} 1px, rgba(0, 0, 0, 0) 1px)`,
            )
            await expect(style.boxShadow).not.toContain('-3px')
            // Colour only: no size change.
            await expect(two!.getBoundingClientRect().toJSON()).toEqual(restingRect.toJSON())
        })
        // Released: the pressed colours ease back over 150 ms ease-out while the release marker stays.
        await expect(two).toHaveAttribute('data-press-released')
        await expect(transitionOf(two!)).toMatchObject({ duration: '0.15s', timing: 'ease-out' })
        await mouse('mouseMoved', { x: 1, y: 1 })
        await expect(two).not.toHaveAttribute('data-press-released')
        await expect(transitionOf(two!)).toMatchObject(masterTiming)
    })

    it('keeps the selected indicator bar visible on a pressed selected tab (criterion 5)', async () => {
        const { container } = mount(<TabsFixture />)
        const [one] = tabsOf(container)
        const bar = container.querySelector<HTMLElement>('[role="tablist"] > span[aria-hidden]')!

        await holdPressed(one!, async () => {
            await expect(getComputedStyle(one!).backgroundColor).toBe(resolveTokenColor('--colors-gama-200'))
            // The bar is painted over the tab's fill: it is what a point on it hits.
            const barBox = bar.getBoundingClientRect()
            await expect(barBox.height).toBe(3)
            await expect(document.elementFromPoint(barBox.left + barBox.width / 2, barBox.top + 1)).toBe(bar)
            await expect(getComputedStyle(bar).backgroundColor).toBe(resolveTokenColor('--colors-gama-500'))
        })
    })

    it('shows the pressed fill while Space is held and keeps the focus ring on top (2.4.7)', async () => {
        const { container } = mount(<TabsFixture />)
        const [one] = tabsOf(container)
        await userEvent.tab()
        await expect(document.activeElement).toBe(one)
        const ring = getComputedStyle(one!).boxShadow

        await holdSpace(async () => {
            await expect(getComputedStyle(one!).backgroundColor).toBe(resolveTokenColor('--colors-gama-200'))
            await expect(getComputedStyle(one!).boxShadow).toBe(ring)
        })
    })

    it('shows no pressed look when the arrow keys move focus, nor on a disabled tab', async () => {
        const { container } = mount(<TabsFixture />)
        const [one, two, three] = tabsOf(container)
        const gama200 = resolveTokenColor('--colors-gama-200')
        one!.focus()

        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(two)
        await expect(getComputedStyle(two!).backgroundColor).not.toBe(gama200)

        const resting = getComputedStyle(three!)
        const before = { backgroundColor: resting.backgroundColor, color: resting.color }
        await holdPressed(three!, async () => {
            const style = getComputedStyle(three!)
            await expect({ backgroundColor: style.backgroundColor, color: style.color }).toEqual(before)
        })
    })
})
