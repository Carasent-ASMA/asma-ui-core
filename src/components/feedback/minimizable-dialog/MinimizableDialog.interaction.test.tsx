import { afterEach, describe, it } from 'vitest'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { MinimizableDialog } from './MinimizableDialog'
import { StyledDialog } from 'src/components/feedback/dialog/StyledDialog'
import { getOverlayBackStackSize, requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'
import { registerOpenModalDialog } from 'src/hooks/useTopLayer.hook'

describe('MinimizableDialog keyboard contract', () => {
    afterEach(cleanup)

    it('makes the visually hidden panel inert when minimized (2.1.1)', async () => {
        const { container } = mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={() => undefined}>
                <button type='button'>Content action</button>
            </MinimizableDialog>,
        )
        const minimizedPanel = (): HTMLElement => container.querySelector('[data-testid="dialog"]')!.parentElement!
        const maximizedPanel = (): HTMLElement => container.querySelectorAll<HTMLElement>('[data-testid="dialog"]')[1]!

        await expect(minimizedPanel()).toHaveAttribute('inert')
        await expect(maximizedPanel()).not.toHaveAttribute('inert')

        await userEvent.click(container.querySelectorAll<HTMLButtonElement>('[data-testid="minimize-button"]')[1]!)
        await waitFor(() => expect(minimizedPanel()).not.toHaveAttribute('inert'))
        await expect(maximizedPanel()).toHaveAttribute('inert')
    })

    it('keeps Expand and Close keyboard-operable in the visible minimized panel (2.1.1)', async () => {
        const onClose = fn()
        const { container } = mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={onClose}>
                <button type='button'>Content action</button>
            </MinimizableDialog>,
        )
        const minimizeButtons = (): HTMLButtonElement[] =>
            Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid="minimize-button"]'))
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

    it('traps focus only while fullscreen (2.1.2, 2.4.3)', async () => {
        const { container } = mount(
            <>
                <button type='button'>Before</button>
                <MinimizableDialog dataTest='dialog' open fullScreenState title='Editor' onClose={() => undefined}>
                    <button type='button'>Content action</button>
                </MinimizableDialog>
                <button type='button'>After</button>
            </>,
        )
        const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!

        await waitFor(() => expect(document.activeElement).toBe(dialog))
        await userEvent.tab()
        await expect(dialog.contains(document.activeElement)).toBe(true)
        await userEvent.tab({ shift: true })
        await expect(dialog.contains(document.activeElement)).toBe(true)
    })

    it('keeps focus on the opener while docked and on Exit full screen after a pointer transition (2.4.3)', async () => {
        const Fixture = (): JSX.Element => {
            const [open, setOpen] = useState(false)
            return (
                <>
                    <button type='button' onClick={() => setOpen(true)}>Open editor</button>
                    <MinimizableDialog dataTest='dialog' open={open} title='Editor' onClose={() => setOpen(false)}>
                        <button type='button'>Content action</button>
                    </MinimizableDialog>
                </>
            )
        }
        const { container } = mount(<Fixture />)
        const opener = container.querySelector<HTMLButtonElement>('button')!
        await userEvent.click(opener)
        await expect(document.activeElement).toBe(opener)

        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelectorAll('[data-testid="minimize-button"]')[1])

        const fullscreenButton = container.querySelector<HTMLButtonElement>('[data-testid="fullscreen-button"]')!
        await userEvent.click(fullscreenButton)
        await waitFor(() => expect(fullscreenButton).toHaveAccessibleName('Exit full screen'))
        await expect(document.activeElement).toBe(fullscreenButton)
    })

    it('keeps keyboard focus on Exit full screen after entering fullscreen (2.4.3)', async () => {
        const { container } = mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={() => undefined}>
                <button type='button'>Content action</button>
            </MinimizableDialog>,
        )
        const fullscreenButton = container.querySelector<HTMLButtonElement>('[data-testid="fullscreen-button"]')!

        fullscreenButton.focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(fullscreenButton).toHaveAccessibleName('Exit full screen'))
        await expect(document.activeElement).toBe(fullscreenButton)
    })
})

describe('MinimizableDialog busy and disabled footer (disabled-states DIS-8, R05-23)', () => {
    afterEach(cleanup)

    const byTest = (container: HTMLElement, id: string): HTMLButtonElement[] =>
        Array.from(container.querySelectorAll<HTMLButtonElement>(`[data-testid="${id}"]`))

    it('waits while the primary action runs: secondary soft-disabled, X ignored, primary busy', async () => {
        const onClose = fn()
        const onCancel = fn()
        const onSave = fn()
        const { container } = mount(
            <MinimizableDialog
                dataTest='dialog'
                open
                title='Editor'
                onClose={onClose}
                primaryButtonText='Save'
                secondaryButtonText='Cancel'
                onPrimaryButtonClick={onSave}
                onSecondaryButtonClick={onCancel}
                primaryButtonLoading
            >
                <p>Content</p>
            </MinimizableDialog>,
        )
        const [cancel] = byTest(container, 'cancel-button')
        const [save] = byTest(container, 'save-button')
        const close = byTest(container, 'close-button')[1]!

        await expect(cancel).toHaveAttribute('aria-disabled', 'true')
        await expect(cancel).not.toBeDisabled()
        await waitFor(() => expect(cancel).toHaveAccessibleDescription('Wait until saved'))
        await expect(save).toHaveAttribute('aria-busy', 'true')
        await expect(save).toHaveAccessibleName('Save')

        cancel!.click()
        cancel!.focus()
        await userEvent.keyboard('{Enter}')
        save!.click()
        close.click()

        await expect(onCancel).not.toHaveBeenCalled()
        await expect(onSave).not.toHaveBeenCalled()
        await expect(onClose).not.toHaveBeenCalled()
    })

    it('announces the busy state in the dialog locale', async () => {
        const { container } = mount(
            <MinimizableDialog
                dataTest='dialog'
                open
                title='Editor'
                locale='no'
                onClose={() => undefined}
                primaryButtonText='Lagre'
                secondaryButtonText='Avbryt'
                onPrimaryButtonClick={() => undefined}
                onSecondaryButtonClick={() => undefined}
                primaryButtonLoading
            />,
        )

        await expect(container.querySelector('[role="status"]')).toHaveTextContent('Pågår')
        await waitFor(() =>
            expect(byTest(container, 'cancel-button')[0]).toHaveAccessibleDescription('Vent til lagringen er ferdig'),
        )
    })

    it('keeps a disabled primary focusable with its reason', async () => {
        const onSave = fn()
        const { container } = mount(
            <MinimizableDialog
                dataTest='dialog'
                open
                title='Editor'
                onClose={() => undefined}
                primaryButtonText='Save'
                onPrimaryButtonClick={onSave}
                primaryButtonDisabled
                primaryButtonDisabledReason='Fill in the name first'
            />,
        )
        const [save] = byTest(container, 'save-button')

        save!.focus()
        await expect(document.activeElement).toBe(save)
        await expect(save).toHaveAttribute('aria-disabled', 'true')
        await waitFor(() => expect(save).toHaveAccessibleDescription('Fill in the name first'))
        save!.click()
        await expect(onSave).not.toHaveBeenCalled()
    })

    it('keeps the footer buttons enabled when idle', async () => {
        const { container } = mount(
            <MinimizableDialog
                dataTest='dialog'
                open
                title='Editor'
                onClose={() => undefined}
                primaryButtonText='Save'
                secondaryButtonText='Cancel'
                onPrimaryButtonClick={() => undefined}
                onSecondaryButtonClick={() => undefined}
            />,
        )

        await expect(byTest(container, 'cancel-button')[0]).not.toHaveAttribute('aria-disabled')
        await expect(byTest(container, 'save-button')[0]).not.toHaveAttribute('aria-busy')
    })
})

describe('MinimizableDialog native Back (ASMA-8471)', () => {
    afterEach(cleanup)
    afterEach(() => {
        delete window.__ASMA__SHELL__
    })

    /** The window-scoped stack itself, not the module accessor — a component that registered into a
     *  per-bundle copy of the registry instead would still satisfy `getOverlayBackStackSize()`. */
    const backRegistryEntries = (): unknown[] => window.__asmaOverlayBackRegistry__?.entries ?? []

    /** Stand in for the `asma-core-helpers` adapter deferring a `history.push` behind the top
     *  overlay. No `register`, so nothing tries to drive a real guard from here. */
    const setPendingNavigation = (pendingNavigation: boolean): void => {
        window.__ASMA__SHELL__ = { overlayBack: { v: 1, enabled: true, pendingNavigation } }
    }

    it('closes through onClose while fullscreen', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialog dataTest='dialog' open fullScreenState title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())

        void requestCloseTopOverlayBack()

        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('closes through onClose while docked, the same way ✕ does (REQ-002)', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        void requestCloseTopOverlayBack()

        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not register once minimized while docked', async () => {
        const onClose = fn()
        const { container } = mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        await userEvent.click(container.querySelectorAll<HTMLButtonElement>('[data-testid="minimize-button"]')[1]!)

        await waitFor(() => expect(backRegistryEntries()).toHaveLength(0))
        void requestCloseTopOverlayBack()
        await expect(onClose).not.toHaveBeenCalled()
    })

    it('does not register once minimized, even while fullscreen', async () => {
        const onClose = fn()
        // `minimized` has no external control on this (v1) component, so it has to be reached the
        // same way a user would: click Minimize (only visible outside fullscreen) first, THEN switch
        // to fullscreen via a re-render with `fullScreenState` — the internal `minimized` state
        // survives the re-render since it's the same component instance.
        const { container, rerender } = mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await userEvent.click(container.querySelectorAll<HTMLButtonElement>('[data-testid="minimize-button"]')[1]!)
        await waitFor(() => expect(getOverlayBackStackSize()).toBe(0))

        rerender(
            <MinimizableDialog dataTest='dialog' open fullScreenState title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )

        await expect(getOverlayBackStackSize()).toBe(0)

        void requestCloseTopOverlayBack()
        await expect(onClose).not.toHaveBeenCalled()
    })

    /** A docked panel and a modal `StyledDialog`, each opened independently of the other. */
    const DockedUnderDialogFixture = ({
        dialogOpen,
        panelOpen,
        onDialogClose,
        onPanelClose,
    }: {
        dialogOpen: boolean
        panelOpen: boolean
        onDialogClose: () => void
        onPanelClose: () => void
    }): JSX.Element => (
        <>
            <StyledDialog dataTest='confirm' dialogTitle='Confirm' open={dialogOpen} onClose={onDialogClose}>
                <p>Dialog content</p>
            </StyledDialog>
            <MinimizableDialog dataTest='dialog' open={panelOpen} title='Editor' onClose={onPanelClose}>
                <p>Content</p>
            </MinimizableDialog>
        </>
    )

    it('closes a StyledDialog opened over a docked panel first, and the panel second (BACK-2)', async () => {
        const onDialogClose = fn()
        const onPanelClose = fn()
        const { rerender } = mount(
            <DockedUnderDialogFixture
                dialogOpen={false}
                panelOpen
                onDialogClose={onDialogClose}
                onPanelClose={onPanelClose}
            />,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        rerender(
            <DockedUnderDialogFixture dialogOpen panelOpen onDialogClose={onDialogClose} onPanelClose={onPanelClose} />,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(2))

        void requestCloseTopOverlayBack()
        await expect(onDialogClose).toHaveBeenCalledTimes(1)
        await expect(onPanelClose).not.toHaveBeenCalled()

        rerender(
            <DockedUnderDialogFixture
                dialogOpen={false}
                panelOpen
                onDialogClose={onDialogClose}
                onPanelClose={onPanelClose}
            />,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        void requestCloseTopOverlayBack()
        await expect(onPanelClose).toHaveBeenCalledTimes(1)
    })

    it('keeps a StyledDialog on top when the docked panel opens UNDER it (RISK-010)', async () => {
        const onDialogClose = fn()
        const onPanelClose = fn()
        // The inverse order: the panel registers LAST, so plain registration order would hand it the
        // Back press even though the modal <dialog> covers it and makes it inert.
        const { rerender } = mount(
            <DockedUnderDialogFixture
                dialogOpen
                panelOpen={false}
                onDialogClose={onDialogClose}
                onPanelClose={onPanelClose}
            />,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        rerender(
            <DockedUnderDialogFixture dialogOpen panelOpen onDialogClose={onDialogClose} onPanelClose={onPanelClose} />,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(2))

        void requestCloseTopOverlayBack()
        await expect(onDialogClose).toHaveBeenCalledTimes(1)
        await expect(onPanelClose).not.toHaveBeenCalled()

        rerender(
            <DockedUnderDialogFixture
                dialogOpen={false}
                panelOpen
                onDialogClose={onDialogClose}
                onPanelClose={onPanelClose}
            />,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        void requestCloseTopOverlayBack()
        await expect(onPanelClose).toHaveBeenCalledTimes(1)
    })

    it('closes a StyledDialog opened from inside a fullscreen panel first, then the panel', async () => {
        const onDialogClose = fn()
        const onPanelClose = fn()
        const PanelWithInnerDialog = ({ dialogOpen }: { dialogOpen: boolean }): JSX.Element => (
            <MinimizableDialog dataTest='dialog' open fullScreenState title='Editor' onClose={onPanelClose}>
                <StyledDialog dataTest='confirm' dialogTitle='Confirm' open={dialogOpen} onClose={onDialogClose}>
                    <p>Dialog content</p>
                </StyledDialog>
            </MinimizableDialog>
        )
        const { rerender } = mount(<PanelWithInnerDialog dialogOpen={false} />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        rerender(<PanelWithInnerDialog dialogOpen />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(2))

        void requestCloseTopOverlayBack()
        await expect(onDialogClose).toHaveBeenCalledTimes(1)
        await expect(onPanelClose).not.toHaveBeenCalled()

        rerender(<PanelWithInnerDialog dialogOpen={false} />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        void requestCloseTopOverlayBack()
        await expect(onPanelClose).toHaveBeenCalledTimes(1)
    })

    it('refuses a deferred route change while docked, so navigating leaves the panel open', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        setPendingNavigation(true)
        // `false` is the adapter's fail-open signal: strip the guard, navigate, leave this open.
        await expect(requestCloseTopOverlayBack()).toBe(false)
        await expect(onClose).not.toHaveBeenCalled()

        setPendingNavigation(false)
        void requestCloseTopOverlayBack()
        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('still closes on a deferred route change while fullscreen', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialog dataTest='dialog' open fullScreenState title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        setPendingNavigation(true)
        void requestCloseTopOverlayBack()

        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('consumes Back as a no-op, reported as false, when an unregistered modal covers every entry', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={onClose}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        // A modal <dialog> from a ui-core too old to register for Back — the only way the whole
        // stack ends up covered. It reaches the top-layer registry but never joins the Back stack.
        const legacyDialog = document.createElement('dialog')
        document.body.appendChild(legacyDialog)
        legacyDialog.showModal()
        const unregisterLegacyDialog = registerOpenModalDialog(legacyDialog)

        try {
            // Closing the panel here would close the WRONG layer and discard content the user
            // cannot see. `false` rather than `undefined` so a deferred push fails open at once
            // instead of waiting out a closer that is never going to run.
            await expect(requestCloseTopOverlayBack()).toBe(false)
            await expect(onClose).not.toHaveBeenCalled()
        } finally {
            unregisterLegacyDialog()
            legacyDialog.close()
            legacyDialog.remove()
        }

        // Nothing was lost: dismissing that dialog by its own path makes the panel the top again.
        void requestCloseTopOverlayBack()
        await expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('keeps exactly one registration across a fullscreen ↔ docked toggle (GUD-002)', async () => {
        const { container } = mount(
            <MinimizableDialog dataTest='dialog' open title='Editor' onClose={() => undefined}>
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))
        const [registeredWhileDocked] = backRegistryEntries()
        const fullscreenButton = container.querySelector<HTMLButtonElement>('[data-testid="fullscreen-button"]')!

        await userEvent.click(fullscreenButton)
        await waitFor(() => expect(fullscreenButton).toHaveAccessibleName('Exit full screen'))
        await expect(backRegistryEntries()).toHaveLength(1)
        // The SAME entry object, not a replacement: the effect never re-ran, so under a live history
        // adapter the armed guard survives the toggle instead of draining and re-arming.
        await expect(backRegistryEntries()[0]).toBe(registeredWhileDocked)

        await userEvent.click(fullscreenButton)
        await waitFor(() => expect(fullscreenButton).toHaveAccessibleName('Full screen'))
        await expect(backRegistryEntries()).toHaveLength(1)
        await expect(backRegistryEntries()[0]).toBe(registeredWhileDocked)
    })

    it('waits while the primary action runs, same as its ✕/Esc path', async () => {
        const onClose = fn()
        mount(
            <MinimizableDialog
                dataTest='dialog'
                open
                fullScreenState
                title='Editor'
                onClose={onClose}
                primaryButtonText='Save'
                onPrimaryButtonClick={() => undefined}
                primaryButtonLoading
            >
                <p>Content</p>
            </MinimizableDialog>,
        )
        await waitFor(() => expect(document.querySelector('[role="dialog"]')).not.toBeNull())

        const result = requestCloseTopOverlayBack()

        await expect(result).toBe(false)
        await expect(onClose).not.toHaveBeenCalled()
    })
})
