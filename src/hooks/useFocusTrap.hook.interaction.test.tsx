import { useRef, useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
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
