import { useState } from 'react'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { page } from 'vitest/browser'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledPopoverV2, type StyledPopoverV2Props } from '../popover/StyledPopoverV2'

/**
 * Keyboard, focus and dismissal contract — StyledBottomSheet (ASMA-8184), exercised the way it ships:
 * as the mobile (0–743px) form of `StyledPopoverV2 variant='action'`.
 * WCAG 2.1.2, 2.4.3, 2.5.7, 3.2.2, 4.1.2, 4.1.3, 1.3.4.
 */

const PHONE = { width: 375, height: 812 }
// Narrower than 744px, so it is still the sheet; a phone landscape wider than that gets the anchored popover.
const PHONE_LANDSCAPE = { width: 667, height: 375 }
const DESKTOP = { width: 1280, height: 720 }

type FixtureProps = Partial<StyledPopoverV2Props>

const FilterFixture = (props: FixtureProps): JSX.Element => {
    const [count, setCount] = useState(248)
    return (
        <StyledPopoverV2
            dataTest='sheet'
            variant='action'
            title='Filtrer søknader'
            resultCount={count}
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
        </StyledPopoverV2>
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
    beforeEach(async () => {
        await page.viewport(PHONE.width, PHONE.height)
    })
    afterEach(async () => {
        cleanup()
        await page.viewport(DESKTOP.width, DESKTOP.height)
    })

    it('renders an action popover as a modal sheet below 744px', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()

        await expect(dialog.open).toBe(true)
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
        const grabber = dialog.querySelector('svg.pointer-events-none')!

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

    const drag = (handle: Element, fromY: number, toY: number): void => {
        const init = { bubbles: true, pointerId: 7, pointerType: 'touch', clientX: 100 }
        handle.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientY: fromY }))
        handle.dispatchEvent(new PointerEvent('pointermove', { ...init, clientY: toY }))
        handle.dispatchEvent(new PointerEvent('pointerup', { ...init, clientY: toY }))
    }

    const handleOf = (dialog: HTMLDialogElement): Element => dialog.querySelector('.touch-none')!

    it('dismisses when dragged down past 30% of the sheet height', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const sheetHeight = dialog.querySelector('[data-state]')!.getBoundingClientRect().height

        drag(handleOf(dialog), 100, 100 + sheetHeight * 0.4)
        await waitFor(() => expect(sheet()).toBeNull())
    })

    it('snaps back when released before 30%', async () => {
        mount(<FilterFixture />)
        const dialog = await openSheet()
        const sheetHeight = dialog.querySelector('[data-state]')!.getBoundingClientRect().height

        drag(handleOf(dialog), 100, 100 + sheetHeight * 0.1)
        await expect(sheet()).not.toBeNull()
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
