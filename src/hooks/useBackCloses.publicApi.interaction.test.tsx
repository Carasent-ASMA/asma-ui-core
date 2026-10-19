import { afterEach, describe, it } from 'vitest'
import { useRef, useState } from 'react'
import { expect, fn, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { useBackCloses, type OverlayBackRequestClose } from 'asma-ui-core'
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
})
