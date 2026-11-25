import { useRef, useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { useFocusTrap } from './useFocusTrap.hook'

const FocusTrapFixture = (): JSX.Element => {
    const [open, setOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)

    useFocusTrap(open, panelRef)

    return (
        <>
            <button type='button' data-testid='opener' onClick={() => setOpen(true)}>
                Open
            </button>
            {open && (
                <div ref={panelRef} role='dialog'>
                    <button type='button' data-testid='close' onClick={() => setOpen(false)}>
                        Close
                    </button>
                </div>
            )}
        </>
    )
}

describe('useFocusTrap', () => {
    afterEach(cleanup)

    it('restores the opener when its trapped panel unmounts', async () => {
        const { container } = mount(<FocusTrapFixture />)
        const opener = container.querySelector<HTMLButtonElement>('[data-testid="opener"]')!

        await userEvent.click(opener)
        const close = await waitFor(async () => {
            const button = container.querySelector<HTMLButtonElement>('[data-testid="close"]')
            await expect(button).not.toBeNull()
            return button!
        })

        await userEvent.click(close)

        await waitFor(() => expect(document.activeElement).toBe(opener))
    })
})

const EscapeFixture = ({ onEscape, children }: { onEscape: () => void; children?: React.ReactNode }): JSX.Element => {
    const panelRef = useRef<HTMLDivElement>(null)
    useFocusTrap(true, panelRef, onEscape)
    return (
        <div ref={panelRef} role='dialog' aria-label='Panel'>
            <button type='button' data-testid='inside'>
                Inside
            </button>
            {children}
        </div>
    )
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))
/** The trap moves focus onto its shell in a frame; focus a control only after that has happened. */
const afterTrapFocus = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

describe('useFocusTrap Escape', () => {
    afterEach(cleanup)

    it('keeps a modal dialog opened by onEscape open, instead of the same keypress cancelling it', async () => {
        const Fixture = (): JSX.Element => {
            const confirmRef = useRef<HTMLDialogElement>(null)
            return (
                <>
                    <EscapeFixture onEscape={() => confirmRef.current?.showModal()} />
                    <dialog ref={confirmRef} data-testid='confirm'>
                        Delete changes?
                    </dialog>
                </>
            )
        }
        const { container } = mount(<Fixture />)
        const confirm = container.querySelector<HTMLDialogElement>('[data-testid="confirm"]')!
        await afterTrapFocus()
        container.querySelector<HTMLButtonElement>('[data-testid="inside"]')!.focus()

        await userEvent.keyboard('{Escape}')
        await settle()

        await expect(confirm.open).toBe(true)
    })

    it('leaves an Escape that a nested layer already claimed alone', async () => {
        const onEscape = fn()
        const { container } = mount(
            <EscapeFixture onEscape={onEscape}>
                <input data-testid='claims' onKeyDown={(event) => event.key === 'Escape' && event.preventDefault()} />
            </EscapeFixture>,
        )
        await afterTrapFocus()
        container.querySelector<HTMLInputElement>('[data-testid="claims"]')!.focus()

        await userEvent.keyboard('{Escape}')

        await expect(onEscape).not.toHaveBeenCalled()
    })

    it('leaves an Escape from a dialog stacked on the panel to that dialog', async () => {
        const onEscape = fn()
        let reachedDialogListener = false
        const { container } = mount(
            <>
                <EscapeFixture onEscape={onEscape} />
                <dialog open data-testid='stacked'>
                    <button type='button' data-testid='stacked-button'>
                        Keep
                    </button>
                </dialog>
            </>,
        )
        const listener = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') reachedDialogListener = !event.defaultPrevented
        }
        window.addEventListener('keydown', listener)
        await afterTrapFocus()
        container.querySelector<HTMLButtonElement>('[data-testid="stacked-button"]')!.focus()

        await userEvent.keyboard('{Escape}')
        window.removeEventListener('keydown', listener)

        await expect(onEscape).not.toHaveBeenCalled()
        await expect(reachedDialogListener).toBe(true)
    })

    it('still calls onEscape for an Escape pressed inside the panel', async () => {
        const onEscape = fn()
        const { container } = mount(<EscapeFixture onEscape={onEscape} />)
        await afterTrapFocus()
        container.querySelector<HTMLButtonElement>('[data-testid="inside"]')!.focus()

        await userEvent.keyboard('{Escape}')

        await expect(onEscape).toHaveBeenCalledTimes(1)
    })
})
