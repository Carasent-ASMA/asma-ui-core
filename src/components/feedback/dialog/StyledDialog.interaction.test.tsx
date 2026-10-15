import { StrictMode, useState } from 'react'
import { afterEach, describe, it, vi } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cleanup, mount, tabbableWithin } from 'src/test-utils/renderInteraction'
import { StyledDialog } from './StyledDialog'
import { StyledDialogTitle } from './StyledDialogTitle'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledMenu } from 'src/components/navigation/menu/StyledMenu'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { StyledSelect } from 'src/components/inputs/select/StyledSelect'
import { StyledSelectAutocomplete } from 'src/components/inputs/select-autocomplete/StyledSelectAutocomplete'
import { StyledSelectItem } from 'src/components/inputs/select/StyledSelectItem'
import {
    getOverlayBackStackSize,
    registerOverlayBackCloser,
    requestCloseTopOverlayBack,
} from 'src/hooks/useBackCloses.hook'

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

    /* FINDING ASMA-8139-D — WCAG 4.1.2 (name/role/value). The dialog used to name itself
     * `aria-label={dataTest}`, so a screen reader announced the test hook instead of the title it
     * shows. Fixed by ASMA-8464 (title prop, `<StyledDialogTitle>` child, `ariaLabel`) and extended
     * here (label line, first content heading, development warning).
     * @see docs/a11y-keyboard-contract.md */
    it('takes its accessible name from the dialog title, not the test hook (4.1.2)', async () => {
        const { container } = mount(<DialogFixture />)
        await userEvent.click(container.querySelector('[data-testid="opener"]')!)
        await waitFor(() => expect(dialogEl()).not.toBeNull())

        await expect(dialogEl()).toHaveAccessibleName('Confirm')
    })

    /* Most consumers render the title as a child instead of passing `dialogTitle` (advoca's
     * privacy-consent modal is the one this finding was raised against), so that path has to name
     * the dialog too — otherwise the fix only moves it from a wrong name to no name at all. */
    it('is named by a <StyledDialogTitle> child as well as by the prop (4.1.2)', async () => {
        mount(
            <StyledDialog dataTest='privacy-modal' open>
                <StyledDialogTitle>Privacy policy</StyledDialogTitle>
            </StyledDialog>,
        )

        const dialog = (): HTMLDialogElement | null => document.querySelector('dialog[data-testid="privacy-modal"]')
        await waitFor(() => expect(dialog()).not.toBeNull())
        await waitFor(() => expect(dialog()).toHaveAccessibleName('Privacy policy'))
    })

    it('uses a child title’s explicit id as the dialog label target (4.1.2)', async () => {
        mount(
            <StyledDialog dataTest='explicit-title-modal' open>
                <StyledDialogTitle id='privacy-policy-title'>Privacy policy</StyledDialogTitle>
            </StyledDialog>,
        )

        const dialog = (): HTMLDialogElement | null => document.querySelector('dialog[data-testid="explicit-title-modal"]')
        await waitFor(() => expect(dialog()).toHaveAccessibleName('Privacy policy'))
        await expect(dialog()).toHaveAttribute('aria-labelledby', 'privacy-policy-title')
    })

    it('falls back to ariaLabel only when no title is rendered (4.1.2)', async () => {
        mount(<StyledDialog dataTest='bare-modal' open ariaLabel='Session expired' />)

        const dialog = (): HTMLDialogElement | null => document.querySelector('dialog[data-testid="bare-modal"]')
        await waitFor(() => expect(dialog()).not.toBeNull())
        await expect(dialog()).toHaveAccessibleName('Session expired')
    })

    it.each([
        ['dialogTitle', <StyledDialog dataTest='title-modal' open dialogTitle='Delete document' />, 'Delete document'],
        [
            'a child StyledDialogTitle with an automatic id',
            <StyledDialog dataTest='child-title-modal' open><StyledDialogTitle>Delete document</StyledDialogTitle></StyledDialog>,
            'Delete document',
        ],
        [
            'a child StyledDialogTitle with an explicit id',
            <StyledDialog dataTest='explicit-child-title-modal' open><StyledDialogTitle id='delete-title'>Delete document</StyledDialogTitle></StyledDialog>,
            'Delete document',
        ],
        ['ariaLabel without a title', <StyledDialog dataTest='aria-label-modal' open ariaLabel='Delete document' />, 'Delete document'],
        [
            'a title and ariaLabel together',
            <StyledDialog dataTest='title-wins-modal' open ariaLabel='Wrong name' dialogTitle='Delete document' />,
            'Delete document',
        ],
    ])('announces the correct name with %s (4.1.2)', async (_configuration, dialogNode, expectedName) => {
        mount(dialogNode)
        await expect(document.querySelector('dialog')).toHaveAccessibleName(expectedName)
    })

    it('falls back to the label line, then to ariaLabel, and never to the test hook (4.1.2)', async () => {
        const { unmount } = mount(
            <StyledDialog open dataTest='labelled' dialogLabel='Pathway' showCloseIcon={false}>
                body
            </StyledDialog>,
        )
        await waitFor(() => expect(document.querySelector('[data-testid="labelled"]')).not.toBeNull())
        await expect(document.querySelector('[data-testid="labelled"]')).toHaveAccessibleName('Pathway')
        unmount()

        mount(
            <StyledDialog open dataTest='named' ariaLabel='Unsaved changes' showCloseIcon={false}>
                body
            </StyledDialog>,
        )
        await waitFor(() => expect(document.querySelector('[data-testid="named"]')).not.toBeNull())
        await expect(document.querySelector('[data-testid="named"]')).toHaveAccessibleName('Unsaved changes')
        await expect(document.querySelector('[data-testid="named"]')).not.toHaveAttribute('aria-label', 'named')
    })

    it('with no title, label or ariaLabel, is named by the first heading in its content (4.1.2)', async () => {
        mount(
            <StyledDialog open dataTest='custom-header' showCloseIcon={false}>
                <h2>Share with pathfinder</h2>
                <p>body</p>
            </StyledDialog>,
        )
        await waitFor(() => expect(document.querySelector('[data-testid="custom-header"]')).not.toBeNull())
        await expect(document.querySelector('[data-testid="custom-header"]')).toHaveAccessibleName(
            'Share with pathfinder',
        )
    })

    it('prefers a visible title over a heading in its content (4.1.2)', async () => {
        mount(
            <StyledDialog open dataTest='titled' dialogTitle='Confirm' showCloseIcon={false}>
                <h2>Section</h2>
            </StyledDialog>,
        )
        await waitFor(() => expect(document.querySelector('[data-testid="titled"]')).not.toBeNull())
        await expect(document.querySelector('[data-testid="titled"]')).toHaveAccessibleName('Confirm')
    })

    it('warns in development when nothing can name it, and never falls back to the test hook (4.1.2)', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        try {
            mount(
                <StyledDialog open dataTest='nameless' showCloseIcon={false}>
                    <p>body</p>
                </StyledDialog>,
            )
            await waitFor(() => expect(document.querySelector('[data-testid="nameless"]')).not.toBeNull())
            await expect(document.querySelector('[data-testid="nameless"]')).not.toHaveAttribute('aria-label')
            await expect(warn).toHaveBeenCalledWith(expect.stringContaining('"nameless" has no accessible name'))
        } finally {
            warn.mockRestore()
        }
    })
})

/**
 * ASMA-8471 — native Back closes the top ui-core overlay through its own close path.
 *
 * `requestCloseTopOverlayBack()` is the one function a real `asma-core-helpers` history adapter calls
 * on an owned traversal (a fake adapter, per TASK-021) — calling it directly here exercises the exact
 * same path a desktop/Firefox/Safari Back press takes. The native `cancel`/`close` dispatches below
 * exercise `StyledDialog`'s own Android close-watcher arbitration (CON-007) instead: a real
 * `dialog.close()` runs the browser's actual close algorithm and fires a genuine non-cancelable
 * `close` event, which is what a second rapid Back does when the first `cancel` was prevented.
 */
describe('StyledDialog native Back (ASMA-8471)', () => {
    afterEach(cleanup)

    const dialogByTest = (dataTest: string): HTMLDialogElement | null =>
        document.querySelector<HTMLDialogElement>(`dialog[data-testid="${dataTest}"]`)

    it('closes only the top of two stacked dialogs, one Back at a time (TEST-007 / BACK-2)', async () => {
        const onOuterClose = fn()
        const onInnerClose = fn()
        // Documents opens from INSIDE Share, after Share has already mounted and registered — the
        // same sequence BACK-2's fixture describes. Mounting both from the same initial render would
        // register Documents before Share (child effects run before parent effects on mount) and
        // invert the stack, so the inner dialog is opened via a later, separate commit on purpose.
        const Fixture = (): JSX.Element => {
            const [outerOpen, setOuterOpen] = useState(true)
            const [innerOpen, setInnerOpen] = useState(false)
            return (
                <>
                    {outerOpen && (
                        <StyledDialog
                            dataTest='share'
                            dialogTitle='Share'
                            open
                            onClose={() => {
                                onOuterClose()
                                setOuterOpen(false)
                            }}
                        >
                            <StyledButton dataTest='open-documents' onClick={() => setInnerOpen(true)}>
                                Documents
                            </StyledButton>
                            {innerOpen && (
                                <StyledDialog
                                    dataTest='documents'
                                    dialogTitle='Documents'
                                    open
                                    onClose={() => {
                                        onInnerClose()
                                        setInnerOpen(false)
                                    }}
                                />
                            )}
                        </StyledDialog>
                    )}
                </>
            )
        }
        const { container } = mount(<Fixture />)
        await waitFor(() => expect(dialogByTest('share')).not.toBeNull())
        await userEvent.click(container.querySelector('[data-testid="open-documents"]')!)
        await waitFor(() => expect(dialogByTest('documents')).not.toBeNull())

        void requestCloseTopOverlayBack()
        await waitFor(() => expect(dialogByTest('documents')).toBeNull())
        await expect(onInnerClose).toHaveBeenCalledTimes(1)
        await expect(onOuterClose).not.toHaveBeenCalled()
        await expect(dialogByTest('share')).not.toBeNull()

        void requestCloseTopOverlayBack()
        await waitFor(() => expect(dialogByTest('share')).toBeNull())
        await expect(onOuterClose).toHaveBeenCalledTimes(1)
    })

    it('a dirty dialog opens its confirmation on Back, Back dismisses the confirmation (not confirms), and the next Back asks again (TEST-008)', async () => {
        const onDelete = fn()
        const Fixture = (): JSX.Element => {
            const [open, setOpen] = useState(true)
            const [confirmOpen, setConfirmOpen] = useState(false)
            return (
                <>
                    {open && (
                        <StyledDialog dataTest='editor' dialogTitle='Editor' open onClose={() => setConfirmOpen(true)}>
                            {confirmOpen && (
                                <StyledDialog
                                    dataTest='confirm'
                                    dialogTitle='Discard changes?'
                                    open
                                    onClose={() => setConfirmOpen(false)}
                                >
                                    <StyledButton dataTest='discard' onClick={() => (onDelete(), setOpen(false))}>
                                        Discard
                                    </StyledButton>
                                </StyledDialog>
                            )}
                        </StyledDialog>
                    )}
                </>
            )
        }
        mount(<Fixture />)
        await waitFor(() => expect(dialogByTest('editor')).not.toBeNull())
        await expect(dialogByTest('confirm')).toBeNull()

        // First Back: the editor is dirty, so it asks instead of closing.
        void requestCloseTopOverlayBack()
        await waitFor(() => expect(dialogByTest('confirm')).not.toBeNull())

        // Second Back: dismisses the confirmation itself (the safe choice) — it never confirms.
        void requestCloseTopOverlayBack()
        await waitFor(() => expect(dialogByTest('confirm')).toBeNull())
        await expect(dialogByTest('editor')).not.toBeNull()
        await expect(onDelete).not.toHaveBeenCalled()

        // Third Back: the editor is still dirty, so it asks again.
        void requestCloseTopOverlayBack()
        await waitFor(() => expect(dialogByTest('confirm')).not.toBeNull())
    })

    it.each(['Back', 'Escape', 'the close button'] as const)(
        'latches onClose started from %s: Back, a click and Escape are all no-ops until it settles, then it can invoke again (TEST-009)',
        async (startTrigger) => {
            const onClose = fn()
            // Reassigned on every call — this dialog never actually closes in this test, which is the
            // point: it isolates the LATCH from the dirty-dialog-then-closes flow TEST-007/008 already
            // cover, so a second invocation after settling is directly observable as a second call.
            let resolveCurrent: (() => void) | undefined
            const Fixture = (): JSX.Element => (
                <StyledDialog dataTest='async-confirm' dialogTitle='Save?' open onClose={() => {
                    onClose()
                    return new Promise<void>((resolve) => {
                        resolveCurrent = resolve
                    })
                }} />
            )
            const { container } = mount(<Fixture />)
            await waitFor(() => expect(dialogByTest('async-confirm')).not.toBeNull())
            const closeButton = (): HTMLButtonElement =>
                container.querySelector<HTMLButtonElement>('[data-testid="close-button-async-confirm"]')!

            if (startTrigger === 'Back') void requestCloseTopOverlayBack()
            else if (startTrigger === 'Escape') await userEvent.keyboard('{Escape}')
            else await userEvent.click(closeButton())
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))

            // Latched while the first attempt is in flight — none of Back, a click or Escape (even one
            // that DIDN'T start it) can invoke `onClose` again before it settles.
            void requestCloseTopOverlayBack()
            await userEvent.click(closeButton())
            await userEvent.keyboard('{Escape}')
            await expect(onClose).toHaveBeenCalledTimes(1)
            await expect(dialogByTest('async-confirm')).not.toBeNull()

            // Settled: the latch clears and the next attempt calls through again.
            resolveCurrent?.()
            await Promise.resolve()
            void requestCloseTopOverlayBack()
            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(2))
        },
    )

    it('a no-safe-choice dialog ignores Back and does not fall through to the dialog underneath (TEST-010)', async () => {
        const onOuterClose = fn()
        // Same sequencing concern as TEST-007: the inner dialog opens from a later, separate commit
        // so it registers (and becomes the registry top) strictly after the outer one.
        const Fixture = (): JSX.Element => {
            const [innerOpen, setInnerOpen] = useState(false)
            return (
                <StyledDialog dataTest='outer' dialogTitle='Outer' open onClose={onOuterClose}>
                    <StyledButton dataTest='open-processing' onClick={() => setInnerOpen(true)}>
                        Process
                    </StyledButton>
                    {innerOpen && (
                        <StyledDialog dataTest='no-safe-choice' dialogTitle='Processing' open disableEscapeKeyDown>
                            <p>Please wait…</p>
                        </StyledDialog>
                    )}
                </StyledDialog>
            )
        }
        const { container } = mount(<Fixture />)
        await waitFor(() => expect(dialogByTest('outer')).not.toBeNull())
        await userEvent.click(container.querySelector('[data-testid="open-processing"]')!)
        await waitFor(() => expect(dialogByTest('no-safe-choice')).not.toBeNull())

        void requestCloseTopOverlayBack()

        await expect(dialogByTest('no-safe-choice')).not.toBeNull()
        await expect(onOuterClose).not.toHaveBeenCalled()
    })

    it('reports the registry-only path: a StrictMode mount/cleanup/mount leaves one registration, and a full cycle makes no history calls (TEST-011 / TEST-012)', async () => {
        const pushState = vi.spyOn(window.history, 'pushState')
        const replaceState = vi.spyOn(window.history, 'replaceState')
        const back = vi.spyOn(window.history, 'back')
        const go = vi.spyOn(window.history, 'go')

        const onClose = fn()
        const { unmount } = mount(
            <StrictMode>
                <StyledDialog dataTest='strict' dialogTitle='Strict' open onClose={onClose}>
                    <p>body</p>
                </StyledDialog>
            </StrictMode>,
        )
        await waitFor(() => expect(dialogByTest('strict')).not.toBeNull())
        await expect(getOverlayBackStackSize()).toBe(1)

        void requestCloseTopOverlayBack()
        await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))

        unmount()
        await expect(getOverlayBackStackSize()).toBe(0)

        await expect(pushState).not.toHaveBeenCalled()
        await expect(replaceState).not.toHaveBeenCalled()
        await expect(back).not.toHaveBeenCalled()
        await expect(go).not.toHaveBeenCalled()

        pushState.mockRestore()
        replaceState.mockRestore()
        back.mockRestore()
        go.mockRestore()
    })

    it('native cancel (first Back) is prevented and delegated to the registry; native close (forced second Back) re-shows a dialog that declined (CON-007/RISK-003)', async () => {
        mount(
            <StyledDialog dataTest='android' dialogTitle='Processing' open disableEscapeKeyDown>
                <p>Please wait…</p>
            </StyledDialog>,
        )
        const dialog = await waitFor(() => {
            const node = dialogByTest('android')
            if (!node) throw new Error('dialog not mounted yet')
            return node
        })
        await waitFor(() => expect(dialog.matches(':modal')).toBe(true))

        // First Back: the native close watcher fires a cancelable `cancel`. Nothing can close this
        // dialog (no safe choice), so it stays modal.
        const cancelEvent = new Event('cancel', { cancelable: true })
        dialog.dispatchEvent(cancelEvent)
        await expect(cancelEvent.defaultPrevented).toBe(true)
        await expect(dialog.matches(':modal')).toBe(true)

        // Second Back, no tap in between: the close watcher forces the dialog shut regardless,
        // firing a non-cancelable `close` while React's `open` is still `true` — the zombie case.
        dialog.close()
        await waitFor(() => expect(dialog.matches(':modal')).toBe(true))
    })

    it('native cancel invokes the registry TOP, not this dialog’s own close, when something else is stacked above it (CON-007)', async () => {
        // A mutation that swapped `requestCloseTopOverlayBack()` in `handleCancel` for a call to THIS
        // dialog's own close would make this assertion fail: `topSpy` (registered directly through the
        // registry, standing in for a real overlay above this one) is the only thing that may be
        // called, and this dialog's own `onClose` must stay untouched.
        const onClose = fn()
        mount(
            <StyledDialog dataTest='has-something-above' dialogTitle='Base' open onClose={onClose}>
                <p>content</p>
            </StyledDialog>,
        )
        const dialog = await waitFor(() => {
            const node = dialogByTest('has-something-above')
            if (!node) throw new Error('dialog not mounted yet')
            return node
        })
        await waitFor(() => expect(dialog.matches(':modal')).toBe(true))

        const topSpy = fn()
        const unregisterTop = registerOverlayBackCloser(topSpy)

        dialog.dispatchEvent(new Event('cancel', { cancelable: true }))

        await waitFor(() => expect(topSpy).toHaveBeenCalledTimes(1))
        await expect(onClose).not.toHaveBeenCalled()

        unregisterTop()
    })
})
