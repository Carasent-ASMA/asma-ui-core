import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { ClickAwayListener } from './ClickAwayListener'

/** A popup mounted by a click on a button outside it — how a select or tree picker opens. */
const ClickOpenedPopup = ({ onClickAway }: { onClickAway: () => void }): JSX.Element => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <button type='button' data-testid='opener' onClick={() => setOpen(true)}>
                Open
            </button>
            <button type='button' data-testid='outside'>
                Outside
            </button>
            {open && (
                <ClickAwayListener
                    onClickAway={() => {
                        setOpen(false)
                        onClickAway()
                    }}
                >
                    <div data-testid='popup'>Popup</div>
                </ClickAwayListener>
            )}
        </>
    )
}

const byTestId = (container: HTMLElement, id: string): HTMLElement | null =>
    container.querySelector<HTMLElement>(`[data-testid="${id}"]`)

describe('ClickAwayListener', () => {
    afterEach(cleanup)

    // ASMA-8421: the QNR designer's rule question picker closed on the click that opened it.
    it('does not treat the click that opened it as a click away', async () => {
        const onClickAway = fn()
        const { container } = mount(<ClickOpenedPopup onClickAway={onClickAway} />)

        await userEvent.click(byTestId(container, 'opener')!)
        await new Promise((resolve) => setTimeout(resolve, 50))

        await expect(byTestId(container, 'popup')).not.toBeNull()
        await expect(onClickAway).not.toHaveBeenCalled()
    })

    it('ignores clicks inside and closes on a later click outside', async () => {
        const onClickAway = fn()
        const { container } = mount(<ClickOpenedPopup onClickAway={onClickAway} />)

        await userEvent.click(byTestId(container, 'opener')!)
        await userEvent.click(byTestId(container, 'popup')!)
        await expect(byTestId(container, 'popup')).not.toBeNull()

        await userEvent.click(byTestId(container, 'outside')!)

        await waitFor(() => expect(byTestId(container, 'popup')).toBeNull())
        await expect(onClickAway).toHaveBeenCalledTimes(1)
    })
})
