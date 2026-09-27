import { afterEach, describe, it } from 'vitest'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { MinimizableDialog } from './MinimizableDialog'

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
