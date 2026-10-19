import { afterEach, describe, it } from 'vitest'
import { useRef, useState } from 'react'
import { expect, fn, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import {
    OverlayBackOwnerContext,
    useBackCloses,
    type OverlayBackRequestClose,
    type UseBackClosesOptions,
} from 'asma-ui-core'
import { StyledDialog } from 'src/components/feedback/dialog/StyledDialog'
import { requestCloseTopOverlayBack } from 'src/hooks/useBackCloses.hook'

/**
 * ASMA-8471 — the hook has to be reachable from the PACKAGE ENTRY POINT, not just from a deep
 * `src/` path no consumer can import.
 *
 * Fleet-plan TASK-C2(b) instructs every Phase C app to wire `useBackCloses` onto any dismissable
 * overlay of its own that is not built on a ui-core component. An app can only do that if the hook
 * is in `src/index.ts`. This suite pins the export and that what comes out of it is the working
 * hook, so the barrel entry cannot be dropped in a later tidy-up without a red test.
 */
describe('useBackCloses public export (fleet plan TASK-C2)', () => {
    afterEach(cleanup)

    const backRegistryEntries = (): unknown[] => window.__asmaOverlayBackRegistry__?.entries ?? []

    it('registers a hand-rolled, non-ui-core overlay and closes it on Back', async () => {
        const onClose = fn()
        // Deliberately a plain <div> owning its own `open` state: this is the shape a Phase C app
        // wires up, with no ui-core overlay component involved anywhere.
        const CustomOverlay = (): JSX.Element | null => {
            const [open, setOpen] = useState(true)
            const panelRef = useRef<HTMLDivElement | null>(null)
            const requestClose: OverlayBackRequestClose = () => {
                onClose()
                setOpen(false)
            }
            useBackCloses({ active: open, requestClose, ownerRef: panelRef })

            if (!open) return null
            return <div ref={panelRef}>A hand-rolled overlay</div>
        }

        const { container } = mount(<CustomOverlay />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        void requestCloseTopOverlayBack()

        await expect(onClose).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(container.textContent).not.toContain('A hand-rolled overlay'))
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(0))
    })

    it('exposes OverlayBackOwnerContext so a custom overlay can own a ui-core overlay inside it', async () => {
        const onPanelClose = fn()
        const onDialogClose = fn()
        // The Phase C shape the context exists for: an app's own overlay with a ui-core overlay
        // rendered inside it. The dialog portals out of the panel's DOM subtree, so only the
        // provider can say the two are nested — without it, Back would be free to close the panel
        // (registered later) before the dialog on top of it.
        const CustomOverlayWithDialog = ({ dialogOpen }: { dialogOpen: boolean }): JSX.Element => {
            const panelRef = useRef<HTMLDivElement | null>(null)
            useBackCloses({
                active: true,
                requestClose: () => {
                    onPanelClose()
                },
                ownerRef: panelRef,
            })

            return (
                <div ref={panelRef}>
                    <OverlayBackOwnerContext.Provider value={panelRef}>
                        <StyledDialog dataTest='inner' dialogTitle='Inner' open={dialogOpen} onClose={onDialogClose}>
                            <p>Dialog content</p>
                        </StyledDialog>
                    </OverlayBackOwnerContext.Provider>
                </div>
            )
        }

        const { rerender } = mount(<CustomOverlayWithDialog dialogOpen={false} />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        rerender(<CustomOverlayWithDialog dialogOpen />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(2))

        void requestCloseTopOverlayBack()
        await expect(onDialogClose).toHaveBeenCalledTimes(1)
        await expect(onPanelClose).not.toHaveBeenCalled()

        rerender(<CustomOverlayWithDialog dialogOpen={false} />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        void requestCloseTopOverlayBack()
        await expect(onPanelClose).toHaveBeenCalledTimes(1)
    })

    it('exposes UseBackClosesOptions as the named options type', async () => {
        const onClose = fn()
        const CustomOverlay = (): JSX.Element => {
            const panelRef = useRef<HTMLDivElement | null>(null)
            // Typing the options object through the exported name is the point of this test: a
            // consumer must be able to build one without reaching for `Parameters<typeof …>`.
            const backCloses: UseBackClosesOptions = {
                active: true,
                requestClose: () => {
                    onClose()
                },
                ownerRef: panelRef,
            }
            useBackCloses(backCloses)
            return <div ref={panelRef}>Typed overlay</div>
        }

        mount(<CustomOverlay />)
        await waitFor(() => expect(backRegistryEntries()).toHaveLength(1))

        void requestCloseTopOverlayBack()

        await expect(onClose).toHaveBeenCalledTimes(1)
    })
})
