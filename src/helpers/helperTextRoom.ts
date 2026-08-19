/**
 * How far the helper row (hint / error message) may run past the field's own right edge (REQ-013).
 *
 * A field is routinely narrower than its own message — a 160px phone input against
 * "Invalid phone — Ex: +47 12 34 56 78". Wrapping grows the row and pushes the layout down, the very
 * shift the always-mounted slot exists to prevent, so the message spills sideways instead — but only
 * into space measured to be free, which is what makes it safe fleet-wide.
 *
 * Pure geometry, kept out of the component because jsdom reports every rect as zero.
 */

/** The helper row's own right inset (`mr-[14px]`), which sits outside its `max-width` box. */
const HELPER_ROW_RIGHT_INSET = 14

/** Breathing room kept between a spilled message and whatever sits to its right. */
const NEIGHBOUR_GUTTER = 8

/** Reserved height of one helper line (`min-h-[24px]`, Figma 15561-37857). */
const HELPER_ROW_LINE_HEIGHT = 24

/** The subset of `DOMRect` this module reads — `DOMRect` structurally satisfies it. */
export interface EdgeBox {
    top: number
    right: number
    bottom: number
    left: number
}

/**
 * Leftmost edge that blocks the helper row: the nearest neighbour sharing its horizontal band.
 *
 * Neighbours above or below are irrelevant — the message only ever spills sideways — and so is
 * anything already to the left of the field. Returns `Infinity` when nothing is in the way.
 */
export function blockingLeftEdge(band: EdgeBox, neighbours: EdgeBox[]): number {
    let edge = Number.POSITIVE_INFINITY

    for (const box of neighbours) {
        // Unrendered siblings (display:none, empty wrappers) collapse to an empty rect at 0,0 and
        // would otherwise read as a neighbour pinned to the viewport's left edge.
        if (box.right <= box.left || box.bottom <= box.top) continue
        if (box.left < band.left) continue
        if (box.bottom <= band.top || box.top >= band.bottom) continue

        edge = Math.min(edge, box.left - NEIGHBOUR_GUTTER)
    }

    return edge
}

/**
 * Width budget for the helper row, or `undefined` for "leave the row alone" — which covers both an
 * unmeasured field and nothing to borrow, and is exactly its pre-REQ-013 behaviour.
 *
 * Returning the field's own width instead looks equivalent and is not: a field root is `inline-flex`,
 * so a helper row that is its widest child *sizes* the root, and capping at that width caps the row
 * at its own requirement — one sub-pixel of font-metric drift then wraps a message that used to fit.
 */
export function helperRowMaxWidth(fieldLeft: number, fieldWidth: number, limitRight: number): number | undefined {
    if (!(fieldWidth > 0)) return undefined

    const insideField = fieldWidth - HELPER_ROW_RIGHT_INSET
    const borrowed = limitRight - fieldLeft - HELPER_ROW_RIGHT_INSET

    return Number.isFinite(borrowed) && borrowed > insideField ? Math.floor(borrowed) : undefined
}

/** Content-box right edge. `clientWidth`/`clientLeft` exclude borders and any vertical scrollbar. */
function contentRight(element: Element): number {
    const { left } = element.getBoundingClientRect()
    const paddingRight = Number.parseFloat(getComputedStyle(element).paddingRight) || 0

    return left + element.clientLeft + element.clientWidth - paddingRight
}

/**
 * Right edge of the first ancestor that would clip a message running past the field.
 *
 * Without this the row could be told it has room that a scroll container will cut off — a truncated
 * error is worse than a wrapped one.
 */
function clippingAncestorRight(field: HTMLElement): number {
    for (let ancestor = field.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (getComputedStyle(ancestor).overflowX !== 'visible') return contentRight(ancestor)
    }

    return Number.POSITIVE_INFINITY
}

/** Measures the live layout and returns the helper row's width budget. */
export function measureHelperRowMaxWidth(field: HTMLElement, helperRow: HTMLElement): number | undefined {
    const parent = field.parentElement
    if (!parent) return undefined

    const fieldBox = field.getBoundingClientRect()
    const helperTop = helperRow.getBoundingClientRect().top
    // Deliberately the reserved single-line height rather than the row's current height: a clamped
    // message wraps and grows taller, a taller band finds more neighbours, more neighbours clamp it
    // further — a measurement that feeds on its own result oscillates. One line is a fixed reference.
    const band: EdgeBox = {
        top: helperTop,
        bottom: helperTop + HELPER_ROW_LINE_HEIGHT,
        left: fieldBox.left,
        right: fieldBox.right,
    }

    const neighbours = Array.from(parent.children)
        .filter((child) => child !== field)
        .map((child) => child.getBoundingClientRect())

    const limitRight = Math.min(
        contentRight(parent),
        clippingAncestorRight(field),
        blockingLeftEdge(band, neighbours),
    )

    return helperRowMaxWidth(fieldBox.left, fieldBox.width, limitRight)
}
