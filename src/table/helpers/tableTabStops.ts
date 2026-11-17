import { tabbableWithin } from 'src/helpers/focusable'
import { focusTableElement } from './scrollFocusIntoView'
import {
    FOCUSED_ROW_ATTRIBUTE,
    getHeaderControls,
    getNavigableRows,
    getOutermostTable,
    headerCandidates,
    rowCandidates,
    setTabIndex,
    takeOver,
} from './tableControls'

/**
 * The table's two tab stops (ASMA-8875): the header row and the body's active row. The outermost StyledTable
 * owns both; a StyledTable nested in a sub-row gives up its own (its rows; its header row has none, it is not the owner, and
 * its built-in header controls render `tabIndex={-1}`). `useTableTabStops` calls these from one
 * MutationObserver; every write is idempotent, so a nested `TableRow` that re-renders its own `tabIndex` is corrected in
 * the same task, before paint, and the observer settles.
 */

/**
 * The body is one tab stop across the outermost table's own rows and the rows of the tables nested in its sub-rows: the
 * row the user last worked with (`remembered`), else the row the outermost table has as focused (its React state), else
 * the first. Every control in those rows leaves the Tab sequence.
 */
export const syncBodyTabStops = (table: HTMLTableElement, remembered: HTMLTableRowElement | null): void => {
    const rows = getNavigableRows(table)

    for (const row of rows) {
        for (const element of rowCandidates(row)) {
            if (takeOver(element)) setTabIndex(element, -1)
        }
    }

    const stop =
        (remembered && rows.includes(remembered) ? remembered : undefined) ??
        rows.find((row) => row.hasAttribute(FOCUSED_ROW_ATTRIBUTE) && row.closest('table') === table) ??
        rows[0]

    for (const row of rows) setTabIndex(row, row === stop ? 0 : -1)
}

/**
 * The header row: the header's one tab stop, like a body row, where Shift+Tab from the body goes. A hidden header, or one
 * with no control, has none.
 */
export const getHeaderTabStop = (table: HTMLTableElement): HTMLTableRowElement | undefined =>
    getHeaderControls(table).length ? Array.from(table.tHead?.rows ?? []).at(-1) : undefined

/**
 * The header works like a row: its row is the one tab stop, and every control in it, a consumer's included, is
 * `tabindex="-1"`, reached with the arrow keys.
 */
export const syncHeaderTabStop = (table: HTMLTableElement): void => {
    for (const element of headerCandidates(table)) {
        if (takeOver(element)) setTabIndex(element, -1)
    }

    const stop = getHeaderTabStop(table)

    for (const row of Array.from(table.tHead?.rows ?? [])) {
        if (row === stop) setTabIndex(row, 0)
        else row.removeAttribute('tabindex')
    }
}

/**
 * The body row that holds the tab stop: the row the user last worked with, which may be in a nested table. Asked of any
 * StyledTable, it answers for the outermost one around it.
 */
export const getActiveBodyRow = (table: HTMLTableElement | null | undefined): HTMLTableRowElement | undefined => {
    const owner = getOutermostTable(table)

    return owner ? getNavigableRows(owner).find((row) => row.tabIndex === 0) : undefined
}

/**
 * Focus the first tab stop after the outermost table (`'next'`) or the last one before it (`'prev'`). `false` when there
 * is none, or it would not take the focus: the caller then leaves the key to the browser.
 */
export const focusOutsideTable = (from: HTMLElement, direction: 'next' | 'prev'): boolean => {
    const table = getOutermostTable(from)
    if (!table) return false

    const position = direction === 'next' ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING
    const candidates = tabbableWithin(document).filter(
        (element) => !table.contains(element) && Boolean(table.compareDocumentPosition(element) & position),
    )
    const target = direction === 'next' ? candidates[0] : candidates.at(-1)

    if (!target) return false
    target.focus()

    return document.activeElement === target
}

/** Shift+Tab from the body: the header row, or out of the table backwards when the header has no stop. */
export const focusHeaderOrBefore = (table: HTMLTableElement): boolean => {
    const stop = getHeaderTabStop(table)
    if (!stop) return focusOutsideTable(table, 'prev')
    focusTableElement(stop)

    return true
}
