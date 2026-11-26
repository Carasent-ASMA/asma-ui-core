import { useLayoutEffect, useState } from 'react'
import { registerColumnReveal, type ColumnVirtualizer } from 'src/table/helpers/columnReveal'
import { FOCUSED_ROW_ATTRIBUTE, getParentTable, navigableRowOf } from 'src/table/helpers/tableControls'
import { syncBodyTabStops, syncHeaderTabStop } from 'src/table/helpers/tableTabStops'

/** The attributes that make or unmake a tab stop; the table's own writes are among them, and settle (idempotent). */
const WATCHED_ATTRIBUTES = ['tabindex', 'disabled', 'hidden', 'inert', 'data-header-hidden', FOCUSED_ROW_ATTRIBUTE]

/** Keeps the outermost table at its two tab stops, from one MutationObserver and the focus. */
const ownTabStops = (table: HTMLTableElement): (() => void) => {
    let bodyStop: HTMLTableRowElement | null = null
    const inHead = (node: Node): boolean => Boolean(table.tHead?.contains(node))

    const sync = (records?: MutationRecord[]): void => {
        // Its own React state moved the outermost table's focused row (`setFocusedRow`, a click): that row is the stop.
        const moved = records?.find(
            (record) =>
                record.attributeName === FOCUSED_ROW_ATTRIBUTE &&
                record.target instanceof HTMLTableRowElement &&
                record.target.hasAttribute(FOCUSED_ROW_ATTRIBUTE) &&
                record.target.closest('table') === table,
        )
        if (moved) bodyStop = moved.target as HTMLTableRowElement

        // A record on the table itself (a body or the header replaced) concerns both.
        const concerns = (part: (node: Node) => boolean): boolean =>
            !records || records.some((record) => record.target === table || part(record.target))

        if (concerns((node) => !inHead(node))) syncBodyTabStops(table, bodyStop)
        if (concerns(inHead)) syncHeaderTabStop(table)
    }

    // A body row or a control in it took the focus, the keys or the mouse, nested or not: that row is the body's stop.
    const followFocus = (event: FocusEvent): void => {
        const row = event.target instanceof Element ? navigableRowOf(event.target, table) : undefined
        if (!row || row === bodyStop) return
        bodyStop = row
        syncBodyTabStops(table, bodyStop)
    }

    sync()

    const observer = new MutationObserver(sync)
    observer.observe(table, { childList: true, subtree: true, attributes: true, attributeFilter: WATCHED_ATTRIBUTES })
    table.addEventListener('focusin', followFocus)

    return () => {
        observer.disconnect()
        table.removeEventListener('focusin', followFocus)
    }
}

/**
 * Keeps the table at two tab stops (ASMA-8875): the header row and the body's active row. Every other
 * control in the header and in the body rows' cells — built in or a consumer's — is `tabindex="-1"`, marked
 * `data-table-control`, and reached with the arrow keys (`tableKeyboard.ts`). One MutationObserver on the `<table>`
 * catches rows, cells and controls as they render (sorting, paging, column virtualisation, a consumer's own re-render).
 *
 * Only the outermost StyledTable does this. A StyledTable nested in a sub-row (`renderSubRows`) leaves it to the outermost
 * one, whose observer sees the nested table too: its rows join the outermost body's one tab stop, and its header has none.
 * A nested `TableRow` still renders its own `tabIndex`; the outermost table corrects it in the same task, before paint.
 *
 * Nesting is decided here, once, from the DOM (not React context: a table in a dialog opened from a cell is a React
 * descendant too, yet owns itself). Also registers the column virtualizer for the keys (`columnReveal.ts`).
 *
 * Returns the ref for the `<table>` — a callback ref, because the table element is replaced when the layout switches
 * between the sticky and the inline footer — and whether this table is the owner, which alone handles the keys.
 */
export const useTableTabStops = (
    columnVirtualizer: ColumnVirtualizer,
): [(table: HTMLTableElement | null) => void, boolean] => {
    const [table, setTable] = useState<HTMLTableElement | null>(null)
    // The element is in the DOM once it is in state, and its place there does not change without a remount.
    const isOwner = table !== null && !getParentTable(table)

    useLayoutEffect(() => {
        if (table) registerColumnReveal(table, columnVirtualizer)
    }, [table, columnVirtualizer])

    useLayoutEffect(() => (table && isOwner ? ownTabStops(table) : undefined), [table, isOwner])

    return [setTable, isOwner]
}
