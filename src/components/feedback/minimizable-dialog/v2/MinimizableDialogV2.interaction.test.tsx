import { afterEach, describe, it } from 'vitest'
import { useRef, useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { MinimizableDialogV2 } from './MinimizableDialogV2'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { useReportDialogBusy } from 'src/components/feedback/dialog/DialogBusyContext'

describe('MinimizableDialogV2 keyboard contract', () => {
    afterEach(cleanup)

    it('makes only the visible panel keyboard-operable after minimizing (2.1.1)', async () => {
        const { container } = mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open title='Editor' onClose={() => undefined}>
                <button type='button'>Content action</button>
            </MinimizableDialogV2>,
        )
        const minimizedPanel = (): HTMLElement => container.querySelector('[data-testid="dialog-v2"]')!.parentElement!
        const maximizedPanel = (): HTMLElement => container.querySelectorAll<HTMLElement>('div[style*="z-index: 51"]')[1]!

        await expect(minimizedPanel()).toHaveAttribute('inert')
        await expect(maximizedPanel()).not.toHaveAttribute('inert')

        await userEvent.click(container.querySelectorAll<HTMLButtonElement>('[data-testid="toggle-minimize-btn"]')[1]!)
        await waitFor(() => expect(minimizedPanel()).not.toHaveAttribute('inert'))
        await expect(maximizedPanel()).toHaveAttribute('inert')
    })

    it('keeps Expand and Close keyboard-operable in the visible minimized panel (2.1.1)', async () => {
        const onClose = fn()
        const { container } = mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open title='Editor' onClose={onClose}>
                <button type='button'>Content action</button>
            </MinimizableDialogV2>,
        )
        const minimizeButtons = (): HTMLButtonElement[] =>
            Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid="toggle-minimize-btn"]'))
        const closeButtons = (): HTMLButtonElement[] =>
            Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid="close-button"]'))

        minimizeButtons()[1]!.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(minimizeButtons()[0]!.closest('[inert]')).toBeNull())
        await expect(document.activeElement).toBe(minimizeButtons()[0])

        minimizeButtons()[0]!.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(minimizeButtons()[1]!.closest('[inert]')).toBeNull())
        await expect(document.activeElement).toBe(minimizeButtons()[1])

        minimizeButtons()[1]!.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(closeButtons()[0]!.closest('[inert]')).toBeNull())
        closeButtons()[0]!.focus()
        await userEvent.keyboard('{Enter}')
        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('still hands focus on when the counterpart toggle is not rendered (2.4.3)', async () => {
        // `showExpandIcon` (and mobile, and fullscreen for the other direction) can remove the toggle
        // from the panel being revealed. Aiming only at that button left focus in the panel that had
        // just gone inert.
        const { container } = mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open title='Editor' showExpandIcon={false} onClose={() => undefined}>
                <button type='button'>Content action</button>
            </MinimizableDialogV2>,
        )
        const minimize = container.querySelector<HTMLButtonElement>('[data-testid="toggle-minimize-btn"]')!

        minimize.focus()
        await userEvent.keyboard('{Enter}')
        // Both panels stay mounted, so the flip to watch for is the pressed button going inert.
        await waitFor(() => expect(minimize.closest('[inert]')).not.toBeNull())

        // The revealed panel has no Expand button, so focus falls back to whatever it can reach —
        // never to <body>, and never into the panel that just became inert.
        const active = document.activeElement as HTMLElement
        await expect(active).not.toBe(document.body)
        await expect(active.closest('[inert]')).toBeNull()
    })

    it('keeps focus on the fullscreen toggle when leaving fullscreen (2.4.3)', async () => {
        // The reported case: close the dialog while fullscreen, reopen it from an outside button, then
        // leave fullscreen. The trap engages at that reopen while the opener holds focus, so restoring
        // "whatever preceded the trap" threw the user out of the dialog and back onto the opener.
        // Leaving fullscreen only drops modality — the panel stays, so focus belongs on the toggle.
        const Fixture = (): JSX.Element => {
            const [open, setOpen] = useState(false)
            const [fullScreen, setFullScreen] = useState(true)
            return (
                <>
                    <button type='button' data-testid='opener' onClick={() => setOpen(true)}>
                        Open
                    </button>
                    {open && (
                        <MinimizableDialogV2
                            dataTest='dialog-v2'
                            open
                            title='Editor'
                            fullScreenState={fullScreen}
                            handleFullScreenState={() => setFullScreen((value) => !value)}
                            onClose={() => setOpen(false)}
                        >
                            <button type='button'>Content action</button>
                        </MinimizableDialogV2>
                    )}
                </>
            )
        }
        const { container } = mount(<Fixture />)
        const opener = container.querySelector<HTMLButtonElement>('[data-testid="opener"]')!
        const toggle = (): HTMLButtonElement =>
            container.querySelector<HTMLButtonElement>('[data-testid="fullscreen-button"]')!

        // Reopen from the opener: the trap engages here and captures it.
        opener.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(container.querySelector('[role="dialog"][aria-modal="true"]')).not.toBeNull())

        toggle().focus()
        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(container.querySelector('[role="dialog"][aria-modal="true"]')).toBeNull())
        await expect(document.activeElement).toBe(toggle())
        await expect(document.activeElement).not.toBe(opener)
    })

    it('traps focus only while fullscreen (2.1.2, 2.4.3)', async () => {
        const { container } = mount(
            <>
                <button type='button'>Before</button>
                <MinimizableDialogV2 dataTest='dialog-v2' open fullScreenState title='Editor' onClose={() => undefined}>
                    <button type='button'>Content action</button>
                </MinimizableDialogV2>
                <button type='button'>After</button>
            </>,
        )
        const dialog = container.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]')!
        const minimizedPanel = container.querySelector('[data-testid="dialog-v2"]')!.parentElement!
        const visibleCloseButton = (): HTMLButtonElement =>
            Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid="close-button"]')).find(
                (button) => !minimizedPanel.contains(button),
            )!

        await waitFor(() => expect(document.activeElement).toBe(visibleCloseButton()))
        await userEvent.tab()
        await expect(dialog.contains(document.activeElement)).toBe(true)
        await userEvent.tab({ shift: true })
        await expect(dialog.contains(document.activeElement)).toBe(true)
    })

    it('moves focus to Close when opened and keeps Exit fullscreen focused after a pointer transition (2.4.3)', async () => {
        const Fixture = (): JSX.Element => {
            const [open, setOpen] = useState(false)
            return (
                <>
                    <button type='button' onClick={() => setOpen(true)}>Open editor</button>
                    <MinimizableDialogV2 dataTest='dialog-v2' open={open} title='Editor' onClose={() => setOpen(false)}>
                        <button type='button'>Content action</button>
                    </MinimizableDialogV2>
                </>
            )
        }
        const { container } = mount(<Fixture />)
        const opener = container.querySelector<HTMLButtonElement>('button')!
        const visibleCloseButton = (): HTMLButtonElement => {
            const minimizedPanel = container.querySelector('[data-testid="dialog-v2"]')!.parentElement!
            const closeButtons = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid="close-button"]'))

            return closeButtons.find((button) => !minimizedPanel.contains(button))!
        }
        await userEvent.click(opener)
        await expect(document.activeElement).toBe(visibleCloseButton())

        await userEvent.tab()
        await expect(document.activeElement).toBe(
            Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
                (button) => button.textContent === 'Content action',
            ),
        )

        const fullscreenButton = container.querySelector<HTMLButtonElement>('[data-testid="fullscreen-button"]')!
        await userEvent.click(fullscreenButton)
        await waitFor(() => expect(fullscreenButton).toHaveAccessibleName('Exit fullscreen'))
        await expect(document.activeElement).toBe(fullscreenButton)
    })

    it('moves focus to an explicitly supplied target when opening docked (2.4.3)', async () => {
        const Fixture = (): JSX.Element => {
            const [open, setOpen] = useState(false)
            const titleInputRef = useRef<HTMLInputElement>(null)

            return (
                <>
                    <button type='button' onClick={() => setOpen(true)}>Open editor</button>
                    <MinimizableDialogV2
                        dataTest='dialog-v2'
                        open={open}
                        title='Editor'
                        initialFocusRef={titleInputRef}
                        onClose={() => setOpen(false)}
                    >
                        <input ref={titleInputRef} aria-label='Editor title' />
                    </MinimizableDialogV2>
                </>
            )
        }

        const { container } = mount(<Fixture />)
        await userEvent.click(container.querySelector<HTMLButtonElement>('button')!)

        await expect(document.activeElement).toBe(container.querySelector('[aria-label="Editor title"]'))
    })

    it('keeps keyboard focus on Exit fullscreen after entering fullscreen (2.4.3)', async () => {
        const { container } = mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open title='Editor' onClose={() => undefined}>
                <button type='button'>Content action</button>
            </MinimizableDialogV2>,
        )
        const fullscreenButton = container.querySelector<HTMLButtonElement>('[data-testid="fullscreen-button"]')!

        fullscreenButton.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(fullscreenButton).toHaveAccessibleName('Exit fullscreen'))
        await expect(document.activeElement).toBe(fullscreenButton)
    })

    it('hands focus back to the opener when the docked dialog closes (2.4.3)', async () => {
        const Fixture = (): JSX.Element => {
            const [open, setOpen] = useState(false)
            return (
                <>
                    <button type='button' data-testid='opener' onClick={() => setOpen(true)}>
                        Open
                    </button>
                    <MinimizableDialogV2 dataTest='dialog-v2' open={open} title='Editor' onClose={() => setOpen(false)}>
                        <button type='button'>Content action</button>
                    </MinimizableDialogV2>
                </>
            )
        }
        const { container } = mount(<Fixture />)
        const opener = container.querySelector<HTMLButtonElement>('[data-testid="opener"]')!

        opener.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Close'))
        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(document.activeElement).toBe(opener))
    })

    it('announces the docked panel as a named non-modal dialog, which Escape does not close (4.1.2)', async () => {
        const onClose = fn()
        const { container } = mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open label='Task' title={<h2>Weekly report</h2>} onClose={onClose}>
                <button type='button'>Content action</button>
            </MinimizableDialogV2>,
        )
        const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!

        // Focus lands on Close at open, so a screen reader reads this name before the button.
        await expect(dialog).toHaveAccessibleName('Task Weekly report')
        await expect(dialog).not.toHaveAttribute('aria-modal')
        await expect(dialog.contains(document.activeElement)).toBe(true)

        // Docked is non-modal: nothing is trapped and Close is reachable, so Escape is left to whatever
        // popup inside the panel may be open instead of closing the whole panel.
        Array.from(dialog.querySelectorAll<HTMLButtonElement>('button'))
            .find((b) => b.textContent === 'Content action')!
            .focus()
        await userEvent.keyboard('{Escape}')
        await expect(onClose).not.toHaveBeenCalled()
    })
})

describe('MinimizableDialogV2 native Back (ASMA-8471)', () => {
    afterEach(cleanup)

    it('closes through handleClose while fullscreen', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open fullScreenState title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())

        void requestCloseTopOverlayBack()

        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not register while docked (not a modal layer)', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelectorAll('[data-testid="dialog-v2"]')).not.toHaveLength(0))
        await expect(getOverlayBackStackSize()).toBe(0)

        void requestCloseTopOverlayBack()

        await expect(onClose).not.toHaveBeenCalled()
    })

    it('does not register once minimized, even while fullscreen', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open fullScreenState minimizedState title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelectorAll('[data-testid="dialog-v2"]')).not.toHaveLength(0))
        await expect(getOverlayBackStackSize()).toBe(0)

        void requestCloseTopOverlayBack()
        await expect(onClose).not.toHaveBeenCalled()
    })

    it('waits while busy, same as its ✕ path', async () => {
        const onClose = fn()
        const BusyMarker = (): null => {
            useReportDialogBusy(true)
            return null
        }
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open fullScreenState title='Editor' onClose={onClose}>
                <BusyMarker />
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())

        const result = requestCloseTopOverlayBack()

        await expect(result).toBe(false)
        await expect(onClose).not.toHaveBeenCalled()
    })
})

describe('MinimizableDialogV2 native Back (ASMA-8471)', () => {
    afterEach(cleanup)

    it('closes through handleClose while fullscreen', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open fullScreenState title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())

        void requestCloseTopOverlayBack()

        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not register while docked (not a modal layer)', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelectorAll('[data-testid="dialog-v2"]')).not.toHaveLength(0))
        await expect(getOverlayBackStackSize()).toBe(0)

        void requestCloseTopOverlayBack()

        await expect(onClose).not.toHaveBeenCalled()
    })

    it('does not register once minimized, even while fullscreen', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open fullScreenState minimizedState title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelectorAll('[data-testid="dialog-v2"]')).not.toHaveLength(0))
        await expect(getOverlayBackStackSize()).toBe(0)

        void requestCloseTopOverlayBack()
        await expect(onClose).not.toHaveBeenCalled()
    })

    it('waits while busy, same as its ✕ path', async () => {
        const onClose = fn()
        const BusyMarker = (): null => {
            useReportDialogBusy(true)
            return null
        }
        mount(
            <MinimizableDialogV2 dataTest='dialog-v2' open fullScreenState title='Editor' onClose={onClose}>
                <BusyMarker />
                <p>Content</p>
            </MinimizableDialogV2>,
        )
        await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())

        void requestCloseTopOverlayBack()

        await expect(onClose).not.toHaveBeenCalled()
    })
})
