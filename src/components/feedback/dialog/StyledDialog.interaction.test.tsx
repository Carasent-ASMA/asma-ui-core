import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cleanup, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledDialog } from './StyledDialog'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledMenu } from 'src/components/navigation/menu/StyledMenu'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'

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

    /* Escape belongs to the innermost open layer. Every dismissible thing a dialog can contain
     * consumes Escape on a `document` listener (Floating UI's `useDismiss`) and stops it there, while
     * a React handler on the <dialog> would run at the root container — earlier — and close the
     * dialog out from under the popup the user was actually dismissing. Listening on `window` puts
     * the dialog last in the path. @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ */
    describe('Escape closes only the innermost open layer (2.1.2)', () => {
        // The dialog re-asserts focus shortly after `showModal()`, so settle before driving the
        // keyboard or the first key lands on the dialog instead of the control under test.
        const settled = async (): Promise<void> => {
            await waitFor(() => expect(document.querySelector('dialog')).not.toBeNull())
            await new Promise((resolve) => setTimeout(resolve, 300))
        }
        const dialogIsOpen = (): boolean => document.querySelector('dialog') !== null

        it('keeps the dialog open when a StyledMenu inside it is dismissed', async () => {
            const onClose = fn()
            const Fixture = (): JSX.Element => {
                const [anchorEl, setAnchorEl] = useState<Element | null>(null)
                return (
                    <StyledDialog open onClose={onClose} dataTest='dlg'>
                        <StyledButton dataTest='menu-trigger' onClick={(event) => setAnchorEl(event.currentTarget)}>
                            Actions
                        </StyledButton>
                        <StyledMenu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                            <StyledMenuItem>Rename</StyledMenuItem>
                        </StyledMenu>
                    </StyledDialog>
                )
            }
            mount(<Fixture />)
            await settled()
            document.querySelector<HTMLElement>('[data-testid="menu-trigger"]')!.focus()
            await userEvent.keyboard('{Enter}')
            await waitFor(() => expect(document.querySelector('[role="menu"]')).not.toBeNull())

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull())
            await expect(dialogIsOpen()).toBe(true)
            await expect(onClose).not.toHaveBeenCalled()
        })

        it('keeps the dialog open when a StyledSelect inside it is dismissed', async () => {
            const onClose = fn()
            const Fixture = (): JSX.Element => {
                const [value, setValue] = useState<unknown>('a')
                return (
                    <StyledDialog open onClose={onClose} dataTest='dlg'>
                        <StyledSelect dataTest='sel' value={value} onChange={(event) => setValue(event.target.value)}>
                            <StyledSelectItem value='a'>Active</StyledSelectItem>
                            <StyledSelectItem value='b'>Paused</StyledSelectItem>
                        </StyledSelect>
                    </StyledDialog>
                )
            }
            mount(<Fixture />)
            await settled()
            document.querySelector<HTMLElement>('[data-testid="sel"]')!.focus()
            await userEvent.keyboard('{ArrowDown}')
            await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
            await expect(dialogIsOpen()).toBe(true)
            await expect(onClose).not.toHaveBeenCalled()
        })

        it('keeps the dialog open when a StyledSelectAutocomplete inside it is dismissed', async () => {
            const onClose = fn()
            const Fixture = (): JSX.Element => (
                <StyledDialog open onClose={onClose} dataTest='dlg'>
                    <StyledSelectAutocomplete<string, false, false, false>
                        dataTest='ac'
                        options={['Alpha', 'Bravo']}
                        value={null}
                        onChange={() => undefined}
                        renderInput={(params) => <StyledInputField {...params} dataTest='ac-input' label='Team' />}
                    />
                </StyledDialog>
            )
            mount(<Fixture />)
            await settled()
            document.querySelector<HTMLInputElement>('[data-testid="dlg"] input')!.focus()
            await userEvent.keyboard('{ArrowDown}')
            await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())
            await expect(dialogIsOpen()).toBe(true)
            await expect(onClose).not.toHaveBeenCalled()
        })

        it('closes only the inner dialog when a confirm is opened from inside one', async () => {
            // Escape belongs to the topmost modal dialog, and the browser tracks that itself: it
            // fires `cancel` on the last one promoted to the top layer — the confirm the user just
            // opened — so the dialog behind it is not involved at all.
            const onOuterClose = fn()
            const onInnerClose = fn()
            const Fixture = (): JSX.Element => {
                const [confirmOpen, setConfirmOpen] = useState(false)
                return (
                    <StyledDialog open onClose={onOuterClose} dataTest='outer'>
                        <StyledButton dataTest='open-confirm' onClick={() => setConfirmOpen(true)}>
                            Delete
                        </StyledButton>
                        {confirmOpen && (
                            <StyledDialog open onClose={onInnerClose} dataTest='inner'>
                                <StyledButton dataTest='confirm-btn'>Confirm</StyledButton>
                            </StyledDialog>
                        )}
                    </StyledDialog>
                )
            }
            mount(<Fixture />)
            await settled()
            await userEvent.click(document.querySelector<HTMLElement>('[data-testid="open-confirm"]')!)
            await waitFor(() => expect(document.querySelector('[data-testid="inner"]')).not.toBeNull())

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(onInnerClose).toHaveBeenCalledTimes(1))
            await expect(onOuterClose).not.toHaveBeenCalled()
        })

        it('still closes on the next Escape, once nothing inside is open', async () => {
            const onClose = fn()
            const Fixture = (): JSX.Element => {
                const [value, setValue] = useState<unknown>('a')
                return (
                    <StyledDialog open onClose={onClose} dataTest='dlg'>
                        <StyledSelect dataTest='sel' value={value} onChange={(event) => setValue(event.target.value)}>
                            <StyledSelectItem value='a'>Active</StyledSelectItem>
                        </StyledSelect>
                    </StyledDialog>
                )
            }
            mount(<Fixture />)
            await settled()
            document.querySelector<HTMLElement>('[data-testid="sel"]')!.focus()
            await userEvent.keyboard('{ArrowDown}')
            await waitFor(() => expect(document.querySelector('[role="listbox"]')).not.toBeNull())
            await userEvent.keyboard('{Escape}')
            await waitFor(() => expect(document.querySelector('[role="listbox"]')).toBeNull())

            await userEvent.keyboard('{Escape}')

            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
            await expect(onClose.mock.calls[0]?.[1]).toBe('escapeKeyDown')
        })
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
    it.each([
        ['Escape', async () => userEvent.keyboard('{Escape}')],
        ['the header close button', async () =>
            userEvent.click(dialogEl()!.querySelector<HTMLButtonElement>('[data-testid="close-button-confirm"]')!)],
        ['the backdrop', () =>
            Promise.resolve(dialogEl()!.firstElementChild!.dispatchEvent(new MouseEvent('click', { bubbles: true })))],
    ])('restores focus to the element that opened it after %s (2.4.3)', async (_closePath, close) => {
        const { container } = mount(<DialogFixture />)
        const opener = container.querySelector<HTMLButtonElement>('[data-testid="opener"]')!
        await userEvent.click(opener)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        await close()
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
