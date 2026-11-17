const isSticky = (element: Element): boolean => getComputedStyle(element).position === 'sticky'

const isScrollContainer = (element: Element): boolean => {
    const { overflowX, overflowY } = getComputedStyle(element)

    return [overflowX, overflowY].some((overflow) => overflow === 'auto' || overflow === 'scroll')
}

/**
 * The height of what sticks to the bottom of the table's scroll box and would cover a focused element there: the
 * horizontal scrollbar and the short-table footer. They are siblings of the table's wrappers, so each wrapper up to the
 * scroll box is looked at.
 */
const stickyBottomHeight = (table: HTMLTableElement): number => {
    let height = 0

    for (let wrapper: Element | null = table; wrapper && wrapper !== document.body; wrapper = wrapper.parentElement) {
        for (let sibling = wrapper.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
            if (isSticky(sibling)) height += sibling.getBoundingClientRect().height
        }
        if (wrapper.parentElement && isScrollContainer(wrapper.parentElement)) break
    }

    return height
}

/** A fixed-left or fixed-right cell: it sticks to a side of the scroll box, so a horizontal scroll leaves it on top. */
const isFixedCell = (cell: Element): boolean => {
    const style = getComputedStyle(cell)

    return style.position === 'sticky' && (style.left !== 'auto' || style.right !== 'auto')
}

/** The widths of the fixed cells on each side of the element's own cell, which would cover it after a horizontal scroll. */
const fixedCellWidths = (element: HTMLElement): { left: number; right: number } => {
    const cell = element.closest('td, th')
    const widths = { left: 0, right: 0 }

    if (!(cell instanceof HTMLTableCellElement) || !(cell.parentElement instanceof HTMLTableRowElement)) return widths
    if (isFixedCell(cell)) return widths

    let side: 'left' | 'right' = 'left'

    for (const other of Array.from(cell.parentElement.cells)) {
        if (other === cell) side = 'right'
        else if (isFixedCell(other)) widths[side] += other.getBoundingClientRect().width
    }

    return widths
}

/**
 * Scroll a focused row or control just far enough to be fully visible (WCAG 2.4.11 Focus Not Obscured, ASMA-8875 AC 11):
 * clear of the sticky header above it, of the sticky horizontal scrollbar and footer below it, and of the fixed columns
 * beside it. `scroll-margin` is how `scrollIntoView` keeps clear of them; `nearest` scrolls only when the element is not
 * already in view. A header control needs no vertical margin: it is in the header.
 */
export const scrollFocusIntoView = (element: HTMLElement): void => {
    // A control scrolls its cell, not itself: a cell clips what overflows it, and scrolling the control would scroll the
    // cell's own content sideways and leave it there (the select checkbox moved 4px). The cell also holds the focus frame.
    // A fixed (sticky) cell is always in view sideways, so it scrolls its row: as wide as the table, a row never scrolls
    // sideways under `nearest`, and the table does not shift a few pixels for the ⋮ (ASMA-8875).
    const cell = element.closest<HTMLElement>('td, th')
    const target = cell && !isFixedCell(cell) ? cell : (element.closest('tr') ?? element)
    const table = target.closest('table')
    const head = table?.tHead
    const inHead = Boolean(head?.contains(target))
    const { left, right } = fixedCellWidths(target)

    target.style.scrollMarginTop = `${!inHead && head && isSticky(head) ? head.getBoundingClientRect().height : 0}px`
    target.style.scrollMarginBottom = `${!inHead && table ? stickyBottomHeight(table) : 0}px`
    target.style.scrollMarginLeft = `${left}px`
    target.style.scrollMarginRight = `${right}px`
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

/** Focus an element of the table without the browser's own scroll, which ignores the sticky parts, then scroll it clear. */
export const focusTableElement = (element: HTMLElement): void => {
    element.focus({ preventScroll: true })
    scrollFocusIntoView(element)
}
