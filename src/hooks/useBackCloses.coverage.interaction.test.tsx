import { afterEach, describe, it } from 'vitest'
import { expect, fn, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledDialog } from 'src/components/feedback/dialog/StyledDialog'
import { MinimizableDialog } from 'src/components/feedback/minimizable-dialog/MinimizableDialog'
import { getOverlayBackStackSize } from 'src/hooks/useBackCloses.hook'

/**
 * The two cases a green suite missed: a forced native close (Android's second Back) and a closer
 * from an older copy of this module, which reduces the shared entries array and has no coverage check.
 */

describe('overlay back coverage', () => {
    afterEach(() => {
        cleanup()
        delete window.__ASMA__SHELL__
        delete window.__asmaOverlayBackRegistry__
        delete window.__asmaOpenModalDialogRegistry__
    })

    it('a forced native close of a no-safe-choice dialog does not dismiss the dialog under it', async () => {
        window.__ASMA__SHELL__ = { overlayBack: { v: 1, enabled: true } }
        const lowerClose = fn()
        const Fixture = ({ topOpen }: { topOpen: boolean }): JSX.Element => (
            <>
                <StyledDialog dataTest='lower' dialogTitle='Editor' open onClose={lowerClose}>
                    Editor content
                </StyledDialog>
                <StyledDialog dataTest='upper' dialogTitle='Required choice' open={topOpen}>
                    Required choice
                </StyledDialog>
            </>
        )
        const { rerender } = mount(<Fixture topOpen={false} />)
        rerender(<Fixture topOpen />)
        const upper = document.querySelector<HTMLDialogElement>('[data-testid="upper"]')!
        upper.dispatchEvent(new Event('cancel', { cancelable: true }))
        await expect(lowerClose).not.toHaveBeenCalled()
        upper.close()
        await waitFor(() => expect(upper.open).toBe(true))
        await expect(lowerClose).not.toHaveBeenCalled()
    })

    it('a reducer with no coverage check of its own still skips a covered docked panel', async () => {
        window.__ASMA__SHELL__ = {
            overlayBack: { v: 1, enabled: true, register: () => () => undefined },
        }
        const modalClose = fn()
        const panelClose = fn()
        mount(
            <>
                <StyledDialog dataTest='modal' dialogTitle='Modal' open onClose={modalClose}>
                    Modal content
                </StyledDialog>
                <MinimizableDialog dataTest='panel' title='Editor' open onClose={panelClose} />
            </>,
        )
        await waitFor(() => expect(getOverlayBackStackSize()).toBe(2))
        const entries = window.__asmaOverlayBackRegistry__?.entries ?? []
        type Entry = (typeof entries)[number]
        // What the published 3.109 closer does when neither entry owns the other: the later one wins.
        const top = entries.reduce<Entry | undefined>((_selected, candidate) => candidate, undefined)
        void top?.requestClose()
        await expect(modalClose).toHaveBeenCalledTimes(1)
        await expect(panelClose).not.toHaveBeenCalled()
    })
})
