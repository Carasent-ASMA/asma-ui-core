import { useEffect, useRef, useState, type RefObject } from 'react'

/** The sort slot of an unsorted header is 20px wide and exists only while the header is hovered or keyboard-focused (UX, OQ-07). */
const SORT_SLOT_WIDTH = 20

const isClipped = (element: HTMLElement): boolean => element.scrollWidth > element.clientWidth

/**
 * Whether a header's label is cut short by its column, as an ellipsis shows it, or is about to be.
 *
 * A text header is the label element itself, and an element header (a function header) is a child that the stylesheet
 * clamps to the label, so both are read. `scrollWidth` and `clientWidth` are whole pixels, so an overflow of less
 * than half a pixel is not seen.
 *
 * An unsorted sortable header takes its 20px slot from the label while it is hovered or keyboard-focused. A label with
 * less than that left over is cut short the moment the pointer arrives, so it counts as truncated at rest: the
 * tooltip has to be ready for that hover, because it cannot open for a pointer that is already there.
 */
export const isHeaderLabelTruncated = (row: HTMLElement, label: HTMLElement): boolean => {
    if (isClipped(label)) return true
    if (Array.from(label.children).some((child) => child instanceof HTMLElement && isClipped(child))) return true

    const slot = row.querySelector<HTMLElement>('[data-sort-state]')
    if (!slot) return false

    const slotMissing = SORT_SLOT_WIDTH - slot.getBoundingClientRect().width
    if (slotMissing <= 0) return false

    const style = getComputedStyle(row)
    const rowContentRight = row.getBoundingClientRect().right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth)
    const roomLeft = rowContentRight - label.getBoundingClientRect().right

    return roomLeft < slotMissing
}

/**
 * Tells a header cell whether its label is truncated, and keeps telling it as the column is resized, the label
 * changes or the sort slot opens (ASMA-8597, a tooltip for the truncated header text).
 *
 * `rowRef` goes on the header's content row (the sortable element) and `labelRef` on the label's box. Two observers
 * between them see every change that can alter the answer:
 * - a `ResizeObserver` on the row and the label sees a resize of the column, the sort slot opening and a text that
 *   changes the width of a label that is as wide as its text (a sortable header's), and gives the first answer;
 * - a `MutationObserver` on the label's content sees the text, the children and the `style` and `class` of anything in it
 *   change. A header that cannot sort fills its column, so a new text, or a `style` or `class` that widens it, at the same
 *   column width changes only the label's `scrollWidth`, which no resize observation reports. Only those two attributes
 *   are watched, and nothing this hook, the tooltip or the header does sets one inside the label, so measuring never
 *   causes the next measuring (a test counts the callbacks).
 * Nothing is measured while `enabled` is false.
 */
export const useHeaderTruncation = (
    enabled: boolean,
): { rowRef: RefObject<HTMLDivElement>; labelRef: RefObject<HTMLDivElement>; truncated: boolean } => {
    const rowRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLDivElement>(null)
    const [truncated, setTruncated] = useState(false)

    useEffect(() => {
        const row = rowRef.current
        const label = labelRef.current
        if (!enabled || !row || !label || typeof ResizeObserver === 'undefined') return undefined

        const measure = (): void => setTruncated(isHeaderLabelTruncated(row, label))
        const resizeObserver = new ResizeObserver(measure)
        resizeObserver.observe(row)
        resizeObserver.observe(label)
        const mutationObserver = new MutationObserver(measure)
        mutationObserver.observe(label, {
            attributeFilter: ['style', 'class'],
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
        })

        return () => {
            resizeObserver.disconnect()
            mutationObserver.disconnect()
        }
    }, [enabled])

    return { rowRef, labelRef, truncated: enabled && truncated }
}
