import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cleanup, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledDialog } from './StyledDialog'

/**
 * Keyboard & focus contract — StyledDialog (ASMA-8139).
 * WAI-ARIA modal-dialog pattern; WCAG 2.1.1, 2.1.2, 2.4.3, 4.1.2.
 *
 * The dialog is a native `<dialog>` opened with `showModal()`, so the focus trap and the top layer
 * come from the platform. These tests pin that the platform behaviour is actually being obtained —
 * a regression to a `<div role="dialog">` would silently lose the trap.
 */

const DialogFixture = ({
    onClose = () => undefined,
    disableEscapeKeyDown,
}: {
    onClose?: (event: unknown, reason: string) => void
    disableEscapeKeyDown?: boolean
}): JSX.Element => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <StyledButton dataTest='opener' onClick={() => setOpen(true)}>
                Open
            </StyledButton>
            <StyledDialog
                dataTest='confirm'
                dialogTitle='Confirm'
                open={open}
                disableEscapeKeyDown={disableEscapeKeyDown}
                onClose={(event, reason) => {
                    onClose(event, reason)
                    if (!disableEscapeKeyDown) setOpen(false)
                }}
            >
                <div className='p-4'>
                    <StyledButton dataTest='first'>First</StyledButton>
                    <StyledButton dataTest='last'>Last</StyledButton>
                </div>
            </StyledDialog>
        </>
    )
}

const dialogEl = (): HTMLDialogElement | null => document.querySelector<HTMLDialogElement>('dialog[data-testid="confirm"]')

describe('StyledDialog keyboard & focus contract', () => {
    afterEach(cleanup)

    it('opens as a real modal dialog in the top layer (4.1.2)', async () => {
        const { container } = mount(<DialogFixture />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)

        await waitFor(() => expect(dialogEl()).not.toBeNull())
        // `.matches(':modal')` is only true for a dialog opened via showModal() — this is what
        // actually buys the focus trap and the inert backdrop, so assert it directly.
        await expect(dialogEl()!.matches(':modal')).toBe(true)
        await expect(dialogEl()).toHaveAttribute('open')
    })

    it('moves focus into the dialog on open (2.4.3)', async () => {
        const { container } = mount(<DialogFixture />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)

        await waitFor(() => expect(dialogEl()).not.toBeNull())
        await waitFor(() => expect(dialogEl()!.contains(document.activeElement)).toBe(true))
    })

    /**
     * What the trap actually guarantees, and what it does not.
     *
     * Chromium scopes sequential navigation to a modal `<dialog>`, but the cycle still hands off to
     * the browser UI at each end — headless, that shows up as one or two steps parked on `<body>`
     * before focus re-enters. That is correct platform behaviour and is NOT a leak, so asserting
     * "activeElement is always inside the dialog" would fail on a perfectly good dialog (measured
     * sequence: close, first, last, BODY, BODY, close, first). The property worth pinning is the one
     * WCAG cares about: focus never reaches interactive page content behind the backdrop, and the
     * cycle comes back into the dialog rather than wandering off into the page.
     */
    const cycleFocus = async (steps: number, shift: boolean): Promise<Element[]> => {
        const seen: Element[] = []
        for (let step = 0; step < steps; step += 1) {
            await userEvent.tab({ shift })
            if (document.activeElement) seen.push(document.activeElement)
        }
        return seen
    }

    it('traps Tab inside the dialog — page content behind the backdrop is unreachable (2.1.2)', async () => {
        const { container } = mount(<DialogFixture />)
        const opener = container.querySelector<HTMLButtonElement>('[data-testid="opener"]')!
        await userEvent.click(opener)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        const dialog = dialogEl()!
        const stops = tabbableWithin(dialog)
        await expect(stops.length).toBeGreaterThan(1)

        const landed = await cycleFocus(stops.length * 2 + 2, false)

        // Nothing outside the dialog is ever focused, other than the body handoff described above.
        for (const element of landed) {
            await expect(element === document.body || dialog.contains(element)).toBe(true)
        }
        await expect(landed).not.toContain(opener)
        // ...and the cycle really does come back in, i.e. focus is contained rather than lost.
        await expect(landed.filter((element) => dialog.contains(element)).length).toBeGreaterThanOrEqual(stops.length)
    })

    it('traps Shift+Tab the same way (2.1.2)', async () => {
        const { container } = mount(<DialogFixture />)
        const opener = container.querySelector<HTMLButtonElement>('[data-testid="opener"]')!
        await userEvent.click(opener)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        const dialog = dialogEl()!
        const stops = tabbableWithin(dialog)
        const landed = await cycleFocus(stops.length * 2 + 2, true)

        for (const element of landed) {
            await expect(element === document.body || dialog.contains(element)).toBe(true)
        }
        await expect(landed).not.toContain(opener)
        await expect(landed.filter((element) => dialog.contains(element)).length).toBeGreaterThanOrEqual(stops.length)
    })

    it('closes on Escape and reports the escapeKeyDown reason (2.1.2)', async () => {
        const onClose = fn()
        const { container } = mount(<DialogFixture onClose={onClose} />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(dialogEl()).toBeNull())
        await expect(onClose).toHaveBeenCalledWith(expect.anything(), 'escapeKeyDown')
    })

    it('fires onClose exactly once per Escape press (2.1.2)', async () => {
        // The native `cancel` event and the keydown handler can both fire for one press;
        // `escapeHandledRef` de-dupes them. A double fire would close a parent dialog too.
        const onClose = fn()
        const { container } = mount(<DialogFixture onClose={onClose} />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    })

    it('honours disableEscapeKeyDown and stays open (2.1.2)', async () => {
        const onClose = fn()
        const { container } = mount(<DialogFixture onClose={onClose} disableEscapeKeyDown />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        await userEvent.keyboard('{Escape}')

        // Still open, still trapping — an ignored Escape must not leave a half-dismissed dialog.
        await expect(dialogEl()).not.toBeNull()
        await expect(dialogEl()!.matches(':modal')).toBe(true)
        await expect(onClose).not.toHaveBeenCalled()
    })

    it('reaches the close button by keyboard and activates it (2.1.1)', async () => {
        const onClose = fn()
        const { container } = mount(<DialogFixture onClose={onClose} />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        const close = dialogEl()!.querySelector<HTMLButtonElement>('[data-testid="close-button-confirm"]')!
        await expect(close).toHaveAccessibleName('Close')
        close.focus()
        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    /* FINDING ASMA-8139-C — WCAG 2.4.3 (focus order). src/components/feedback/dialog/StyledDialog.tsx.
     * The dialog is unmounted on close (`if (!open) return null`) rather than being `close()`d. The
     * platform only restores focus to the previously-focused element when a modal `<dialog>` is
     * CLOSED; removing the node from the DOM while it holds focus drops focus to `<body>` instead.
     * Consequence: after dismissing the dialog the next Tab restarts from the top of the document,
     * and a screen-reader user loses their place entirely — the exact failure the Select trigger's
     * `handleOpenChange` was written to avoid, so the codebase already treats this as a defect
     * elsewhere. Reproduces for Escape, the close button, and backdrop click alike.
     * Not fixed here: wave-3 builders add tests, not component fixes. Escalated to the coordinator.
     * @see docs/a11y-keyboard-contract.md */
    it.skip('restores focus to the element that opened it (2.4.3)', async () => {
        const { container } = mount(<DialogFixture />)
        const opener = container.querySelector<HTMLButtonElement>('[data-testid="opener"]')!
        await userEvent.click(opener)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(dialogEl()).toBeNull())

        await expect(document.activeElement).toBe(opener)
    })

    /* FINDING ASMA-8139-D — WCAG 4.1.2 (name/role/value). src/components/feedback/dialog/StyledDialog.tsx.
     * The dialog names itself `aria-label={dataTest}`, i.e. with the test hook. A screen reader
     * announces "confirm dialog" / "sms-send-modal dialog" — an internal identifier, not the
     * human-readable title the component already receives as `dialogTitle`. The heading text is
     * present in the DOM but is not wired as the accessible name.
     * Not fixed here: changing the accessible name affects every consumer's e2e selectors and
     * announcements. Escalated to the coordinator.
     * @see docs/a11y-keyboard-contract.md */
    it.skip('takes its accessible name from the dialog title, not the test hook (4.1.2)', async () => {
        const { container } = mount(<DialogFixture />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        await expect(dialogEl()).toHaveAccessibleName('Confirm')
    })
})
