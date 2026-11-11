import { useEffect, useRef, useState, type PointerEvent, type RefObject } from 'react'

/** Share of the sheet's own height it has to travel before a release dismisses it (spec: ~30%). */
const DISMISS_RATIO = 0.3
/** An upward drag this long (the 48px touch target) expands a sheet that has a taller height. */
const EXPAND_DISTANCE = 48
/** Movement below this stays a tap, so the drag handle keeps working as a button. */
const DRAG_SLOP = 4
/** A release faster than this (px/ms, about 500px/s) is a fling: it dismisses or expands at any distance. */
const FLING_VELOCITY = 0.5
/** Only the last stretch of the movement counts towards the release velocity. */
const VELOCITY_WINDOW_MS = 80

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
    /** `dragOffset` as a share of the sheet's height, for the scrim to fade with the drag. */
    dragRatio: number
    /** While the sheet is dragged up and can expand: its height under the finger, in px. */
    liftedHeight: number | null
}

interface Gesture {
    startY: number
    height: number
    captured: boolean
    /** Frozen at the start: the sheet's measurement may withdraw `onDragUp` mid-gesture. */
    onDragUp: (() => void) | undefined
    /** Frozen at the start: set while the sheet is expanded, so a drag down returns it to half. */
    onCollapse: (() => void) | undefined
    samples: { y: number; t: number }[]
}

/**
 * Drag the sheet down past 30% of its height, or fling it down, to dismiss it; release earlier and it
 * settles back. Dragged up, a sheet that could expand when the gesture started follows the finger
 * (`liftedHeight`); released after 48px or flung up, `onDragUp` expands it, otherwise it settles back.
 * The way back is a drag too: an expanded sheet (`onCollapse`) dragged down 48px or flung down returns
 * to half height, and only a drag that leaves less than 70% of that half on screen dismisses it.
 *
 * The drag starts on the handle row (any pointer) or, on touch, anywhere in the `body` while
 * the body is scrolled to its top and the finger moves down, or while the sheet can still expand and the
 * finger moves up — as Material's bottom sheet does. Otherwise the body just scrolls.
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
    onCollapse?: () => void,
    body?: HTMLElement | null,
): DragToDismiss => {
    const [dragOffset, setDragOffset] = useState(0)
    const [dragRatio, setDragRatio] = useState(0)
    const [liftedHeight, setLiftedHeight] = useState<number | null>(null)
    const handleDrag = useRef<(Gesture & { pointerId: number }) | null>(null)
    const latest = useRef({ onDismiss, onDragUp, onCollapse })
    useEffect(() => {
        latest.current = { onDismiss, onDragUp, onCollapse }
    }, [onDismiss, onDragUp, onCollapse])

    const begin = (y: number): Gesture | null => {
        const sheet = sheetRef.current
        if (!sheet) return null
        const t = performance.now()
        return {
            startY: y,
            height: sheet.getBoundingClientRect().height,
            captured: false,
            onDragUp: latest.current.onDragUp,
            onCollapse: latest.current.onCollapse,
            samples: [{ y, t }],
        }
    }

    const follow = (gesture: Gesture, y: number): void => {
        const t = performance.now()
        gesture.samples.push({ y, t })
        while (gesture.samples.length > 2 && t - (gesture.samples[0]?.t ?? t) > VELOCITY_WINDOW_MS) {
            gesture.samples.shift()
        }
        const travelled = y - gesture.startY
        const offset = Math.max(0, travelled)
        setDragOffset(offset)
        setDragRatio(gesture.height ? Math.min(1, offset / gesture.height) : 0)
        setLiftedHeight(gesture.onDragUp && travelled < 0 ? gesture.height - travelled : null)
    }

    const finish = (gesture: Gesture, y: number | null): void => {
        setDragOffset(0)
        setDragRatio(0)
        setLiftedHeight(null)
        if (!gesture.captured || y === null) return
        const travelled = y - gesture.startY
        const first = gesture.samples[0]
        const elapsed = first ? performance.now() - first.t : 0
        const velocity = first && elapsed > 0 ? (y - first.y) / elapsed : 0
        if (gesture.onCollapse && travelled > 0) {
            const halfHeight = window.innerHeight / 2
            if (velocity >= 0 && gesture.height - travelled < halfHeight * (1 - DISMISS_RATIO)) {
                latest.current.onDismiss()
            } else if (velocity > FLING_VELOCITY || (velocity >= 0 && travelled > EXPAND_DISTANCE)) {
                gesture.onCollapse()
            }
            return
        }
        if (velocity > FLING_VELOCITY || (velocity >= 0 && travelled > gesture.height * DISMISS_RATIO)) {
            latest.current.onDismiss()
        } else if (velocity < -FLING_VELOCITY || travelled < -EXPAND_DISTANCE) {
            gesture.onDragUp?.()
        }
    }

    // Touch drags that start in the body. Native listeners: `touchmove` has to be non-passive to stop
    // the body from scrolling while the sheet follows the finger instead.
    useEffect(() => {
        if (!body) return undefined
        let gesture: Gesture | null = null
        let decided = false
        let startX = 0

        const onStart = (event: TouchEvent): void => {
            const touch = event.touches[0]
            if (event.touches.length !== 1 || !touch) return
            const target = event.target instanceof Element ? event.target : null
            if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
            gesture = begin(touch.clientY)
            decided = false
            startX = touch.clientX
        }
        const onMove = (event: TouchEvent): void => {
            const touch = event.touches[0]
            if (!gesture || !touch) return
            const dy = touch.clientY - gesture.startY
            if (!decided) {
                const dx = touch.clientX - startX
                if (Math.abs(dy) < DRAG_SLOP && Math.abs(dx) < DRAG_SLOP) return
                decided = true
                const pullsDownAtTop = dy > 0 && body.scrollTop <= 0
                const pushesUpToExpand = dy < 0 && Boolean(gesture.onDragUp)
                if (Math.abs(dy) <= Math.abs(dx) || (!pullsDownAtTop && !pushesUpToExpand)) {
                    gesture = null
                    return
                }
                gesture.captured = true
                // Start from here, so the sheet does not jump by the slop.
                gesture.startY = touch.clientY
            }
            if (event.cancelable) event.preventDefault()
            follow(gesture, touch.clientY)
        }
        const onEnd = (event: TouchEvent): void => {
            const current = gesture
            gesture = null
            if (!current) return
            const touch = event.changedTouches[0]
            finish(current, event.type === 'touchcancel' || !touch ? null : touch.clientY)
        }

        body.addEventListener('touchstart', onStart, { passive: true })
        body.addEventListener('touchmove', onMove, { passive: false })
        body.addEventListener('touchend', onEnd)
        body.addEventListener('touchcancel', onEnd)
        return () => {
            body.removeEventListener('touchstart', onStart)
            body.removeEventListener('touchmove', onMove)
            body.removeEventListener('touchend', onEnd)
            body.removeEventListener('touchcancel', onEnd)
        }
        // `begin`/`follow`/`finish` only touch refs and state setters; the body element is what matters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [body])

    const endHandle = (event: PointerEvent<HTMLElement>, y: number | null): void => {
        const current = handleDrag.current
        if (current?.pointerId !== event.pointerId) return
        handleDrag.current = null
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
        finish(current, y)
    }

    return {
        dragOffset,
        dragRatio,
        liftedHeight,
        dragHandleProps: {
            onPointerDown: (event) => {
                if (event.pointerType === 'mouse' && event.button !== 0) return
                if (event.target instanceof Element && event.target.closest('button:not([data-drag-handle])')) return
                const gesture = begin(event.clientY)
                if (gesture) handleDrag.current = { ...gesture, pointerId: event.pointerId }
            },
            onPointerMove: (event) => {
                const current = handleDrag.current
                if (current?.pointerId !== event.pointerId) return
                if (!current.captured) {
                    if (Math.abs(event.clientY - current.startY) < DRAG_SLOP) return
                    current.captured = true
                    try {
                        event.currentTarget.setPointerCapture(event.pointerId)
                    } catch {
                        // The pointer was already released — the drag just won't track outside the
                        // handle row, which is harmless.
                    }
                }
                follow(current, event.clientY)
            },
            onPointerUp: (event) => {
                endHandle(event, event.clientY)
            },
            onPointerCancel: (event) => {
                endHandle(event, null)
            },
        },
    }
}
