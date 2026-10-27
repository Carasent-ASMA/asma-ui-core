import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { page } from 'vitest/browser'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, isEntirelyObscured, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import { StyledDatePicker } from 'src/datetime/components/date-picker'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { PopoverSheet, type PopoverSheetProps } from './PopoverSheet'

/**
 * Keyboard & focus contract — PopoverSheet (ASMA-8183).
 * WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 4.1.2.
 *
 * The ticket is explicit that this component has NO `role="menu"` and NO arrow-key navigation —
 * everything inside is reached with Tab. The arrow-key test below is the regression guard for that.
 */

type FixtureProps = Partial<PopoverSheetProps> & { label?: string; dataTest?: string }

const Fixture = ({ label = 'Open', dataTest = 'pop', ...props }: FixtureProps): JSX.Element => (
    <PopoverSheet
        dataTest={dataTest}
        title='Popover title'
        renderTrigger={({ ref, triggerProps }) => (
            <StyledButton dataTest={`${dataTest}-trigger`} refLink={ref} type='button' {...triggerProps}>
                {label}
            </StyledButton>
        )}
        {...props}
    >
        {props.children ?? 'Supplementary content'}
    </PopoverSheet>
)

const ActionFixture = (props: FixtureProps): JSX.Element => (
    <Fixture
        variant='action'
        resetAction={
            <StyledButton dataTest='reset' variant='text' type='button'>
                Nullstill
            </StyledButton>
        }
        {...props}
    >
        <button type='button'>First</button>
        <button type='button'>Second</button>
    </Fixture>
)

const triggerOf = (container: HTMLElement): HTMLButtonElement =>
    container.querySelector<HTMLButtonElement>('button')!

const panelOf = (dataTest = 'pop'): HTMLElement | null =>
    document.body.querySelector<HTMLElement>(`[data-test="${dataTest}"]`)

/**
 * The surface hands focus back to its trigger a frame after it closes (the dismiss fires on
 * `pointerdown`, and focusing synchronously would be undone by the rest of that click), so the check
 * waits for it rather than reading `activeElement` once — on a slow CI runner that frame may not
 * have run by the next line.
 */
const expectFocusReturnedTo = (trigger: HTMLElement): Promise<void> =>
    waitFor(() => expect(document.activeElement).toBe(trigger))

describe('PopoverSheet — trigger semantics', () => {
    afterEach(cleanup)

    it('keeps aria-expanded in sync on the trigger, both states (4.1.2)', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)

        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await userEvent.click(trigger)
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        await userEvent.keyboard('{Escape}')
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('points aria-controls at the open surface and drops it when closed', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)

        await expect(trigger).not.toHaveAttribute('aria-controls')
        await userEvent.click(trigger)
        await expect(trigger.getAttribute('aria-controls')).toBe(panelOf()!.id)
    })

    it('describes the trigger with an info surface, and marks an action surface as a dialog', async () => {
        const info = mount(<Fixture />)
        await userEvent.click(triggerOf(info.container))
        await expect(triggerOf(info.container)).not.toHaveAttribute('aria-haspopup')
        await expect(triggerOf(info.container).getAttribute('aria-describedby')).toBe(panelOf()!.id)
        info.unmount()

        const action = mount(<ActionFixture dataTest='act' />)
        await userEvent.click(triggerOf(action.container))
        await expect(triggerOf(action.container)).toHaveAttribute('aria-haspopup', 'dialog')
        await expect(triggerOf(action.container)).not.toHaveAttribute('aria-describedby')
    })

    it('opens from the keyboard with Enter on the trigger (2.1.1)', async () => {
        const { container } = mount(<Fixture />)
        triggerOf(container).focus()

        await userEvent.keyboard('{Enter}')
        await expect(panelOf()).not.toBeNull()
    })
})

describe('PopoverSheet — info variant', () => {
    afterEach(cleanup)

    it('is a plain container, not a dialog, and takes focus itself on open', async () => {
        const { container } = mount(<Fixture />)
        await userEvent.click(triggerOf(container))

        const panel = panelOf()!
        await expect(panel).not.toHaveAttribute('role')
        await expect(panel.tabIndex).toBe(-1)
        await expect(document.activeElement).toBe(panel)
    })

    it('is not trapped — Tab leaves the surface and closes it', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        // Tab off the container, past the close control, and out of the surface entirely.
        await userEvent.keyboard('{Tab}{Tab}')
        await expect(panelOf()).toBeNull()
    })

    it('returns focus to the trigger on Escape (2.4.3)', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.keyboard('{Escape}')
        await expect(panelOf()).toBeNull()
        await expectFocusReturnedTo(trigger)
    })

    it('Back closes the desktop popover through its single wrapper registration', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)
        await waitFor(() => expect(panelOf()).not.toBeNull())
        await expect(getOverlayBackStackSize()).toBe(1)

        void requestCloseTopOverlayBack()

        await waitFor(() => expect(panelOf()).toBeNull())
        await waitFor(() => expect(document.activeElement).toBe(trigger))
        await expect(getOverlayBackStackSize()).toBe(0)
    })

    it('keeps exactly one Back registration while resizing between popover and sheet', async () => {
        await page.viewport(744, 720)
        try {
            const { container } = mount(<ActionFixture />)
            await userEvent.click(triggerOf(container))
            await waitFor(() => expect(panelOf()).not.toBeNull())
            await expect(getOverlayBackStackSize()).toBe(1)

            await page.viewport(743, 720)
            await waitFor(() => expect(document.querySelector('dialog[data-test="pop"]')).not.toBeNull())
            await expect(getOverlayBackStackSize()).toBe(1)

            await page.viewport(744, 720)
            await waitFor(() => expect(document.querySelector('dialog[data-test="pop"]')).toBeNull())
            await waitFor(() => expect(panelOf()).not.toBeNull())
            await expect(getOverlayBackStackSize()).toBe(1)
        } finally {
            cleanup()
            await page.viewport(1280, 720)
        }
    })
})

describe('PopoverSheet — action variant', () => {
    afterEach(cleanup)

    it('exposes role=dialog named by its title (4.1.2)', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))

        const panel = panelOf()!
        await expect(panel).toHaveAttribute('role', 'dialog')
        await expect(panel).toHaveAccessibleName('Popover title')
    })

    it('falls back to ariaLabel when the surface has no title', async () => {
        const { container } = mount(<ActionFixture title={undefined} ariaLabel='Filtrer søknader' />)
        await userEvent.click(triggerOf(container))

        await expect(panelOf()).toHaveAccessibleName('Filtrer søknader')
    })

    it('moves focus to the first control when opened from the keyboard', async () => {
        const { container } = mount(<ActionFixture />)
        triggerOf(container).focus()
        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(document.activeElement).toHaveTextContent('First'))
    })

    it('focuses no control when opened with a pointer — focus rests on the surface itself', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))
        const panel = panelOf()!

        await waitFor(() => expect(document.activeElement).toBe(panel))
        // Two frames later it has still not moved on to a control.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await expect(document.activeElement).toBe(panel)
    })

    it('reaches the first control with one Tab after a pointer open', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))
        await waitFor(() => expect(document.activeElement).toBe(panelOf()))

        await userEvent.keyboard('{Tab}')

        await expect(document.activeElement).toHaveTextContent('First')
    })

    it('traps focus and cycles within the surface (2.1.2)', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))
        const panel = panelOf()!

        for (let press = 0; press < tabbableWithin(panel).length + 1; press += 1) {
            await userEvent.keyboard('{Tab}')
            await expect(panel.contains(document.activeElement)).toBe(true)
        }
    })

    it('tabs through the body, then the footer rows, and only then to Close (2.4.3)', async () => {
        const { container } = mount(
            <ActionFixture
                footerActions={
                    <StyledButton dataTest='footer-action' variant='outlined' type='button'>
                        Handling
                    </StyledButton>
                }
            />,
        )
        triggerOf(container).focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.activeElement).toHaveTextContent('First'))

        const order: string[] = []
        for (let press = 0; press < 5; press += 1) {
            await userEvent.keyboard('{Tab}')
            const focused = document.activeElement as HTMLElement
            order.push(focused.getAttribute('aria-label') ?? focused.textContent?.trim() ?? '')
        }

        // Close sits in the top corner, but follows the footer in the sequence — it is the last stop.
        await expect(order).toEqual(['Second', 'Nullstill', 'Handling', 'Lukk', 'First'])
    })

    it('does NOT respond to arrow keys — this is a dialog, not a menu', async () => {
        const { container } = mount(<ActionFixture />)
        await userEvent.click(triggerOf(container))
        const focusedOnOpen = document.activeElement

        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Home}{End}')

        await expect(document.activeElement).toBe(focusedOnOpen)
        await expect(panelOf()).not.toBeNull()
    })

    it('lets a footer slot close the surface too — the Figma "View results (3)" affordance', async () => {
        const { container } = mount(
            <ActionFixture
                viewResultsAction={({ close }) => (
                    <button type='button' data-testid='view-results' onClick={close}>
                        Vis resultater (3)
                    </button>
                )}
            />,
        )
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body.querySelector<HTMLButtonElement>('[data-testid="view-results"]')!)
        await expect(panelOf()).toBeNull()
        await expectFocusReturnedTo(trigger)
    })

    it('lets content close the surface via the render-prop, returning focus (Actions pattern)', async () => {
        const { container } = mount(
            <Fixture variant='action'>
                {({ close }) => (
                    <button type='button' onClick={close}>
                        Arkiver
                    </button>
                )}
            </Fixture>,
        )
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body.querySelector<HTMLButtonElement>('[data-test="pop"] button')!)
        await expect(panelOf()).toBeNull()
        await expectFocusReturnedTo(trigger)
    })
})

describe('PopoverSheet — dismissal', () => {
    afterEach(cleanup)

    it('closes from the close control and returns focus to the trigger', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body.querySelector<HTMLButtonElement>('[data-testid="pop-close"]')!)
        await expect(panelOf()).toBeNull()
        await expectFocusReturnedTo(trigger)
    })

    it('closes on an outside press and returns focus to the trigger', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await userEvent.click(document.body)
        await expect(panelOf()).toBeNull()
        await expectFocusReturnedTo(trigger)
    })

    // Regression guard for `guards={false}`: the action variant is modal, so Floating UI marks the
    // rest of the page `inert`. Inert content must still be able to swallow the dismissing press.
    it('closes the modal action variant on an outside press too', async () => {
        const { container } = mount(<ActionFixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)
        await expect(panelOf()).not.toBeNull()

        await userEvent.click(document.body)
        await expect(panelOf()).toBeNull()
    })

    it('toggles shut when the trigger itself is pressed again', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)

        await userEvent.click(trigger)
        await expect(panelOf()).not.toBeNull()
        await userEvent.click(trigger)
        await expect(panelOf()).toBeNull()
    })

    it('keeps only one popover open — opening a second closes the first', async () => {
        // Spread the triggers apart: the first popover would otherwise paint over the second
        // trigger and Playwright refuses to click through an intercepting element.
        const { container } = mount(
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 900 }}>
                <Fixture dataTest='first' label='First' />
                <Fixture dataTest='second' label='Second' />
            </div>,
        )
        const [firstTrigger, secondTrigger] = Array.from(container.querySelectorAll('button'))

        await userEvent.click(firstTrigger!)
        await expect(panelOf('first')).not.toBeNull()

        await userEvent.click(secondTrigger!)
        await expect(panelOf('first')).toBeNull()
        await expect(panelOf('second')).not.toBeNull()
    })
})

describe('PopoverSheet — focus visibility', () => {
    afterEach(cleanup)

    it('does not entirely obscure its own trigger while open (2.4.11)', async () => {
        const { container } = mount(<Fixture />)
        const trigger = triggerOf(container)
        await userEvent.click(trigger)

        await expect(panelOf()).not.toBeNull()
        await expect(isEntirelyObscured(trigger)).toBe(false)
    })
})

describe('PopoverSheet — position stability', () => {
    afterEach(cleanup)

    it('keeps its left edge when the body grows (chip wrap must not shift the sheet)', async () => {
        const GrowFixture = (): JSX.Element => {
            const [wide, setWide] = useState(false)
            return (
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: 600 }}>
                    <PopoverSheet
                        dataTest='grow-pop'
                        variant='action'
                        title='Filter'
                        renderTrigger={({ ref, triggerProps }) => (
                            <StyledButton dataTest='grow-pop-trigger' refLink={ref} type='button' {...triggerProps}>
                                Filter
                            </StyledButton>
                        )}
                    >
                        <button type='button' onClick={() => setWide(true)}>
                            Grow
                        </button>
                        <div style={{ width: wide ? 340 : 240, height: 48 }}>canvas</div>
                    </PopoverSheet>
                </div>
            )
        }

        const { container } = mount(<GrowFixture />)
        await userEvent.click(triggerOf(container))
        const panel = panelOf('grow-pop')
        await expect(panel).not.toBeNull()

        const left = panel!.getBoundingClientRect().left

        await userEvent.click(panel!.querySelector('button')!)
        await waitFor(() => expect(panel!.getBoundingClientRect().width).toBeGreaterThan(300))
        await expect(panel!.getBoundingClientRect().left).toBe(left)
    })

    const EdgeFixture = ({
        align,
        top = 40,
        rows = 1,
    }: Pick<PopoverSheetProps, 'align'> & { top?: number; rows?: number }): JSX.Element => {
        const [atRight, setAtRight] = useState(true)
        const [wideTrigger, setWideTrigger] = useState(false)
        const [bodyWidth, setBodyWidth] = useState(200)
        return (
            <>
                <button type='button' onClick={() => setAtRight(false)}>
                    Move
                </button>
                <div style={{ position: 'fixed', top, ...(atRight ? { right: 16 } : { left: 16 }) }}>
                    <PopoverSheet
                        dataTest='edge-pop'
                        variant='action'
                        title='Filter'
                        align={align}
                        renderTrigger={({ ref, triggerProps }) => (
                            <button ref={ref} type='button' style={{ width: wideTrigger ? 480 : 96 }} {...triggerProps}>
                                {wideTrigger ? 'Filter (1)' : 'Filter'}
                            </button>
                        )}
                    >
                        <button type='button' onClick={() => setWideTrigger(true)}>
                            Pick
                        </button>
                        <button type='button' onClick={() => setBodyWidth(440)}>
                            Grow
                        </button>
                        <button type='button' onClick={() => setBodyWidth(120)}>
                            Shrink
                        </button>
                        <div style={{ width: bodyWidth, height: 48 * rows }}>canvas</div>
                    </PopoverSheet>
                </div>
            </>
        )
    }

    const edgeTrigger = (container: HTMLElement): HTMLButtonElement =>
        container.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!
    const edgeButton = (panel: HTMLElement, name: string): HTMLButtonElement =>
        Array.from(panel.querySelectorAll('button')).find((button) => button.textContent === name)!

    const openEdge = async (container: HTMLElement): Promise<HTMLElement> => {
        await userEvent.click(edgeTrigger(container))
        await waitFor(() => expect(panelOf('edge-pop')).not.toBeNull())
        return panelOf('edge-pop')!
    }
    const closeEdge = async (): Promise<void> => {
        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(panelOf('edge-pop')).toBeNull())
    }
    const expectEdge = async (container: HTMLElement, panel: HTMLElement, edge: 'left' | 'right'): Promise<void> => {
        await waitFor(() =>
            expect(
                Math.abs(panel.getBoundingClientRect()[edge] - edgeTrigger(container).getBoundingClientRect()[edge]),
            ).toBeLessThanOrEqual(1),
        )
    }

    it('opens right-aligned to a trigger in the right half of the viewport', async () => {
        const { container } = mount(<EdgeFixture />)
        const panel = await openEdge(container)

        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-end'))
        await expectEdge(container, panel, 'right')
    })

    it('keeps the right alignment when the trigger label grows while open', async () => {
        const { container } = mount(<EdgeFixture />)
        const panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-end'))
        const before = panel.getBoundingClientRect()

        await userEvent.click(edgeButton(panel, 'Pick'))
        await waitFor(() => expect(edgeTrigger(container).getBoundingClientRect().width).toBe(480))
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

        const after = panel.getBoundingClientRect()
        await expect(panel).toHaveAttribute('data-placement', 'bottom-end')
        await expect(Math.abs(after.left - before.left)).toBeLessThanOrEqual(1)
        await expect(Math.abs(after.right - before.right)).toBeLessThanOrEqual(1)
    })

    it('stays right-aligned on the next open, and after a selection grew the trigger', async () => {
        const { container } = mount(<EdgeFixture />)
        let panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-end'))
        await closeEdge()

        panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-end'))
        await expectEdge(container, panel, 'right')

        await userEvent.click(edgeButton(panel, 'Pick'))
        await waitFor(() => expect(edgeTrigger(container)).toHaveTextContent('Filter (1)'))
        await closeEdge()

        panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-end'))
        await expectEdge(container, panel, 'right')
    })

    it('grows a right-aligned surface to the left, inside the viewport', async () => {
        const { container } = mount(<EdgeFixture />)
        const panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-end'))
        const width = panel.getBoundingClientRect().width

        await userEvent.click(edgeButton(panel, 'Grow'))
        await waitFor(() => expect(panel.getBoundingClientRect().width).toBeGreaterThan(width + 100))
        await expectEdge(container, panel, 'right')

        const rect = panel.getBoundingClientRect()
        await expect(panel).toHaveAttribute('data-placement', 'bottom-end')
        await expect(rect.left).toBeGreaterThanOrEqual(8)
        await expect(rect.right).toBeLessThanOrEqual(window.innerWidth - 8)
    })

    it('never narrows while open, so the anchored edge and the far edge both stay put', async () => {
        const { container } = mount(<EdgeFixture />)
        const panel = await openEdge(container)
        await userEvent.click(edgeButton(panel, 'Grow'))
        await waitFor(() => expect(panel.getBoundingClientRect().width).toBeGreaterThan(400))
        await expectEdge(container, panel, 'right')
        const grown = panel.getBoundingClientRect()

        await userEvent.click(edgeButton(panel, 'Shrink'))
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

        const after = panel.getBoundingClientRect()
        await expect(Math.abs(after.width - grown.width)).toBeLessThanOrEqual(1)
        await expect(Math.abs(after.left - grown.left)).toBeLessThanOrEqual(1)
        await expect(Math.abs(after.right - grown.right)).toBeLessThanOrEqual(1)

        await closeEdge()
        const reopened = await openEdge(container)
        await waitFor(() => expect(reopened.getBoundingClientRect().width).toBeLessThan(grown.width - 100))
    })

    it('opens left-aligned to a trigger in the left half of the viewport', async () => {
        const { container } = mount(<EdgeFixture />)
        await userEvent.click(container.querySelector('button')!)

        const panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-start'))
        await expectEdge(container, panel, 'left')
    })

    it('lets `align` override the automatic choice', async () => {
        const end = mount(<EdgeFixture align='start' />)
        let panel = await openEdge(end.container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-start'))
        end.unmount()

        const start = mount(<EdgeFixture align='end' />)
        await userEvent.click(start.container.querySelector('button')!)
        panel = await openEdge(start.container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'bottom-end'))
    })

    it('chooses the same vertical side on every open near the bottom edge', async () => {
        const { container } = mount(<EdgeFixture top={window.innerHeight - 120} rows={4} />)
        let panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'top-end'))
        const first = panel.getBoundingClientRect()
        await closeEdge()

        panel = await openEdge(container)
        await waitFor(() => expect(panel).toHaveAttribute('data-placement', 'top-end'))
        const second = panel.getBoundingClientRect()
        await expect(Math.abs(second.top - first.top)).toBeLessThanOrEqual(1)
        await expect(second.top).toBeGreaterThanOrEqual(8)
    })
})

const DAY = /^\d{1,2}$/
const calendar = (): HTMLElement | null => document.querySelector<HTMLElement>('.rdp, [role="grid"]')
const listbox = (): HTMLElement | null => document.querySelector<HTMLElement>('[role="listbox"]')
const byTestId = <E extends HTMLElement = HTMLElement>(id: string): E | null =>
    document.querySelector<E>(`[data-testid="${id}"]`)
const autocompleteInput = (): HTMLInputElement =>
    document.querySelector<HTMLInputElement>('input[data-testid="nest-ac-input"], [data-testid="nest-ac-input"] input')!

const NestedFixture = ({ ignoreOutside, last = 'none' }: { ignoreOutside?: string[]; last?: 'none' | 'date' }): JSX.Element => {
    const [status, setStatus] = useState<unknown>('a')
    const [roles, setRoles] = useState<string[]>(['Alpha', 'Bravo'])
    const [date, setDate] = useState<Date>()
    const datePicker = (
        <StyledDatePicker dataTest='nest-date' mode='single' label='Fra' selected={date} onSelect={setDate} onInputChange={setDate} />
    )
    return (
        <Fixture variant='action' ignoreOutside={ignoreOutside}>
            <StyledSelect dataTest='nest-select' name='Status' value={status} onChange={(event) => setStatus(event.target.value)}>
                <StyledSelectItem value='a'>Active</StyledSelectItem>
                <StyledSelectItem value='b'>Paused</StyledSelectItem>
            </StyledSelect>
            <StyledSelectAutocomplete<string, true, false, false>
                dataTest='nest-ac'
                multiple
                options={['Alpha', 'Bravo', 'Charlie']}
                value={roles}
                onChange={(_event, next) => setRoles(next)}
                renderInput={(params) => <StyledInputField {...params} dataTest='nest-ac-input' label='Role' />}
            />
            {last === 'none' && datePicker}
            <button type='button' onClick={() => setRoles([])}>
                Clear selection
            </button>
            {last === 'date' && datePicker}
        </Fixture>
    )
}

const openNested = async (container: HTMLElement): Promise<HTMLElement> => {
    await userEvent.click(triggerOf(container))
    await waitFor(() => expect(panelOf()).not.toBeNull())
    return panelOf()!
}

describe('PopoverSheet — nested layers', () => {
    afterEach(async () => {
        cleanup()
        document.querySelectorAll('.dx-overlay-wrapper').forEach((node) => node.remove())
        await page.viewport(1280, 720)
    })

    it('Escape in an open select closes only the listbox; the next Escape closes the popover', async () => {
        const { container } = mount(<NestedFixture />)
        await openNested(container)
        await userEvent.click(byTestId('nest-select')!)
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(listbox()).toBeNull())
        await expect(panelOf()).not.toBeNull()

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(panelOf()).toBeNull())
    })

    it('Escape in an open autocomplete closes only its listbox', async () => {
        const { container } = mount(<NestedFixture />)
        await openNested(container)
        await userEvent.click(autocompleteInput())
        await waitFor(() => expect(listbox()).not.toBeNull())

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(listbox()).toBeNull())
        await expect(panelOf()).not.toBeNull()

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(panelOf()).toBeNull())
    })

    it('Escape on the date-picker anchor closes only the calendar', async () => {
        const { container } = mount(<NestedFixture />)
        const panel = await openNested(container)
        const calendarButton = panel.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!
        calendarButton.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(calendar()).not.toBeNull())

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(calendar()).toBeNull())
        await expect(panelOf()).not.toBeNull()
        await expect(document.activeElement).toBe(calendarButton)

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(panelOf()).toBeNull())
    })

    it('Escape after opening the calendar from its anchor returns focus to the anchor, popover open', async () => {
        const { container } = mount(<NestedFixture />)
        const panel = await openNested(container)
        const calendarButton = panel.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!
        await userEvent.click(calendarButton)
        await waitFor(() => expect(calendar()).not.toBeNull())
        // Move focus into the calendar, so closing it drops focus with the removed panel.
        await userEvent.click(document.querySelector<HTMLButtonElement>('button[aria-label="Next month"]')!)

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(calendar()).toBeNull())
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))

        await expect(document.activeElement).toBe(calendarButton)
        await expect(panelOf()).not.toBeNull()
    })

    it('Escape inside the calendar closes only the calendar', async () => {
        const { container } = mount(<NestedFixture />)
        const panel = await openNested(container)
        await userEvent.click(panel.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!)
        await waitFor(() => expect(calendar()).not.toBeNull())
        const day = Array.from(calendar()!.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
            DAY.test(button.textContent?.trim() ?? ''),
        )!
        day.focus()
        await expect(document.activeElement).toBe(day)

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(calendar()).toBeNull())
        await expect(panelOf()).not.toBeNull()
    })

    it('keeps the popover open for option, chip, Clear selection and calendar-day presses', async () => {
        const { container } = mount(<NestedFixture />)
        const panel = await openNested(container)

        await userEvent.click(byTestId('nest-select')!)
        await waitFor(() => expect(listbox()).not.toBeNull())
        await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((o) => o.textContent === 'Paused')!)
        await waitFor(() => expect(listbox()).toBeNull())
        await expect(panelOf()).not.toBeNull()

        await userEvent.click(byTestId('selected-chip-Alpha-delete')!)
        await waitFor(() => expect(byTestId('selected-chip-Alpha')).toBeNull())
        await expect(byTestId('selected-chip-Bravo')).not.toBeNull()
        await expect(panelOf()).not.toBeNull()

        await userEvent.click(Array.from(panel.querySelectorAll('button')).find((b) => b.textContent === 'Clear selection')!)
        await waitFor(() => expect(byTestId('selected-chip-Bravo')).toBeNull())
        await expect(panelOf()).not.toBeNull()

        await userEvent.click(panel.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!)
        await waitFor(() => expect(calendar()).not.toBeNull())
        const day = Array.from(calendar()!.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
            DAY.test(button.textContent?.trim() ?? ''),
        )!
        await userEvent.click(day)
        await expect(panelOf()).not.toBeNull()
    })

    it('treats a non-React overlay matching `ignoreOutside` as inside, and a real outside press as outside', async () => {
        const { container } = mount(<NestedFixture ignoreOutside={['.dx-overlay-wrapper']} />)
        await openNested(container)
        const overlay = document.createElement('div')
        overlay.className = 'dx-overlay-wrapper'
        Object.assign(overlay.style, { position: 'fixed', left: '0', top: '600px', width: '200px', height: '60px' })
        const overlayButton = document.createElement('button')
        overlayButton.textContent = 'DevExtreme item'
        overlay.append(overlayButton)
        document.body.append(overlay)

        await userEvent.click(overlayButton)
        await expect(panelOf()).not.toBeNull()

        await userEvent.click(document.body, { position: { x: 1200, y: 700 } })
        await waitFor(() => expect(panelOf()).toBeNull())
    })

    it('Escape in the full-screen picker (wide but at most 480px high) closes only the picker', async () => {
        await page.viewport(1280, 460)
        const { container } = mount(<NestedFixture />)
        await openNested(container)
        await userEvent.click(autocompleteInput())
        const picker = (): HTMLDialogElement | null => document.querySelector<HTMLDialogElement>('dialog[data-testid="nest-ac-picker"]')
        await waitFor(() => expect(picker()).not.toBeNull())

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(picker()).toBeNull())
        await expect(panelOf()).not.toBeNull()
    })

    it('Tab out of the calendar\'s last control lands on the next control of the trapped panel', async () => {
        const { container } = mount(<NestedFixture last='date' />)
        const panel = await openNested(container)
        await userEvent.click(panel.querySelector<HTMLButtonElement>('button[aria-label="Open calendar"]')!)
        await waitFor(() => expect(calendar()).not.toBeNull())
        const inCalendar = tabbableWithin(calendar()!.closest<HTMLElement>('[data-floating-ui-portal]')!)
        inCalendar[inCalendar.length - 1]!.focus()

        await userEvent.keyboard('{Tab}')

        // The date field is the last body control, so the next stop is the close control — the trap
        // must not wrap a second time on the same keystroke.
        await waitFor(() => expect(document.activeElement).toBe(byTestId('pop-close')))
        await expect(panelOf()).not.toBeNull()
    })

    it('pulls focus back when it lands outside, but lets it into portalled children', async () => {
        const { container } = mount(
            <>
                <button type='button' data-testid='page-button'>
                    Page
                </button>
                <NestedFixture />
            </>,
        )
        await userEvent.click(container.querySelector<HTMLButtonElement>('[aria-expanded]')!)
        await waitFor(() => expect(panelOf()).not.toBeNull())
        const panel = panelOf()!
        await userEvent.click(autocompleteInput())
        await waitFor(() => expect(listbox()).not.toBeNull())
        await expect(document.activeElement).toBe(autocompleteInput())
        await expect(panel.contains(document.activeElement)).toBe(true)

        const selectTrigger = autocompleteInput()

        byTestId('page-button')!.focus()
        // Back to the control that last had focus in the panel, not to the first one.
        await waitFor(() => expect(document.activeElement).toBe(selectTrigger))
    })

    it('Back closes the innermost open layer first (#271)', async () => {
        const { container } = mount(<NestedFixture />)
        await openNested(container)
        await userEvent.click(byTestId('nest-select')!)
        await waitFor(() => expect(listbox()).not.toBeNull())

        void requestCloseTopOverlayBack()
        await waitFor(() => expect(listbox()).toBeNull())
        await expect(panelOf()).not.toBeNull()

        void requestCloseTopOverlayBack()
        await waitFor(() => expect(panelOf()).toBeNull())
    })
})

describe('PopoverSheet — info variant with portalled children', () => {
    afterEach(cleanup)

    it('stays open when focus moves into a portalled tooltip', async () => {
        const { container } = mount(
            <Fixture>
                <StyledTooltip open title={<button type='button' data-testid='tip-action'>Read more</button>}>
                    <span>Term</span>
                </StyledTooltip>
            </Fixture>,
        )
        await userEvent.click(triggerOf(container))
        await waitFor(() => expect(byTestId('tip-action')).not.toBeNull())
        await expect(panelOf()!.contains(byTestId('tip-action'))).toBe(false)

        byTestId('tip-action')!.focus()
        await expect(document.activeElement).toBe(byTestId('tip-action'))
        await expect(panelOf()).not.toBeNull()
    })

    it('still closes when focus moves to the page', async () => {
        const { container } = mount(
            <>
                <button type='button' data-testid='page-button'>
                    Page
                </button>
                <Fixture />
            </>,
        )
        await userEvent.click(container.querySelector<HTMLButtonElement>('[aria-expanded]')!)
        await waitFor(() => expect(panelOf()).not.toBeNull())

        byTestId('page-button')!.focus()
        await waitFor(() => expect(panelOf()).toBeNull())
    })
})

describe('PopoverSheet — surface edge', () => {
    afterEach(cleanup)

    it('paints the 1px edge above the Close button, so its hover fill cannot cover it', async () => {
        const { container } = mount(<Fixture />)
        await userEvent.click(triggerOf(container))
        const panel = panelOf()
        await expect(panel).not.toBeNull()

        const close = panel!.querySelector<HTMLButtonElement>('[data-testid="pop-close"]')!
        const edge = panel!.querySelector<HTMLElement>('[data-test="pop-edge"]')!
        await userEvent.hover(close)

        const edgeStyle = getComputedStyle(edge)
        await expect(edgeStyle.position).toBe('absolute')
        await expect(edgeStyle.pointerEvents).toBe('none')
        await expect(edgeStyle.boxShadow).toMatch(/inset/)
        await expect(getComputedStyle(panel!).boxShadow).not.toMatch(/inset/)
        await expect(close.compareDocumentPosition(edge) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

        const panelRect = panel!.getBoundingClientRect()
        const edgeRect = edge.getBoundingClientRect()
        await expect([edgeRect.top, edgeRect.right, edgeRect.width, edgeRect.height]).toEqual([
            panelRect.top,
            panelRect.right,
            panelRect.width,
            panelRect.height,
        ])
    })
})
