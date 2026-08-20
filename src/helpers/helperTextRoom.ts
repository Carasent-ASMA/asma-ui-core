
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

export function measureHelperRowMaxWidth(field: HTMLElement, helperRow: HTMLElement): number | undefined {
    const parent = field.parentElement
    if (!parent) return undefined

    const fieldBox = field.getBoundingClientRect()
    const helperTop = helperRow.getBoundingClientRect().top
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
