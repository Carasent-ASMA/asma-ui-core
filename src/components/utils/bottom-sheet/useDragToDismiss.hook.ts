import { useRef, useState, type PointerEvent, type RefObject } from 'react'

/** Share of the sheet's own height it has to travel before a release dismisses it (spec: ~30%). */
const DISMISS_RATIO = 0.3
/** An upward drag this long (the 48px touch target) expands a sheet that has a taller height. */
const EXPAND_DISTANCE = 48
/** Movement below this stays a tap, so the drag handle keeps working as a button. */
const DRAG_SLOP = 4

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
    /** While the handle is dragged up on a sheet that can expand: its height under the finger, in px. */
    liftedHeight: number | null
}

/**
 * Drag the sheet down past 30% of its height to dismiss it; release earlier and it snaps back. Dragged
 * up, a sheet that could expand when the gesture started follows the finger (`liftedHeight`); released
 * after 48px, `onDragUp` expands it, earlier it settles back.
 *
 * The gesture owns the expandability it started with. A sheet grown under the finger stops overflowing
 * at half height, and the component then withdraws `onDragUp`; using that live value would drop the
 * lift mid-drag and skip the expansion on release.
 *
 * Deliberately never the only exit or the only way to resize (WCAG 2.5.7): the close button, the scrim
 * and Escape close it, and the drag handle toggles the height as a button. A press that starts on any
 * other button in the drag zone is left alone, so the close control keeps working as a plain click.
 * The pointer is captured only once it has moved, so a tap on the drag handle stays a click.
 */
export const useDragToDismiss = (
    sheetRef: RefObject<HTMLElement | null>,
    onDismiss: () => void,
    onDragUp?: () => void,
): DragToDismiss => {
    const [dragOffset, setDragOffset] = useState(0)
    const [liftedHeight, setLiftedHeight] = useState<number | null>(null)
    const drag = useRef<{
        pointerId: number
        startY: number
        height: number
        captured: boolean
        /** Frozen at pointerdown: the sheet's measurement may withdraw `onDragUp` mid-gesture. */
        onDragUp: (() => void) | undefined
    } | null>(null)

    const end = (event: PointerEvent<HTMLElement>, travelled: number): void => {
        const current = drag.current
        if (current?.pointerId !== event.pointerId) return
        drag.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
        setDragOffset(0)
        setLiftedHeight(null)
        if (!current.captured) return
        if (travelled > current.height * DISMISS_RATIO) onDismiss()
        else if (travelled < -EXPAND_DISTANCE) current.onDragUp?.()
    }

    return {
        dragOffset,
        liftedHeight,
        dragHandleProps: {
            onPointerDown: (event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return
                if (event.target instanceof Element && event.target.closest('button:not([data-drag-handle])')) return
                const sheet = sheetRef.current
                if (!sheet) return
                drag.current = {
                    pointerId: event.pointerId,
                    startY: event.clientY,
                    height: sheet.getBoundingClientRect().height,
                    captured: false,
                    onDragUp,
                }
            },
            onPointerMove: (event) => {
                const current = drag.current
                if (current?.pointerId !== event.pointerId) return
                const travelled = event.clientY - current.startY
                if (!current.captured) {
                    if (Math.abs(travelled) < DRAG_SLOP) return
                    current.captured = true
                    try {
                        event.currentTarget.setPointerCapture(event.pointerId)
                    } catch {
                        // The pointer was already released — the drag just won't track outside the
                        // handle row, which is harmless.
                    }
                }
                setDragOffset(Math.max(0, travelled))
                setLiftedHeight(current.onDragUp && travelled < 0 ? current.height - travelled : null)
            },
            onPointerUp: (event) => {
                const current = drag.current
                end(event, current ? event.clientY - current.startY : 0)
            },
            onPointerCancel: (event) => {
                end(event, 0)
            },
        },
    }
}
