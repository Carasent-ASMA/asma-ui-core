import { useState } from 'react'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import {
    getOverlayBackStackSize,
    registerOverlayBackCloser,
    requestCloseTopOverlayBack,
} from 'src/hooks/useBackCloses.hook'
import { cleanup, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledDialog } from 'src/components/feedback/dialog/StyledDialog'
import { StyledDialogContent } from 'src/components/feedback/dialog/StyledDialogContent'
import { StyledDrawer } from 'src/components/navigation/drawer/StyledDrawer'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'
import { PopoverSheet, type PopoverSheetProps } from '../popover/PopoverSheet'
import { StyledBottomSheet } from './StyledBottomSheet'

/**
 * Keyboard, focus and dismissal contract — StyledBottomSheet (ASMA-8184), exercised the way it ships:
 * as the mobile (0–743px) form of `PopoverSheet variant='action'`.
 * WCAG 2.1.2, 2.4.3, 2.5.7, 3.2.2, 4.1.2, 4.1.3, 1.3.4.
 */

const PHONE = { width: 375, height: 812 }
// Narrower than 744px, so it is still the sheet; a phone landscape wider than that gets the anchored popover.
const PHONE_LANDSCAPE = { width: 667, height: 375 }
const DESKTOP = { width: 1280, height: 720 }

type FixtureProps = Partial<PopoverSheetProps>

const FilterFixture = (props: FixtureProps): JSX.Element => {
    const [count, setCount] = useState(248)
    return (
        <PopoverSheet
            dataTest='sheet'
            variant='action'
            title='Filtrer søknader'
            resultCount={count}
            locale='no'
            renderTrigger={({ ref, triggerProps }) => (
                <StyledButton dataTest='sheet-trigger' refLink={ref} type='button' {...triggerProps}>
                    Filter
                </StyledButton>
            )}
            resetAction={
                <StyledButton dataTest='sheet-reset' type='button' variant='text'>
                    Nullstill
                </StyledButton>
            }
            {...props}
        >
            <button type='button' data-testid='narrow' onClick={() => setCount(12)}>
                Kun aktive
            </button>
            <button type='button' data-testid='empty' onClick={() => setCount(0)}>
                Ingen
            </button>
            <button type='button' data-testid='huge' onClick={() => setCount(123456)}>
                Alle
            </button>
        </PopoverSheet>
    )
}

const trigger = (): HTMLButtonElement => document.querySelector<HTMLButtonElement>('[data-testid="sheet-trigger"]')!
const sheet = (): HTMLDialogElement | null => document.querySelector<HTMLDialogElement>('dialog[data-test="sheet"]')
const byTestId = <T extends HTMLElement = HTMLElement>(id: string): T =>
    document.querySelector<T>(`[data-testid="${id}"]`)!

const openSheet = async (): Promise<HTMLDialogElement> => {
    await userEvent.click(trigger())
    await waitFor(() => expect(sheet()).not.toBeNull())
    return sheet()!
}

describe('StyledBottomSheet — as the mobile Action popover', () => {
    let previousShell: Window['__ASMA__SHELL__']
    beforeEach(async () => {
        previousShell = window.__ASMA__SHELL__
        window.__ASMA__SHELL__ = {
            ...previousShell,
            overlayBack: { ...previousShell?.overlayBack, v: 1, enabled: true },
        }
        await page.viewport(PHONE.width, PHONE.height)
    })
    afterEach(async () => {
        cleanup()
        window.__ASMA__SHELL__ = previousShell
        await page.viewport(DESKTOP.width, DESKTOP.height)
    })

    it('renders an action popover as a modal sheet below 744px', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()

        await expect(dialog.open).toBe(true)
        await expect(getOverlayBackStackSize()).toBe(1)
        await expect(dialog).toHaveAttribute('aria-modal', 'true')
        await expect(dialog).toHaveAccessibleName('Filtrer søknader')
        await expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog')
        await expect(trigger()).toHaveAttribute('aria-expanded', 'true')
        await expect(trigger().getAttribute('aria-controls')).toBe(dialog.id)
    })

    it('keeps an info popover anchored on mobile — no sheet', async () => {
        mount(<FilterFixture variant='info' />)
        await userEvent.click(trigger())

        await waitFor(() => expect(document.querySelector('[data-test="sheet"]')).not.toBeNull())
        await expect(sheet()).toBeNull()
    })

    it('moves focus to the sheet itself on open, so the title is announced first', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()

        await waitFor(() => expect(document.activeElement).toBe(dialog))
    })

    it('traps focus and wraps with Tab (2.1.2)', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        await waitFor(() => expect(document.activeElement).toBe(dialog))

        for (let press = 0; press < tabbableWithin(dialog).length + 2; press += 1) {
            await userEvent.keyboard('{Tab}')
            await expect(dialog.contains(document.activeElement)).toBe(true)
        }
    })

    it('makes the page behind inert — the trigger cannot take focus while open', async () => {
        mount(<FilterFixture />)
        await openSheet()

        trigger().focus()
        await expect(document.activeElement).not.toBe(trigger())
    })

    it('locks page scroll while open and releases it on close', async () => {
        mount(<FilterFixture />)
        await openSheet()
        await expect(document.body.style.overflow).toBe('hidden')

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(sheet()).toBeNull())
        await expect(document.body.style.overflow).toBe('')
    })

    describe('every dismiss route closes it and returns focus to the trigger', () => {
        it('Escape', async () => {
            mount(<FilterFixture />)
            await openSheet()
            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })

        it('returns focus to the trigger, not to a focusable container that held focus on open', async () => {
            // Safari never focuses a tapped button: focus goes to its nearest focusable ancestor, such as
            // a dialog's scrollable content, and returning there painted that container's focus ring.
            mount(
                <StyledDialogContent>
                    <FilterFixture />
                </StyledDialogContent>,
            )
            document.querySelector<HTMLElement>('[data-test="styled-dialog-content"]')!.focus()
            trigger().click()
            await waitFor(() => expect(sheet()).not.toBeNull())

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })

        it('returns focus without a ring after a pointer close, and with one after Escape', async () => {
            // Chromium already hides the ring after a pointer press, so the option is what Safari needs.
            const focus = vi.spyOn(HTMLElement.prototype, 'focus')
            mount(<FilterFixture />)

            await openSheet()
            await userEvent.click(byTestId('sheet-close'))
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
            await expect(focus.mock.contexts.at(-1)).toBe(trigger())
            await expect(focus.mock.lastCall?.[0]).toMatchObject({ focusVisible: false })

            await openSheet()
            await userEvent.keyboard('{Escape}')
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
            await expect(focus.mock.lastCall?.[0]).toMatchObject({ focusVisible: true })
            focus.mockRestore()
        })

        it('Escape still closes the sheet while the overlay Back feature is disabled', async () => {
            window.__ASMA__SHELL__!.overlayBack!.enabled = false
            mount(<FilterFixture />)
            await openSheet()

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })

        it('Escape closes a nested select without also closing the sheet', async () => {
            mount(
                <PopoverSheet
                    dataTest='sheet'
                    variant='action'
                    title='Filter'
                    renderTrigger={({ ref, triggerProps }) => (
                        <StyledButton dataTest='sheet-trigger' refLink={ref} type='button' {...triggerProps}>
                            Filter
                        </StyledButton>
                    )}
                >
                    <StyledSelect dataTest='nested-select' name='Status' value='active'>
                        <StyledSelectItem value='active'>Active</StyledSelectItem>
                        <StyledSelectItem value='paused'>Paused</StyledSelectItem>
                    </StyledSelect>
                </PopoverSheet>,
            )
            await openSheet()
            const select = document.querySelector<HTMLButtonElement>('[data-testid="nested-select"]')!
            select.focus()
            await userEvent.keyboard('{ArrowDown}')
            await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
            await expect(sheet()).not.toBeNull()
        })

        it('a nested Escape-owned cancel does not request a second registry close', async () => {
            mount(<FilterFixture />)
            const dialog = await openSheet()
            const nestedControl = byTestId('narrow')
            nestedControl.addEventListener('keydown', (event) => event.stopPropagation())
            const topClose = fn()
            const unregisterTop = registerOverlayBackCloser(topClose)

            nestedControl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
            dialog.dispatchEvent(new Event('cancel', { cancelable: true }))

            await expect(topClose).not.toHaveBeenCalled()
            await expect(sheet()).not.toBeNull()
            unregisterTop()
        })

        it('Escape closes a sheet nested in a dialog exactly once', async () => {
            const closeDialog = fn()
            const closeSheet = fn()
            const Fixture = (): JSX.Element => {
                const [sheetOpen, setSheetOpen] = useState(true)
                return (
                    <StyledDialog dataTest='outer-dialog' dialogTitle='Outer' open onClose={closeDialog}>
                        <StyledBottomSheet
                            dataTest='sheet'
                            open={sheetOpen}
                            onClose={(reason) => {
                                closeSheet(reason)
                                setSheetOpen(false)
                            }}
                        >
                            Content
                        </StyledBottomSheet>
                    </StyledDialog>
                )
            }
            mount(<Fixture />)
            const dialog = await waitFor(() => {
                const node = sheet()
                if (!node) throw new Error('sheet not mounted')
                return node
            })
            dialog.focus()

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(sheet()).toBeNull())
            await expect(closeSheet).toHaveBeenCalledTimes(1)
            await expect(closeSheet).toHaveBeenCalledWith('escape')
            await expect(closeDialog).not.toHaveBeenCalled()
        })

        it('Back closes an initially-open drawer before its parent sheet', async () => {
            const closeSheet = fn()
            const Fixture = (): JSX.Element => {
                const [drawerOpen, setDrawerOpen] = useState(true)
                return (
                    <StyledBottomSheet dataTest='sheet' open onClose={closeSheet}>
                        <StyledDrawer open={drawerOpen} variant='temporary' onClose={() => setDrawerOpen(false)}>
                            <StyledButton dataTest='drawer-control'>Drawer control</StyledButton>
                        </StyledDrawer>
                    </StyledBottomSheet>
                )
            }
            mount(<Fixture />)
            await waitFor(() => expect(document.querySelector('[data-testid="drawer-control"]')).not.toBeNull())

            void requestCloseTopOverlayBack()

            await waitFor(() => expect(document.querySelector('[data-testid="drawer-control"]')).toBeNull())
            await expect(sheet()).not.toBeNull()
            await expect(closeSheet).not.toHaveBeenCalled()
        })

        it('a native dialog cancel', async () => {
            mount(<FilterFixture />)
            const dialog = await openSheet()
            dialog.dispatchEvent(new Event('cancel', { cancelable: true }))

            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })

        it('the host kill switch preserves the sheet’s pre-feature native cancel behavior', async () => {
            window.__ASMA__SHELL__!.overlayBack!.enabled = false
            mount(<FilterFixture />)
            const dialog = await openSheet()
            const cancelEvent = new Event('cancel', { cancelable: true })

            dialog.dispatchEvent(cancelEvent)

            await expect(cancelEvent.defaultPrevented).toBe(true)
            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })

        it('the close button', async () => {
            mount(<FilterFixture />)
            await openSheet()
            await userEvent.click(byTestId('sheet-close'))

            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })

        it('the scrim', async () => {
            mount(<FilterFixture />)
            await openSheet()
            byTestId('sheet-scrim').click()

            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })

        it('"Vis resultater"', async () => {
            mount(<FilterFixture />)
            await openSheet()
            await userEvent.click(byTestId('sheet-view-results'))

            await waitFor(() => expect(sheet()).toBeNull())
            await waitFor(() => expect(document.activeElement).toBe(trigger()))
        })
    })

    it('keeps the sheet open and focus put when a filter changes (3.2.2)', async () => {
        mount(<FilterFixture />)
        await openSheet()
        const control = byTestId('narrow')
        await userEvent.click(control)

        await expect(sheet()).not.toBeNull()
        await expect(document.activeElement).toBe(control)
    })

    it('shows the unfiltered total from the start, then the debounced filtered count', async () => {
        mount(<FilterFixture />)
        await openSheet()
        const button = byTestId('sheet-view-results')
        await expect(button).toHaveTextContent('Vis resultater (248)')

        await userEvent.click(byTestId('narrow'))
        // Debounced ~500ms: the previous number stays up in the meantime, never blank.
        await expect(button).toHaveTextContent('Vis resultater (248)')
        await waitFor(() => expect(button).toHaveTextContent('Vis resultater (12)'), { timeout: 1500 })
        await expect(button).toHaveAccessibleName('Vis resultater (12)')
    })

    it('announces the count from a live region inside the sheet (4.1.3)', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const status = dialog.querySelector('[role="status"][aria-live="polite"]')!

        await userEvent.click(byTestId('narrow'))
        await waitFor(() => expect(status).toHaveTextContent('Vis resultater (12)'), { timeout: 1500 })
    })

    it('reads "Ingen treff" at zero and stays enabled; caps large counts at 9999+', async () => {
        mount(<FilterFixture />)
        await openSheet()
        const button = byTestId<HTMLButtonElement>('sheet-view-results')

        await userEvent.click(byTestId('empty'))
        await waitFor(() => expect(button).toHaveTextContent('Ingen treff'), { timeout: 1500 })
        await expect(button.disabled).toBe(false)

        await userEvent.click(byTestId('huge'))
        await waitFor(() => expect(button).toHaveTextContent('Vis resultater (9999+)'), { timeout: 1500 })
    })

    it('reads the result and close labels in English when locale is en', async () => {
        mount(<FilterFixture locale='en' />)
        await openSheet()
        const button = byTestId('sheet-view-results')
        await expect(button).toHaveTextContent('View results (248)')
        await expect(byTestId('sheet-close')).toHaveAccessibleName('Close')

        await userEvent.click(byTestId('empty'))
        await waitFor(() => expect(button).toHaveTextContent('No matches'), { timeout: 1500 })
    })

    it('does not respond to arrow keys — a dialog, not a menu', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        await waitFor(() => expect(document.activeElement).toBe(dialog))

        await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}')
        await expect(document.activeElement).toBe(dialog)
        await expect(sheet()).not.toBeNull()
    })

    it('keeps the grabber out of the accessibility tree and the tab order', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const grabber = dialog.querySelector('[data-testid="sheet-drag-handle"]')!

        await expect(grabber).toHaveAttribute('aria-hidden', 'true')
        await expect(tabbableWithin(dialog)).not.toContain(grabber)
    })
})

describe('StyledBottomSheet — drag to dismiss (2.5.7)', () => {
    beforeEach(async () => {
        await page.viewport(PHONE.width, PHONE.height)
    })
    afterEach(async () => {
        cleanup()
        await page.viewport(DESKTOP.width, DESKTOP.height)
    })

    /** A slow drag: the finger rests before it lifts, so the release is no fling. */
    const drag = async (handle: Element, fromY: number, toY: number): Promise<void> => {
        const init = { bubbles: true, pointerId: 7, pointerType: 'touch', clientX: 100 }
        handle.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: fromY }))
        handle.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: toY }))
        await new Promise((resolve) => setTimeout(resolve, 150))
        handle.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: toY }))
    }

    const handleOf = (dialog: HTMLDialogElement): Element => dialog.querySelector('.touch-none')!

    it('dismisses when dragged down past 30% of the sheet height', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const sheetHeight = dialog.querySelector('[data-state]')!.getBoundingClientRect().height

        await drag(handleOf(dialog), 100, 100 + sheetHeight * 0.4)
        await waitFor(() => expect(sheet()).toBeNull())
    })

    it('dismisses on a quick fling down, however short', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const init = { bubbles: true, pointerId: 8, pointerType: 'touch', clientX: 100 }
        const handle = handleOf(dialog)
        handle.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: 100 }))
        handle.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: 130 }))
        handle.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: 130 }))
        await waitFor(() => expect(sheet()).toBeNull())
    })

    it('fades the scrim with the sheet while it is dragged down', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const sheetHeight = dialog.querySelector('[data-state]')!.getBoundingClientRect().height
        const init = { bubbles: true, pointerId: 9, pointerType: 'touch', clientX: 100 }
        const handle = handleOf(dialog)
        handle.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: 100 }))
        handle.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: 100 + sheetHeight / 2 }))
        const scrim = dialog.querySelector<HTMLElement>('[data-testid$="-scrim"]')!
        await waitFor(() => expect(Number(getComputedStyle(scrim).opacity)).toBeCloseTo(0.5, 1))
        handle.dispatchEvent(new PointerEvent('pointercancel', { ...init, clientY: 100 + sheetHeight / 2 }))
    })

    it('slides out before the dialog closes', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        await userEvent.click(byTestId('sheet-close'))
        await expect(dialog.open).toBe(true)
        await expect(dialog.querySelector('[data-state]')).toHaveAttribute('data-state', 'closed')
        await waitFor(() => expect(sheet()).toBeNull())
    })

    it('follows a touch that pulls the body down from its top, and dismisses past 30%', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const sheetHeight = dialog.querySelector('[data-state]')!.getBoundingClientRect().height
        const body = dialog.querySelector<HTMLElement>('.overflow-y-auto')!
        const touch = (type: string, y: number): void => {
            const point = new Touch({ identifier: 1, target: body, clientX: 100, clientY: y })
            body.dispatchEvent(
                new TouchEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    touches: type === 'touchend' ? [] : [point],
                    changedTouches: [point],
                }),
            )
        }
        touch('touchstart', 300)
        touch('touchmove', 310)
        touch('touchmove', 310 + sheetHeight * 0.4)
        await waitFor(() =>
            expect(getComputedStyle(dialog.querySelector('[data-state]')!).transform).not.toBe('none'),
        )
        await new Promise((resolve) => setTimeout(resolve, 150))
        touch('touchend', 310 + sheetHeight * 0.4)
        await waitFor(() => expect(sheet()).toBeNull())
    })

    it('snaps back when released before 30%', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const sheetHeight = dialog.querySelector('[data-state]')!.getBoundingClientRect().height

        await drag(handleOf(dialog), 100, 100 + sheetHeight * 0.1)
        await new Promise((resolve) => setTimeout(resolve, 400))
        await expect(sheet()).not.toBeNull()
        await expect(sheet()!.querySelector('[data-state]')).toHaveAttribute('data-state', 'open')
    })
})

describe('StyledBottomSheet — landscape phone (1.3.4)', () => {
    beforeEach(async () => {
        await page.viewport(PHONE_LANDSCAPE.width, PHONE_LANDSCAPE.height)
    })
    afterEach(async () => {
        cleanup()
        await page.viewport(DESKTOP.width, DESKTOP.height)
    })

    it('becomes a full-screen dialog when the viewport is 480px tall or less', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const container = dialog.querySelector('[data-state]')!

        await waitFor(() => expect(Math.round(container.getBoundingClientRect().height)).toBe(PHONE_LANDSCAPE.height))
        await expect(getComputedStyle(container).borderTopLeftRadius).toBe('0px')
    })
})

describe('StyledBottomSheet — heights and the drag handle (Figma DS_draft 7-10991)', () => {
    beforeEach(async () => {
        await page.viewport(PHONE.width, PHONE.height)
    })
    afterEach(async () => {
        cleanup()
        await page.viewport(DESKTOP.width, DESKTOP.height)
    })

    const HeightFixture = ({ rows, onBack }: { rows: number; onBack?: () => void }): JSX.Element => (
        <StyledBottomSheet
            dataTest='hs'
            open
            onClose={() => undefined}
            title='Filter'
            titleIcon={<svg data-testid='hs-icon' width={20} height={20} />}
            onBack={onBack}
            resultCount={3}
        >
            {Array.from({ length: rows }, (_, index) => (
                <div key={index} style={{ height: 48, flexShrink: 0 }}>
                    Row {index}
                </div>
            ))}
        </StyledBottomSheet>
    )

    const panel = (): HTMLElement => document.querySelector<HTMLElement>('dialog[data-test="hs"] [data-state]')!
    const handle = (): HTMLElement => document.querySelector<HTMLElement>('[data-testid="hs-drag-handle"]')!

    it('draws the drag handle as a 32 x 4 bar', async () => {
        mount(<HeightFixture rows={2} />)
        await waitFor(() => expect(handle()).not.toBeNull())
        const bar = handle().matches('button') ? handle().querySelector('span')! : handle()
        const rect = bar.getBoundingClientRect()
        await expect([rect.width, rect.height]).toEqual([32, 4])
    })

    it('is as short as its content and keeps a decorative handle when the content fits half the screen', async () => {
        mount(<HeightFixture rows={2} />)
        await waitFor(() => expect(panel()).not.toBeNull())
        await expect(panel().getBoundingClientRect().height).toBeLessThan(PHONE.height / 2)
        await expect(handle()).toHaveAttribute('aria-hidden', 'true')
        await expect(tabbableWithin(document.querySelector('dialog')!)).not.toContain(handle())
    })

    it('opens at half the screen and toggles to 90vh from the keyboard when the content needs more', async () => {
        mount(<HeightFixture rows={30} />)
        await waitFor(() => expect(handle().tagName).toBe('BUTTON'))
        await expect(panel().getBoundingClientRect().height).toBeLessThanOrEqual(PHONE.height / 2 + 1)
        await expect(handle()).toHaveAttribute('aria-expanded', 'false')

        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).toBe(handle())

        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'true'))
        await waitFor(() => expect(panel().getBoundingClientRect().height).toBeGreaterThan(PHONE.height / 2 + 1))
        await expect(panel().getBoundingClientRect().height).toBeLessThanOrEqual(PHONE.height * 0.9 + 1)

        await userEvent.keyboard(' ')
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'false'))
        await waitFor(() => expect(panel().getBoundingClientRect().height).toBeLessThanOrEqual(PHONE.height / 2 + 1))
    })

    it('grows with content the user adds from inside the sheet instead of scrolling at half height', async () => {
        const GrowingFixture = (): JSX.Element => {
            const [rows, setRows] = useState(2)
            return (
                <StyledBottomSheet dataTest='hs' open onClose={() => undefined} title='Filter' resultCount={3}>
                    <button type='button' data-testid='hs-add' onClick={() => setRows(7)}>
                        Add
                    </button>
                    {Array.from({ length: rows }, (_, index) => (
                        <div key={index} style={{ height: 48, flexShrink: 0 }}>
                            Row {index}
                        </div>
                    ))}
                </StyledBottomSheet>
            )
        }
        mount(<GrowingFixture />)
        await waitFor(() => expect(byTestId('hs-add')).not.toBeNull())
        await expect(panel().getBoundingClientRect().height).toBeLessThan(PHONE.height / 2)

        await userEvent.click(byTestId('hs-add'))
        await waitFor(() => expect(panel().getBoundingClientRect().height).toBeGreaterThan(PHONE.height / 2 + 1))
        const body = panel().querySelector<HTMLElement>('.overflow-y-auto')!
        await waitFor(() => expect(body.scrollHeight).toBeLessThanOrEqual(body.clientHeight + 1))
        await expect(panel().getBoundingClientRect().height).toBeLessThanOrEqual(PHONE.height * 0.9 + 1)
    })

    it('expands when the handle row is dragged up by 48px or more', async () => {
        mount(<HeightFixture rows={30} />)
        await waitFor(() => expect(handle().tagName).toBe('BUTTON'))
        const row = handle().parentElement!
        const init = { bubbles: true, pointerId: 9, pointerType: 'touch', clientX: 100 }
        row.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: 500 }))
        row.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: 440 }))
        row.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: 440 }))
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'true'))
    })

    it('follows the finger while the handle is dragged up, then settles at the expanded height', async () => {
        mount(<HeightFixture rows={30} />)
        await waitFor(() => expect(handle().tagName).toBe('BUTTON'))
        const start = panel().getBoundingClientRect().height
        const row = handle().parentElement!
        const init = { bubbles: true, pointerId: 11, pointerType: 'touch', clientX: 100 }
        row.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: 500 }))
        row.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: 420 }))
        await waitFor(() => expect(Math.round(panel().getBoundingClientRect().height)).toBe(Math.round(start + 80)))
        await expect(getComputedStyle(panel()).transitionProperty).not.toContain('max-height')

        row.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: 420 }))
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'true'))
        await expect(getComputedStyle(panel()).transitionProperty).toContain('max-height')
        await waitFor(() => expect(panel().getBoundingClientRect().height).toBeGreaterThan(start + 80))
        await waitFor(() => expect(panel().getBoundingClientRect().height).toBeLessThanOrEqual(PHONE.height * 0.9 + 1))
    })

    it('still expands when the lift reaches the end of content that fits in 90vh', async () => {
        mount(<HeightFixture rows={7} />)
        await waitFor(() => expect(handle().tagName).toBe('BUTTON'))
        const row = handle().parentElement!
        const init = { bubbles: true, pointerId: 13, pointerType: 'touch', clientX: 100 }
        row.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: 500 }))
        row.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: 200 }))
        const body = panel().querySelector<HTMLElement>('.overflow-y-auto')!
        await waitFor(() => expect(body.scrollHeight).toBeLessThanOrEqual(body.clientHeight + 1))
        await waitFor(() => expect(handle().tagName).not.toBe('BUTTON'))

        row.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: 200 }))
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'true'))
        await waitFor(() => expect(panel().getBoundingClientRect().height).toBeGreaterThan(PHONE.height / 2 + 1))
    })

    it('returns from the expanded height to half when dragged down, and closes only below half', async () => {
        mount(<HeightFixture rows={30} />)
        await waitFor(() => expect(handle().tagName).toBe('BUTTON'))
        const half = panel().getBoundingClientRect().height
        await userEvent.click(handle())
        await waitFor(() => expect(panel().getBoundingClientRect().height).toBeGreaterThan(half + 100))
        await new Promise((resolve) => setTimeout(resolve, 300))
        const row = handle().parentElement!
        const init = { bubbles: true, pointerId: 14, pointerType: 'touch', clientX: 100 }
        const slowDrag = async (from: number, to: number): Promise<void> => {
            row.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: from }))
            row.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: to }))
            await new Promise((resolve) => setTimeout(resolve, 150))
            row.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: to }))
        }

        await slowDrag(100, 200)
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'false'))
        await waitFor(() => expect(Math.round(panel().getBoundingClientRect().height)).toBe(Math.round(half)))
        await expect(document.querySelector('dialog[data-test="hs"]')).not.toBeNull()
    })

    it('collapses an expanded sheet on a quick fling down instead of closing it', async () => {
        mount(<HeightFixture rows={30} />)
        await waitFor(() => expect(handle().tagName).toBe('BUTTON'))
        await userEvent.click(handle())
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'true'))
        await new Promise((resolve) => setTimeout(resolve, 300))
        const row = handle().parentElement!
        const init = { bubbles: true, pointerId: 15, pointerType: 'touch', clientX: 100 }
        row.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: 100 }))
        row.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: 140 }))
        row.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: 140 }))
        await waitFor(() => expect(handle()).toHaveAttribute('aria-expanded', 'false'))
        await expect(document.querySelector('dialog[data-test="hs"]')).not.toBeNull()
    })

    it('settles back when the handle is released before 48px up', async () => {
        mount(<HeightFixture rows={30} />)
        await waitFor(() => expect(handle().tagName).toBe('BUTTON'))
        const start = panel().getBoundingClientRect().height
        const row = handle().parentElement!
        const init = { bubbles: true, pointerId: 12, pointerType: 'touch', clientX: 100 }
        row.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: 500 }))
        row.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: 470 }))
        await waitFor(() => expect(Math.round(panel().getBoundingClientRect().height)).toBe(Math.round(start + 30)))
        await new Promise((resolve) => setTimeout(resolve, 150))
        row.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: 470 }))
        await expect(handle()).toHaveAttribute('aria-expanded', 'false')
        await waitFor(() => expect(Math.round(panel().getBoundingClientRect().height)).toBe(Math.round(start)))
    })

    it('gives its content the full 640px: the 1px edge takes no width', async () => {
        await page.viewport(743, PHONE.height)
        mount(<HeightFixture rows={2} />)
        await waitFor(() => expect(panel()).not.toBeNull())
        await expect(panel().getBoundingClientRect().width).toBe(640)
        await expect(handle().parentElement!.getBoundingClientRect().width).toBe(640)
        await expect(getComputedStyle(byTestId('hs-edge')).boxShadow).toContain('inset')
    })

    it('keeps the screen white below the sheet: a white skirt the dialog does not clip', async () => {
        mount(<HeightFixture rows={2} />)
        await waitFor(() => expect(panel()).not.toBeNull())
        const skirt = byTestId('hs-skirt')
        await expect(Math.round(skirt.getBoundingClientRect().top)).toBe(Math.round(panel().getBoundingClientRect().bottom))
        await expect(getComputedStyle(skirt).backgroundColor).toBe('rgb(255, 255, 255)')
        await expect(getComputedStyle(document.querySelector('dialog[data-test="hs"]')!).overflow).toBe('visible')
    })

    it('shows the back control and the title icon when given', async () => {
        const onBack = fn()
        mount(<HeightFixture rows={2} onBack={onBack} />)
        await waitFor(() => expect(byTestId('hs-back')).not.toBeNull())
        await expect(byTestId('hs-back')).toHaveAttribute('aria-label', 'Back')
        await expect(byTestId('hs-icon')).not.toBeNull()
        await userEvent.click(byTestId('hs-back'))
        await expect(onBack).toHaveBeenCalledOnce()
    })
})
