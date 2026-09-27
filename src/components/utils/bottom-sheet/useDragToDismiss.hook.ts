import { useRef, useState, type PointerEvent, type RefObject } from 'react'

/** Share of the sheet's own height it has to travel before a release dismisses it (spec: ~30%). */
const DISMISS_RATIO = 0.3

interface DragHandleProps {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void
    onPointerMove: (event: PointerEvent<HTMLElement>) => void
    onPointerUp: (event: PointerEvent<HTMLElement>) => void
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void
}

interface DragToDismiss {
    /** Spread on the drag zone — the 48px handle row. */
    dragHandleProps: DragHandleProps
    /** How far the sheet is currently dragged down, in px. `0` when at rest. */
    dragOffset: number
}

/**
 * Drag the sheet down past 30% of its height to dismiss it; release earlier and it snaps back.
 *
 * Deliberately never the only exit (WCAG 2.5.7): the close button, the scrim and Escape all do the
 * same without a dragging movement. A press that starts on a button in the drag zone is left alone,
 * so the close control keeps working as a plain click.
 */
export const useDragToDismiss = (sheetRef: RefObject<HTMLElement | null>, onDismiss: () => void): DragToDismiss => {
    const [dragOffset, setDragOffset] = useState(0)
    const drag = useRef<{ pointerId: number; startY: number; height: number } | null>(null)

    const end = (event: PointerEvent<HTMLElement>, shouldDismiss: boolean): void => {
        const current = drag.current
        if (current?.pointerId !== event.pointerId) return
        drag.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
        setDragOffset(0)
        if (shouldDismiss) onDismiss()
    }

    return {
        dragOffset,
        dragHandleProps: {
            onPointerDown: (event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return
                if (event.target instanceof Element && event.target.closest('button')) return
                const sheet = sheetRef.current
                if (!sheet) return
                drag.current = {
                    pointerId: event.pointerId,
                    startY: event.clientY,
                    height: sheet.getBoundingClientRect().height,
                }
                try {
                    event.currentTarget.setPointerCapture(event.pointerId)
                } catch {
                    // The pointer was already released (e.g. a very quick tap) — the drag just won't
                    // track outside the handle, which is harmless.
                }
            },
            onPointerMove: (event) => {
                const current = drag.current
                if (current?.pointerId !== event.pointerId) return
                setDragOffset(Math.max(0, event.clientY - current.startY))
            },
            onPointerUp: (event) => {
                const current = drag.current
                const travelled = current ? event.clientY - current.startY : 0
                end(event, current !== null && travelled > current.height * DISMISS_RATIO)
            },
            onPointerCancel: (event) => {
                end(event, false)
            },
        },
    }
}
