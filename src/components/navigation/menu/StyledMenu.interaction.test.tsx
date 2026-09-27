import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cleanup, describeFocusIndicator, focusStyleOf, mount } from 'src/test-utils/renderInteraction'
import { StyledMenu } from './StyledMenu'
import { StyledMenuItem } from './StyledMenuItem'

/**
 * Keyboard & focus contract — StyledMenu / StyledMenuList / StyledMenuItem (ASMA-8139).
 * WAI-ARIA menu-button pattern; WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7, 4.1.2.
 */

const MenuFixture = ({ onPick = () => undefined }: { onPick?: (value: string) => void }): JSX.Element => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    // A real menu dismisses on activation; without that the second open in a test would be a no-op.
    const pick = (value: string): void => {
        onPick(value)
        setAnchorEl(null)
    }
    return (
        <div>
            <button type='button' data-testid='before'>
                Before
            </button>
            <StyledButton dataTest='menu-trigger' onClick={(event) => setAnchorEl(event.currentTarget)}>
                Actions
            </StyledButton>
            <StyledMenu open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                <StyledMenuItem data-testid='item-rename' onClick={() => pick('rename')}>
                    Rename
                </StyledMenuItem>
                <StyledMenuItem data-testid='item-duplicate' onClick={() => pick('duplicate')}>
                    Duplicate
                </StyledMenuItem>
                <StyledMenuItem data-testid='item-archive' disabled onClick={() => pick('archive')}>
                    Archive
                </StyledMenuItem>
                <StyledMenuItem data-testid='item-delete' onClick={() => pick('delete')}>
                    Delete
                </StyledMenuItem>
            </StyledMenu>
            {/* Parked out of the anchored popover's way so it is a real, hittable target. */}
            <button
                type='button'
                data-testid='outside-close'
                style={{ position: 'fixed', right: 0, bottom: 0 }}
                onClick={() => setAnchorEl(null)}
            >
                Close from outside
            </button>
        </div>
    )
}

const menu = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="menu"]')
const items = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'))

const openMenu = async (container: HTMLElement): Promise<HTMLButtonElement> => {
    const button = container.querySelector<HTMLButtonElement>('[data-testid="menu-trigger"]')!
    await userEvent.click(button)
    await waitFor(() => expect(menu()).not.toBeNull())
    return button
}

describe('StyledMenu keyboard contract', () => {
    afterEach(cleanup)

    it('exposes menu/menuitem roles and the disabled state (4.1.2)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)

        await expect(items()).toHaveLength(4)
        await expect(items()[2]).toHaveAttribute('aria-disabled', 'true')
        await expect(items()[0]).not.toHaveAttribute('aria-disabled')
    })

    it('focuses the first enabled item when the menu opens (2.4.3)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)

        await waitFor(() => expect(document.activeElement).toBe(items()[0]))
    })

    it('moves through items with the arrow keys, skipping disabled, and wraps (2.1.1)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[1])

        // 'Archive' is disabled and must be skipped.
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[3])

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[0])

        await userEvent.keyboard('{ArrowUp}')
        await expect(document.activeElement).toBe(items()[3])
    })

    it('jumps to the first/last enabled item with Home/End (2.1.1)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{End}')
        await expect(document.activeElement).toBe(items()[3])

        await userEvent.keyboard('{Home}')
        await expect(document.activeElement).toBe(items()[0])
    })

    it('activates the focused item with Enter (2.1.1)', async () => {
        const onPick = fn()
        const { container } = mount(<MenuFixture onPick={onPick} />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{Enter}')

        await expect(onPick).toHaveBeenCalledWith('rename')
        await waitFor(() => expect(menu()).toBeNull())
    })

    it('activates the focused item with Space (2.1.1)', async () => {
        const onPick = fn()
        const { container } = mount(<MenuFixture onPick={onPick} />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard(' ')

        await expect(onPick).toHaveBeenCalledWith('duplicate')
    })

    it('does not activate a disabled item from the keyboard (4.1.2)', async () => {
        const onPick = fn()
        const { container } = mount(<MenuFixture onPick={onPick} />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        // Arrow keys skip it, so reach it directly and confirm activation is still refused.
        items()[2]!.focus()
        await userEvent.keyboard('{Enter}')

        await expect(onPick).not.toHaveBeenCalled()
    })

    it('closes on Escape — no keyboard trap (2.1.2, 1.4.13)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(menu()).toBeNull())
    })

    /* FINDING ASMA-8139-E — WCAG 2.4.3 (focus order). src/components/utils/popover/StyledPopover.tsx
     * (the dismissal path used by StyledMenu). Closing the menu unmounts the portalled popover while
     * DOM focus is still on a `[role="menuitem"]` inside it, and nothing hands focus back to the
     * trigger — so focus falls to `<body>` and the next Tab restarts from the top of the document.
     * The WAI-ARIA menu-button pattern requires focus to return to the button on Escape. Affects
     * Escape, outside-press and item activation alike, and therefore every StyledMenu consumer.
     * StyledSelect solves exactly this in its own `handleOpenChange`, so the codebase already treats
     * the behaviour as required — StyledPopover simply has no equivalent.
     * RESOLVED by ASMA-8087 KBD-02: StyledPopover hands focus back to the anchor when the closing
     * panel still owned it. @see docs/a11y-keyboard-contract.md */
    it('returns focus to the trigger when the menu closes (2.4.3)', async () => {
        const { container } = mount(<MenuFixture />)
        const button = await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(menu()).toBeNull())

        await expect(document.activeElement).toBe(button)
    })

    /* The same finding-E defect, on the path a keyboard user actually takes: activating an item closes
     * the menu from the consumer's `onClose`, not from a dismiss reason, so an `onOpenChange`-only
     * restore would leave focus on `<body>`. @see docs/a11y-keyboard-contract.md */
    it('returns focus to the trigger when an item is activated (2.4.3)', async () => {
        const onPick = fn()
        const { container } = mount(<MenuFixture onPick={onPick} />)
        const button = await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(menu()).toBeNull())

        await expect(onPick).toHaveBeenCalledWith('rename')
        await expect(document.activeElement).toBe(button)
    })

    /* WAI-ARIA Menu pattern, Tab: "When focus is on a menuitem in a menu or menubar, move focus out of
     * the menu or menubar, and close all menus and submenus." A menu is a composite widget — Tab is an
     * exit, never a way to walk its items (which are all tabindex=-1). Leaving it open dumped focus
     * somewhere arbitrary with the menu still on screen (2.1.2, 2.4.3).
     * @see https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ */
    // Tab order of the fixture: before → menu-trigger → outside-close.
    it.each([
        ['Tab', 'outside-close', () => userEvent.tab()],
        ['Shift+Tab', 'before', () => userEvent.tab({ shift: true })],
    ])('closes on %s and moves focus out of the menu (2.1.2)', async (_key, landing, move) => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await move()

        await waitFor(() => expect(menu()).toBeNull())
        await expect(document.activeElement).toBe(container.querySelector(`[data-testid="${landing}"]`))
    })

    /* The other half of the KBD-02 contract (RISK-002): the restore is conditional on the closing panel
     * still owning focus, so a close that deliberately put focus somewhere else must be left alone —
     * otherwise every StyledPopover consumer (filter menu, country picker, calendar) yanks focus back
     * to its anchor. @see docs/a11y-keyboard-contract.md */
    it('leaves focus where the user moved it when the menu closes (2.4.3)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        // Keyboard activation, deliberately: a pointer click would re-focus its own target after the
        // close, hiding an unconditional restore. Here nothing focuses anything afterwards, so the
        // assertion only holds while the restore stays conditional.
        const outside = container.querySelector<HTMLButtonElement>('[data-testid="outside-close"]')!
        outside.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(menu()).toBeNull())

        await expect(document.activeElement).toBe(outside)
    })

    /* The other half of that rule: "when focus is on a **menuitem**". `StyledMenu` is also the surface
     * for popovers whose content is arbitrary — the editor's `SearchFilterMenu` and
     * `SearchTemplatesMenu` render an autofocused search field over a filter list and no menu items
     * at all. There, Tab is ordinary movement between controls and dismissing the panel would put the
     * list out of keyboard reach entirely (2.1.1).
     * @see https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ */
    it('keeps the menu open when Tab moves between controls inside its content (2.1.1)', async () => {
        const ContentMenuFixture = (): JSX.Element => {
            const [anchorEl, setAnchorEl] = useState<Element | null>(null)
            return (
                <div>
                    <StyledButton dataTest='menu-trigger' onClick={(event) => setAnchorEl(event.currentTarget)}>
                        Filter
                    </StyledButton>
                    <StyledMenu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                        <div className='flex flex-col gap-2 p-4'>
                            <input data-testid='search' placeholder='search' />
                            <button type='button' data-testid='result'>
                                Result
                            </button>
                        </div>
                    </StyledMenu>
                </div>
            )
        }
        const { container } = mount(<ContentMenuFixture />)
        await userEvent.click(container.querySelector('[data-testid="menu-trigger"]')!)
        await waitFor(() => expect(document.querySelector('[role="menu"]')).not.toBeNull())
        document.querySelector<HTMLInputElement>('[data-testid="search"]')!.focus()

        await userEvent.tab()

        await expect(document.querySelector('[role="menu"]')).not.toBeNull()
        await expect(document.activeElement).toBe(document.querySelector('[data-testid="result"]'))
    })

    /* FINDING ASMA-8139-F — WCAG 2.4.7 (focus visible). src/components/navigation/menu/StyledMenuItem.tsx.
     * Same defect as ASMA-8139-B on StyledSelectItem: the row is `outline-none` with no focus rule,
     * while StyledMenuList's arrow-key handler moves real DOM focus onto it. The `hover:bg-delta-50`
     * rule covers the mouse only, so a keyboard user cannot see which item is focused.
     * RESOLVED by ASMA-8087 KBD-07 as the requested WCAG 2.4.7 exception: a `:focus-visible` left
     * indicator drawn from the shared focus-ring token. @see docs/a11y-keyboard-contract.md */
    it('paints a visible focus indicator on the focused menu item (2.4.7)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        const target = items()[1]!
        const before = focusStyleOf(target)
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(target)

        await expect(
            describeFocusIndicator(before, focusStyleOf(target)),
            'keyboard-focused menu item paints no perceivable focus indicator',
        ).not.toBeNull()
    })
})
