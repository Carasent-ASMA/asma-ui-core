import { useState, type ReactNode } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import {
    cleanup,
    describeFocusIndicator,
    focusStyleOf,
    mount,
    parkPointer,
    resolveTokenColor,
} from 'src/test-utils/renderInteraction'
import { fillOf, holdPressed, key, transitionOf } from 'src/test-utils/pressedInteraction'
import { StyledMenu } from './StyledMenu'
import { ToolbarActionGroup } from 'src/components/custom/module/header-layout/ToolbarActionGroup'
import { StyledMenuList } from './StyledMenuList'
import { StyledMenuItem } from './StyledMenuItem'
import { StyledCheckbox } from 'src/components/inputs/checkbox'

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

    it('moves through items with the arrow keys, disabled ones included, and wraps (2.1.1)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[1])

        // 'Archive' is disabled but stays reachable, so its state and reason can be found (DIS-3).
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[2])

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[3])

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[0])

        await userEvent.keyboard('{ArrowUp}')
        await expect(document.activeElement).toBe(items()[3])
    })

    it('keeps a disabled item with a reason reachable and announces the reason (disabled-states DIS-3)', async () => {
        const onPick = fn()
        const ReasonFixture = (): JSX.Element => {
            const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
            return (
                <div>
                    <StyledButton dataTest='menu-trigger' onClick={(event) => setAnchorEl(event.currentTarget)}>
                        Actions
                    </StyledButton>
                    <StyledMenu open={!!anchorEl} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                        <StyledMenuItem data-testid='item-rename'>Rename</StyledMenuItem>
                        <StyledMenuItem
                            data-testid='item-archive'
                            disabled
                            disabledReason='Locked for editing'
                            onClick={() => {
                                onPick('archive')
                            }}
                        >
                            Archive
                        </StyledMenuItem>
                    </StyledMenu>
                </div>
            )
        }
        const { container } = mount(<ReasonFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(items()[1])
        await expect(items()[1]).toHaveAccessibleDescription('Locked for editing')

        await userEvent.keyboard('{Enter}')
        await expect(onPick).not.toHaveBeenCalled()
    })

    it('jumps to the first/last item with Home/End (2.1.1)', async () => {
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

    it('keeps exactly one item in the Tab order — the focused one (roving tabindex, 2.1.1)', async () => {
        const { container } = mount(<MenuFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        const tabStops = (): HTMLElement[] => items().filter((item) => item.tabIndex === 0)
        await expect(tabStops()).toEqual([items()[0]])

        await userEvent.keyboard('{ArrowDown}{ArrowDown}')
        await expect(document.activeElement).toBe(items()[2])
        await expect(tabStops()).toEqual([items()[2]])
    })

    it('does not activate a disabled item from the keyboard (4.1.2)', async () => {
        const onPick = fn()
        const { container } = mount(<MenuFixture onPick={onPick} />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(items()[0]))

        // Arrow keys reach it; activation is still refused.
        await userEvent.keyboard('{ArrowDown}{ArrowDown}')
        await expect(document.activeElement).toBe(items()[2])
        await userEvent.keyboard('{Enter}')
        await userEvent.keyboard(' ')

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
     * Same defect as ASMA-8139-B on StyledSelectItem: the row is `outline-hidden` with no focus rule,
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

describe('StyledMenu row structure', () => {
    afterEach(cleanup)

    const separator = (row: Element): string => getComputedStyle(row, '::after').height

    it('separates wrapped/fragment rows, stops at custom content, and updates after removal', async () => {
        const rows = (last: boolean): JSX.Element => (
            <StyledMenuList>
                <>
                    <StyledMenuItem>First</StyledMenuItem>
                </>
                <div role='presentation'>
                    <StyledMenuItem>Wrapped</StyledMenuItem>
                </div>
                <li role='presentation'>
                    <input aria-label='Search' />
                </li>
                <StyledMenuItem>After search</StyledMenuItem>
                {last && (
                    <div role='presentation'>
                        <StyledMenuItem>Last</StyledMenuItem>
                    </div>
                )}
            </StyledMenuList>
        )
        const { container, rerender } = mount(rows(true))
        const getRows = (): Element[] => Array.from(container.querySelectorAll('[role="menuitem"]'))
        await waitFor(() => expect(separator(getRows()[0]!)).toBe('1px'))
        await expect(separator(getRows()[1]!)).not.toBe('1px')
        await expect(separator(getRows()[2]!)).toBe('1px')
        await expect(separator(getRows()[3]!)).not.toBe('1px')
        await expect(getRows()[0]!.getBoundingClientRect().height).toBe(40)
        rerender(rows(false))
        await waitFor(() => expect(separator(getRows()[2]!)).not.toBe('1px'))
    })

    it('separates table row-action items wrapped in a span', async () => {
        const { container } = mount(
            <StyledMenuList>
                <span>
                    <StyledMenuItem>View details</StyledMenuItem>
                </span>
                <span>
                    <StyledMenuItem>Remove</StyledMenuItem>
                </span>
            </StyledMenuList>,
        )
        const rows = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'))
        await waitFor(() => expect(separator(rows[0]!)).toBe('1px'))
        await expect(separator(rows[1]!)).not.toBe('1px')
    })

    // Three consumer menus (artifact AttachDocumentsMenu / ParcelAttachDocument, crm
    // WorkHistoryAttachDocument) park a hidden file input between rows; counting it as content
    // would strip the separator from the row above it.
    it('skips a hidden node between rows', async () => {
        const rows = (hidden: boolean): JSX.Element => (
            <StyledMenuList>
                <StyledMenuItem>First</StyledMenuItem>
                <input type='file' aria-label='Upload' hidden={hidden} />
                <StyledMenuItem>Last</StyledMenuItem>
            </StyledMenuList>
        )
        const { container, rerender } = mount(rows(true))
        const getRows = (): HTMLElement[] => Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'))
        await waitFor(() => expect(separator(getRows()[0]!)).toBe('1px'))
        await expect(separator(getRows()[1]!)).not.toBe('1px')

        // Visible custom content between rows is a real boundary and must break the run.
        rerender(rows(false))
        await waitFor(() => expect(separator(getRows()[0]!)).not.toBe('1px'))
    })
})

describe('StyledMenu Figma colors', () => {
    afterEach(cleanup)

    // Separator, hover, selected rest and selected hover per theme. The separator is pinned to gray-200 rather
    // than delta-200 because fretex remaps delta-200, so fretex keeps the default separator and hover gray
    // (Figma Fretex differs; its delta steps are outside ASMA-9003). Selected was gama-50 at rest before ASMA-9003.
    it.each([
        ['greenish', 'rgb(211, 216, 223)', 'rgb(240, 242, 244)', 'rgb(243, 250, 250)', 'rgb(232, 246, 246)'],
        ['fretex', 'rgb(211, 216, 223)', 'rgb(240, 242, 244)', 'rgb(247, 249, 248)', 'rgb(239, 244, 242)'],
    ])('uses the Figma separator, hover and selected fills in the %s theme', async (theme, separator, hover, selected, hoverSelected) => {
        const { container } = mount(
            <div data-theme={theme}>
                <StyledMenuList>
                    <StyledMenuItem>Enabled</StyledMenuItem>
                    <StyledMenuItem selected>Selected</StyledMenuItem>
                </StyledMenuList>
            </div>,
        )
        const rows = container.querySelectorAll<HTMLElement>('li')
        await waitFor(() => expect(getComputedStyle(rows[0]!, '::after').backgroundColor).toBe(separator))
        // Hover and selection keep master's timing (none): each fill is there at once (ASMA-9003 round 5).
        await userEvent.hover(rows[0]!)
        await expect(transitionOf(rows[0]!).duration).toBe('0s')
        await expect(getComputedStyle(rows[0]!).backgroundColor).toBe(hover)
        await expect(getComputedStyle(rows[1]!).backgroundColor).toBe(selected)
        await userEvent.hover(rows[1]!)
        await expect(getComputedStyle(rows[1]!).backgroundColor).toBe(hoverSelected)
    })

    it('shows the caller-supplied tooltip only on the row that sets it', async () => {
        /*
         * The pointer is browser state and the test before this one leaves it on row 1 of a list
         * with the same geometry, mounted in the same place. Inherited, that hover opens this
         * list's tooltip over row 0 before the test does anything — and the `hover(rows[0])` below
         * then waits out its 15s actionability budget against an overlay that will not move. The
         * nightly detector caught exactly that, 1 run in 5.
         */
        await parkPointer()
        const { container } = mount(
            <StyledMenuList>
                <StyledMenuItem>Free</StyledMenuItem>
                <StyledMenuItem selected tooltip='Allerede i bruk'>
                    Used
                </StyledMenuItem>
            </StyledMenuList>,
        )
        const rows = container.querySelectorAll<HTMLElement>('li')
        await userEvent.hover(rows[0]!)
        await expect(document.body.textContent).not.toContain('Allerede i bruk')
        await userEvent.hover(rows[1]!)
        await waitFor(() => expect(document.body.textContent).toContain('Allerede i bruk'))
    })

    it('defaults the tooltip when a checkbox is already selected', async () => {
        document.documentElement.lang = 'no'
        const { container } = mount(
            <StyledMenuList>
                <StyledMenuItem selected>Selected label</StyledMenuItem>
                <StyledMenuItem>
                    <StyledCheckbox dataTest='still-pickable' checked />
                    Pickable
                </StyledMenuItem>
                <StyledMenuItem>
                    <StyledCheckbox dataTest='taken' checked disabled />
                    Taken
                </StyledMenuItem>
            </StyledMenuList>,
        )
        const rows = container.querySelectorAll<HTMLElement>('li')
        await userEvent.hover(rows[0]!)
        await userEvent.hover(rows[1]!)
        await expect(document.body.textContent).not.toContain('Allerede lagt til')
        await userEvent.hover(rows[2]!)
        await waitFor(() => expect(document.body.textContent).toContain('Allerede lagt til'))

        document.documentElement.lang = 'en'
        cleanup()
        const english = mount(
            <StyledMenuList>
                <StyledMenuItem>
                    <StyledCheckbox dataTest='taken-en' checked disabled />
                    Taken
                </StyledMenuItem>
            </StyledMenuList>,
        )
        await userEvent.hover(english.container.querySelector('li')!)
        await waitFor(() => expect(document.body.textContent).toContain('Already added'))
        document.documentElement.lang = ''
    })
})

describe('StyledMenu shared surface consumers', () => {
    afterEach(cleanup)

    it('lets ToolbarActionGroup use shared row separators instead of hr nodes', async () => {
        const { container } = mount(
            <ToolbarActionGroup
                overflowMenuLabel='More'
                plan={{
                    inlineActions: [],
                    showMoreMenu: true,
                    overflowActions: [
                        { id: 'one', label: 'First', onClick: () => undefined },
                        { id: 'two', label: 'Second', onClick: () => undefined },
                    ],
                }}
            />,
        )
        await userEvent.click(container.querySelector('button')!)
        await waitFor(() => expect(menu()).not.toBeNull())
        await expect(menu()!.querySelector('hr')).toBeNull()
        await expect(getComputedStyle(items()[0]!, '::after').height).toBe('1px')
    })
})

describe('StyledMenu scrolling', () => {
    afterEach(cleanup)

    const ScrollMenu = ({ children }: { children: ReactNode }): JSX.Element => {
        const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
        return (
            <>
                <StyledButton dataTest='menu-trigger' onClick={(event) => setAnchorEl(event.currentTarget)}>
                    Actions
                </StyledButton>
                <StyledMenu open={!!anchorEl} anchorEl={anchorEl}>
                    {children}
                </StyledMenu>
            </>
        )
    }

    it.each([
        { name: 'navigation', Item: StyledMenuItem },
    ])('caps 12 $name rows at 7.5 and scrolls keyboard focus', async ({ Item }) => {
        const { container } = mount(
            <ScrollMenu>
                {Array.from({ length: 12 }, (_, index) => (
                    <span key={index}>
                        <Item>Action {index + 1}</Item>
                    </span>
                ))}
            </ScrollMenu>,
        )
        await openMenu(container)
        const list = menu()!
        const rows = items()
        await waitFor(() => expect(list.scrollHeight).toBeGreaterThan(list.clientHeight))
        const eighth = rows[7]!.getBoundingClientRect()
        await expect(
            Math.abs(list.getBoundingClientRect().bottom - (eighth.top + eighth.height / 2)),
        ).toBeLessThanOrEqual(1)
        await expect(getComputedStyle(list).overflowY).toBe('auto')
        await waitFor(() => expect(document.activeElement).toBe(rows[0]))
        for (let index = 1; index < rows.length; index++) await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(rows[11])
        await expect(list.scrollTop).toBeGreaterThan(0)
        await expect(rows[11]!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
            list.getBoundingClientRect().bottom + 1,
        )
        await userEvent.keyboard('{Home}')
        await expect(document.activeElement).toBe(rows[0])
        await expect(rows[0]!.getBoundingClientRect().top).toBeGreaterThanOrEqual(list.getBoundingClientRect().top)
        await userEvent.keyboard('{End}')
        await expect(document.activeElement).toBe(rows[11])
        await expect(rows[11]!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
            list.getBoundingClientRect().bottom + 1,
        )
    })

    it('measures multiline rows, ignores hidden rows, and removes the cap when only five remain', async () => {
        const content = (count: number): JSX.Element => (
            <ScrollMenu>
                <span hidden>
                    <StyledMenuItem>Hidden action</StyledMenuItem>
                </span>
                {Array.from({ length: count }, (_, index) => (
                    <StyledMenuItem key={index}>
                        <span>
                            Action {index + 1}
                            {index === 7 && (
                                <>
                                    <br />
                                    Second line
                                </>
                            )}
                        </span>
                    </StyledMenuItem>
                ))}
            </ScrollMenu>
        )
        const { container, rerender } = mount(content(12))
        await openMenu(container)
        const list = menu()!
        await waitFor(() => expect(list.scrollHeight).toBeGreaterThan(list.clientHeight))
        const eighth = items()[8]!.getBoundingClientRect()
        await expect(eighth.height).toBeGreaterThan(items()[1]!.getBoundingClientRect().height)
        await expect(
            Math.abs(list.getBoundingClientRect().bottom - (eighth.top + eighth.height / 2)),
        ).toBeLessThanOrEqual(1)
        rerender(content(5))
        await waitFor(() => expect(getComputedStyle(list).maxHeight).toBe('none'))
        await expect(list.scrollHeight).toBe(list.clientHeight)
    })

    it('leaves five rows, standalone lists, and menus with search headers uncapped', async () => {
        const rows = Array.from({ length: 12 }, (_, index) => (
            <StyledMenuItem key={index}>Action {index + 1}</StyledMenuItem>
        ))
        const { container, rerender } = mount(<ScrollMenu>{rows.slice(0, 5)}</ScrollMenu>)
        await openMenu(container)
        await expect(getComputedStyle(menu()!).maxHeight).toBe('none')
        await expect(menu()!.scrollHeight).toBe(menu()!.clientHeight)
        rerender(
            <ScrollMenu>
                <li role='presentation'>
                    <input aria-label='Search' />
                </li>
                {rows}
            </ScrollMenu>,
        )
        await waitFor(() => expect(items()).toHaveLength(12))
        await expect(getComputedStyle(menu()!).maxHeight).toBe('none')
        rerender(<StyledMenuList>{rows}</StyledMenuList>)
        await expect(getComputedStyle(menu()!).maxHeight).toBe('none')
        await expect(menu()!.scrollHeight).toBe(menu()!.clientHeight)
    })
})

/* ASMA-8963 — WCAG 4.1.2. A language picker must say which language is selected: WAI-ARIA
 * `menuitemradio` with `aria-checked`. The radio items must keep the plain items' keyboard contract.
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ */
describe('StyledMenu radio items', () => {
    afterEach(cleanup)

    const LanguageFixture = ({
        onClose,
        footer,
    }: {
        onClose?: (reason?: string) => void
        footer?: ReactNode
    }): JSX.Element => {
        const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
        return (
            <div>
                <StyledButton dataTest='menu-trigger' onClick={(event) => setAnchorEl(event.currentTarget)}>
                    Language
                </StyledButton>
                <StyledMenu
                    open={!!anchorEl}
                    anchorEl={anchorEl}
                    onClose={(_event, reason) => {
                        onClose?.(reason)
                        setAnchorEl(null)
                    }}
                >
                    <StyledMenuItem role='menuitemradio' aria-checked>
                        Norsk
                    </StyledMenuItem>
                    <StyledMenuItem role='menuitemradio' aria-checked={false}>
                        English
                    </StyledMenuItem>
                    <StyledMenuItem role='menuitemradio'>Svenska</StyledMenuItem>
                    {footer}
                </StyledMenu>
                <button type='button' data-testid='after'>
                    After
                </button>
            </div>
        )
    }

    const radios = (): HTMLElement[] =>
        Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))

    it('exposes menuitemradio with aria-checked (4.1.2)', async () => {
        const { container } = mount(<LanguageFixture />)
        await openMenu(container)

        await expect(radios()).toHaveLength(3)
        await expect(radios().map((item) => item.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false'])
        // A plain item stays a plain item.
        const { container: plain } = mount(<StyledMenuItem aria-checked>Plain</StyledMenuItem>)
        await expect(plain.querySelector('[role="menuitem"]')).not.toHaveAttribute('aria-checked')
    })

    it('focuses and arrows through radio items like plain items (2.1.1)', async () => {
        const { container } = mount(<LanguageFixture />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(radios()[0]))

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(radios()[1])
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(radios()[2])
        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(radios()[0])
        await userEvent.keyboard('{ArrowUp}')
        await expect(document.activeElement).toBe(radios()[2])
    })

    // With another control in the panel the focused item is no longer its last Tab stop, so only the
    // menu's own "Tab on a menu item closes" rule ends it (the popover's edge rule does not fire).
    it('closes on Tab from a radio item (2.1.2)', async () => {
        const onClose = fn()
        const footer = (
            <button type='button' data-testid='manage'>
                Manage
            </button>
        )
        const { container } = mount(<LanguageFixture onClose={onClose} footer={footer} />)
        await openMenu(container)
        await waitFor(() => expect(document.activeElement).toBe(radios()[0]))

        await userEvent.tab()

        await waitFor(() => expect(menu()).toBeNull())
        await expect(onClose).toHaveBeenCalledWith('tabKeyDown')
    })
})

describe('StyledMenuItem pressed state (ASMA-9003)', () => {
    afterEach(cleanup)

    it('activates once per Enter or Space press, never on key repeat (round 5 item 2)', async () => {
        const onClick = fn()
        const { container } = mount(
            <StyledMenuList>
                <StyledMenuItem role='menuitemcheckbox' aria-checked={false} onClick={onClick}>
                    Toggle
                </StyledMenuItem>
            </StyledMenuList>,
        )
        container.querySelector<HTMLElement>('[role="menuitemcheckbox"]')!.focus()
        for (const name of [' ', 'Enter'] as const) {
            await key('keyDown', name)
            await key('keyDown', name, { repeat: true })
            await key('keyDown', name, { repeat: true })
            await key('keyUp', name)
        }
        await expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('fills a pressed row gama-200 inside its own box, over the selected fill, with no bleed', async () => {
        const { container } = mount(
            <StyledMenuList>
                <StyledMenuItem>Above</StyledMenuItem>
                <StyledMenuItem selected>Selected</StyledMenuItem>
                <StyledMenuItem>
                    <StyledCheckbox dataTest='row-checkbox' checked hideWrapper decorative />
                    With checkbox
                </StyledMenuItem>
                <StyledMenuItem>Below</StyledMenuItem>
            </StyledMenuList>,
        )
        const [above, selected, withCheckbox, below] = Array.from(container.querySelectorAll<HTMLElement>('li'))
        // A pointer left over a row by an earlier test would make that row's resting fill a hover fade.
        await parkPointer()
        await waitFor(() => expect(getComputedStyle(above!).backgroundColor).toBe('rgba(0, 0, 0, 0)'))
        const gama200 = resolveTokenColor('--colors-gama-200')
        const gama700 = resolveTokenColor('--colors-gama-700')
        const restingRect = selected!.getBoundingClientRect()
        const restingOutline = getComputedStyle(selected!).outline
        const neighbours = [above!, withCheckbox!].map((row) => getComputedStyle(row).backgroundColor)

        // Master's timing at rest (none), instant in, and a 150 ms ease-out back only while marked released.
        await expect(transitionOf(selected!).duration).toBe('0s')

        await holdPressed(selected!, async () => {
            const style = getComputedStyle(selected!)
            await expect(transitionOf(selected!).duration).toBe('0s')
            // The pressed fill wins over the selected gama-25 fill; the label darkens; no fade.
            await expect(fillOf(selected!)).toBe(gama200)
            await expect(style.color).toBe(gama700)
            await expect(style.opacity).toBe('1')
            // Colour only, inside the row: same box, no outline or shadow reaching the flush neighbours.
            await expect(selected!.getBoundingClientRect().toJSON()).toEqual(restingRect.toJSON())
            await expect(style.outline).toBe(restingOutline)
            await expect(style.boxShadow).toBe('none')
            const neighboursPressed = [above!, withCheckbox!].map((row) => getComputedStyle(row).backgroundColor)
            await expect(neighboursPressed).toEqual(neighbours)
        })
        await expect(selected).toHaveAttribute('data-press-released')
        await expect(transitionOf(selected!)).toMatchObject({ duration: '0.15s', timing: 'ease-out' })

        // A row checkbox reads the accent its pressed row sets (StyledCheckbox).
        await holdPressed(withCheckbox!, async () => {
            await expect(getComputedStyle(withCheckbox!).getPropertyValue('--control-pressed-accent').trim()).toBe(
                getComputedStyle(document.documentElement).getPropertyValue('--colors-gama-700').trim(),
            )
            await expect(fillOf(below!)).not.toBe(gama200)
        })
    })

    it('shows no pressed look on a disabled row', async () => {
        const { container } = mount(
            <StyledMenuList>
                <StyledMenuItem disabled>Disabled</StyledMenuItem>
            </StyledMenuList>,
        )
        const row = container.querySelector<HTMLElement>('li')!
        const resting = getComputedStyle(row)
        const before = { backgroundColor: resting.backgroundColor, color: resting.color }

        await holdPressed(row, async () => {
            const style = getComputedStyle(row)
            await expect({ backgroundColor: fillOf(row), color: style.color }).toEqual(before)
            await expect(style.getPropertyValue('--control-pressed-accent')).toBe('')
        })
    })

    it('shows no pressed look when the arrow keys move focus (2.1.1)', async () => {
        const { container } = mount(
            <StyledMenuList>
                <StyledMenuItem>One</StyledMenuItem>
                <StyledMenuItem>Two</StyledMenuItem>
            </StyledMenuList>,
        )
        const [one, two] = Array.from(container.querySelectorAll<HTMLElement>('li'))
        one!.focus()

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(two)
        await expect(fillOf(two!)).not.toBe(resolveTokenColor('--colors-gama-200'))
    })
})
