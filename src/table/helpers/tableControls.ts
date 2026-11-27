/**
 * What the table's keyboard model (ASMA-8875) works on: the controls in a row or the header, and the rows the keys move
 * through. A StyledTable nested in a sub-row (`renderSubRows`) is part of the outermost table here: its rows join the
 * outermost table's rows, in visual order, and the outermost table owns the keys and the tab stops.
 *
 * The key maps are in `tableKeyboard.ts`, the tab stops in `tableTabStops.ts`.
 */

/** Marks a control the table took out of the Tab sequence: it is still a control, reached with the arrow keys. */
export const TABLE_CONTROL_ATTRIBUTE = 'data-table-control'
/** `TableRow` renders it: the rows the keys stop on, a nested StyledTable's included. */
export const TABLE_ROW_ATTRIBUTE = 'data-table-row'
/** Marks the `<table>` of every StyledTable, so that a nested one finds the table it is nested in. */
export const STYLED_TABLE_ATTRIBUTE = 'data-styled-table'
/** `TableRow` renders it on the row its own table has as the focused row (React state), for the tab stop's fallback. */
export const FOCUSED_ROW_ATTRIBUTE = 'data-focused-row'

const STYLED_TABLE = `table[${STYLED_TABLE_ATTRIBUTE}]`

/** A dialog or popover. Rendered inside a row or the header (a native `<dialog>` is not portalled), it ends the table. */
const OVERLAY = 'dialog, [role="dialog"], [role="alertdialog"], [popover]'

const CONTROL_CANDIDATES =
    'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex], [contenteditable="true"]'

export const isMarked = (element: Element): boolean => element.hasAttribute(TABLE_CONTROL_ATTRIBUTE)

/** A tab stop of its own. Chrome reports -1 for a `contenteditable` root with no `tabindex`, which is still one. */
const isTabStop = (element: HTMLElement): boolean =>
    element.tabIndex >= 0 || (element.isContentEditable && !element.hasAttribute('tabindex'))

/**
 * Rendered and visible: `hidden`, `display: none`, `visibility: hidden` or an `inert` ancestor inside the table make it
 * unreachable. An `inert` or `hidden` around the whole table does not: it hides the table, not the control, and the tab
 * stops must already be in place when the table is shown. A collapsed accordion panel is `inert` and opens later, and the
 * table does not see that happen (`useTableTabStops`).
 */
const isShown = (element: HTMLElement): boolean =>
    !element.closest('[inert], [hidden]')?.closest(STYLED_TABLE) &&
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== 'hidden'

/**
 * Whether the keyboard can land on this element in the table now: a tab stop of its own, or one the table took over (the
 * marker), that is shown. A control someone made `tabIndex={-1}` without the marker (the locked select checkbox) is not
 * one.
 */
export const isTableControl = (element: HTMLElement): boolean => (isTabStop(element) || isMarked(element)) && isShown(element)

/** Writes a tab index only when it changes, so the MutationObserver that calls this settles. */
export const setTabIndex = (element: HTMLElement, tabIndex: 0 | -1): void => {
    if (element.getAttribute('tabindex') !== String(tabIndex)) element.setAttribute('tabindex', String(tabIndex))
}

/** Marks a tab stop as the table's control. Elements that are neither a stop nor marked are not controls: `false`. */
export const takeOver = (element: HTMLElement): boolean => {
    if (isMarked(element)) return true
    if (!isTabStop(element)) return false
    element.setAttribute(TABLE_CONTROL_ATTRIBUTE, '')

    return true
}

/**
 * Whether `node` is behind an overlay that sits inside `container` (a row, the header, a table). Such an overlay ends the
 * table: its contents are not the table's controls, its keys are not the table's, and a StyledTable in it owns itself. A
 * whole table inside a dialog is not behind one: that dialog is not inside it.
 */
export const isBehindOverlay = (node: Element, container: Element): boolean => {
    const overlay = node.closest(OVERLAY)

    return Boolean(overlay && container.contains(overlay))
}

/** The StyledTable this one is nested in (in a sub-row of it), if any; none when an overlay lies between them. */
export const getParentTable = (table: HTMLTableElement): HTMLTableElement | null => {
    const parent = table.parentElement?.closest<HTMLTableElement>(STYLED_TABLE)

    return parent && !isBehindOverlay(table, parent) ? parent : null
}

/** The outermost StyledTable around a node: the one that owns the keys and the tab stops. */
export const getOutermostTable = (node: Element | null | undefined): HTMLTableElement | null => {
    let table = node?.closest<HTMLTableElement>(STYLED_TABLE) ?? null

    for (let parent = table && getParentTable(table); parent; parent = getParentTable(parent)) table = parent

    return table
}

/** The candidates of one row's own cells, in DOM order (visual order): not those of a table nested in it. */
export const rowCandidates = (row: HTMLTableRowElement): HTMLElement[] => {
    const table = row.closest('table')

    return Array.from(row.querySelectorAll<HTMLElement>(CONTROL_CANDIDATES)).filter(
        (element) => element.closest('tr') === row && element.closest('table') === table && !isBehindOverlay(element, row),
    )
}

/** The candidates in a table's own header, not in a table nested in it, and not the header rows (the stop) themselves. */
export const headerCandidates = (table: HTMLTableElement): HTMLElement[] =>
    Array.from(table.tHead?.querySelectorAll<HTMLElement>(CONTROL_CANDIDATES) ?? []).filter(
        (element) =>
            !(element instanceof HTMLTableRowElement) && element.closest('table') === table && !isBehindOverlay(element, table),
    )

/** The controls of a row the arrow keys move through, in visual order. */
export const getRowControls = (row: HTMLTableRowElement): HTMLElement[] => rowCandidates(row).filter(isTableControl)

/** The header controls the arrow keys move through, in visual order. A hidden header (`hideHeader`) has none. */
export const getHeaderControls = (table: HTMLTableElement): HTMLElement[] =>
    table.tHead?.hasAttribute('data-header-hidden') ? [] : headerCandidates(table).filter(isTableControl)

/**
 * The row of the keys' list that an element is (or is in the own cells of), inside `table`: a `TableRow` of `table` or of
 * a StyledTable nested in it. `undefined` outside one.
 */
export const navigableRowOf = (element: Element, table: HTMLTableElement): HTMLTableRowElement | undefined => {
    const row = element.closest('tr')

    return row &&
        table.contains(row) &&
        row.parentElement?.tagName === 'TBODY' &&
        row.closest('table')?.hasAttribute(STYLED_TABLE_ATTRIBUTE) &&
        !isBehindOverlay(row, table) &&
        row.hasAttribute(TABLE_ROW_ATTRIBUTE)
        ? row
        : undefined
}

/**
 * The rows the keys move through, in visual (DOM) order: the table's own rows, and the rows of a StyledTable nested in a
 * sub-row, recursively. Called on the outermost table.
 */
export const getNavigableRows = (table: HTMLTableElement): HTMLTableRowElement[] =>
    Array.from(table.tBodies)
        .flatMap((body) => Array.from(body.querySelectorAll('tr')))
        .filter((row) => navigableRowOf(row, table))
