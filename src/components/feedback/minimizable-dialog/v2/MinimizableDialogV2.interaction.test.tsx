import { afterEach, describe, it } from 'vitest'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { MinimizableDialogV2 } from './MinimizableDialogV2'

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
        await waitFor(() => expect(container.querySelector('[role="dialog"]')).not.toBeNull())

        toggle().focus()
        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeNull())
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
        const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!

        await waitFor(() => expect(document.activeElement).toBe(dialog))
        await userEvent.tab()
        await expect(dialog.contains(document.activeElement)).toBe(true)
        await userEvent.tab({ shift: true })
        await expect(dialog.contains(document.activeElement)).toBe(true)
    })

    it('keeps focus on the opener while docked and on Exit fullscreen after a pointer transition (2.4.3)', async () => {
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
        await userEvent.click(opener)
        await expect(document.activeElement).toBe(opener)

        await userEvent.tab()
        await expect(document.activeElement).toBe(container.querySelectorAll('[data-testid="toggle-minimize-btn"]')[1])

        const fullscreenButton = container.querySelector<HTMLButtonElement>('[data-testid="fullscreen-button"]')!
        await userEvent.click(fullscreenButton)
        await waitFor(() => expect(fullscreenButton).toHaveAccessibleName('Exit fullscreen'))
        await expect(document.activeElement).toBe(fullscreenButton)
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
})
