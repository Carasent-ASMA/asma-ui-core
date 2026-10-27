const HELPER_ROW_RIGHT_INSET = 14

const NEIGHBOUR_GUTTER = 8

const HELPER_ROW_LINE_HEIGHT = 24

export interface EdgeBox {
    top: number
    right: number
    bottom: number
    left: number
}

export function blockingLeftEdge(band: EdgeBox, neighbours: EdgeBox[]): number {
    let edge = Number.POSITIVE_INFINITY

    for (const box of neighbours) {
        if (box.right <= box.left || box.bottom <= box.top) continue
        if (box.left < band.left) continue
        if (box.bottom <= band.top || box.top >= band.bottom) continue

        edge = Math.min(edge, box.left - NEIGHBOUR_GUTTER)
    }

    return edge
}

export function helperRowMaxWidth(fieldLeft: number, fieldWidth: number, limitRight: number): number | undefined {
    if (!(fieldWidth > 0)) return undefined

    const insideField = fieldWidth - HELPER_ROW_RIGHT_INSET
    const borrowed = limitRight - fieldLeft - HELPER_ROW_RIGHT_INSET

    return Number.isFinite(borrowed) && borrowed > insideField ? Math.floor(borrowed) : undefined
}

function contentRight(element: Element): number {
    const { left } = element.getBoundingClientRect()
    const paddingRight = Number.parseFloat(getComputedStyle(element).paddingRight) || 0

    return left + element.clientLeft + element.clientWidth - paddingRight
}

function clippingAncestorRight(field: HTMLElement): number {
    for (let ancestor = field.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (getComputedStyle(ancestor).overflowX !== 'visible') return contentRight(ancestor)
    }

    return Number.POSITIVE_INFINITY
}

/** A picker marks its root with this attribute: its helper row may use the room around the whole picker. */
const HELPER_ROOM_BOX_SELECTOR = '[data-helper-room-box]'

interface HelperRoom {
    container: HTMLElement
    neighbours: Element[]
}

/**
 * A plain field measures against its parent. A marked picker climbs past the wrappers that end where
 * it ends, to the first ancestor with room to its right, collecting every sibling on the way.
 */
export function findHelperRoom(field: HTMLElement): HelperRoom | undefined {
    const picker = field.closest(HELPER_ROOM_BOX_SELECTOR)
    let box: Element = picker ?? field
    const neighbours: Element[] = []

    for (let parent = box.parentElement; parent; box = parent, parent = parent.parentElement) {
        neighbours.push(...Array.from(parent.children).filter((child) => child !== box))
        if (!picker || !parent.parentElement || contentRight(parent) > box.getBoundingClientRect().right + 0.5) {
            return { container: parent, neighbours }
        }
    }

    return undefined
}

export function measureHelperRowMaxWidth(field: HTMLElement, helperRow: HTMLElement): number | undefined {
    const room = findHelperRoom(field)
    if (!room) return undefined

    const fieldBox = field.getBoundingClientRect()
    const helperTop = helperRow.getBoundingClientRect().top
    const band: EdgeBox = {
        top: helperTop,
        bottom: helperTop + HELPER_ROW_LINE_HEIGHT,
        left: fieldBox.left,
        right: fieldBox.right,
    }

    const limitRight = Math.min(
        contentRight(room.container),
        clippingAncestorRight(field),
        blockingLeftEdge(
            band,
            room.neighbours.map((child) => child.getBoundingClientRect()),
        ),
    )

    return helperRowMaxWidth(fieldBox.left, fieldBox.width, limitRight)
}
