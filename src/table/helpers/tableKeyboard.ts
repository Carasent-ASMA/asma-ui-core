import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { moveAcrossColumns } from './columnReveal'
import { isContextMenuKey, openRowActions } from './rowActionsMenu'
import { focusTableElement } from './scrollFocusIntoView'
import { getHeaderControls, getNavigableRows, getRowControls, isBehindOverlay, navigableRowOf } from './tableControls'
import { focusHeaderOrBefore, focusOutsideTable, getActiveBodyRow, getHeaderTabStop } from './tableTabStops'

/**
 * The table's key map (ASMA-8875, WAI-ARIA Grid): one rule for the whole table, Tab enters and leaves it, the arrow keys
 * move inside it. The outermost StyledTable handles every navigation key, for its header and for every row the keys move
 * through — its own rows and the rows of a table nested in a sub-row. `TableRow` keeps only Enter and Space on the row
 * itself: Enter opens that row (its own table's `onRowClick`), Space selects or expands it.
 *
 * The handler is React's `onKeyDown` on the `<table>`, not a native listener: React dispatches at its root, after a
 * native listener on the table would have run, so only a React handler here comes after the controls' own React handlers
 * and can trust `defaultPrevented` ("a control handled this key").
 *
 * Supersedes the header Tab walk of ASMA-8702 (contract entry N) and "row controls are browser tab stops" of ASMA-8087
 * (K-20, K-21). See `docs/a11y-keyboard-contract.md`, entry O.
 */

/** Inputs that leave the arrow keys alone; every other input type (text, number, date, radio, range…) uses them. */
const INPUTS_WITHOUT_ARROW_KEYS = new Set(['checkbox', 'button', 'submit', 'reset', 'image', 'file', 'color'])

/**
 * Controls that use the arrow keys, Home and End themselves, so the table leaves those keys to them. A popup trigger
 * counts while its popup is open (the ⋮ moves into its menu with ArrowDown). A disclosure (the expand chevron, with
 * `aria-expanded` and no popup) does not: the arrows still move on from it.
 */
const OWNS_ARROW_KEYS =
    'select, textarea, [role="combobox"], [role="slider"], [role="spinbutton"], [role="listbox"], [role="tablist"], [role="menu"], [role="grid"], [aria-haspopup]:not([aria-haspopup="false"])[aria-expanded="true"]'

const NAVIGATION_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'])

/**
 * A closed select-only combobox (a button with `role="combobox"`, StyledSelect's trigger, not a text field) opens with
 * Up/Down/Home/End and has no use for Left and Right: those still move along the row, or the arrows could not leave a
 * select in a cell.
 */
const isClosedSelectOnly = (owner: Element, target: HTMLElement): boolean =>
    owner === target && target.getAttribute('role') === 'combobox' && target.getAttribute('aria-expanded') !== 'true'

/** Whether the focused element uses this key itself (a text field, a select, an open menu button…). */
const ownsNavigationKey = (target: HTMLElement, container: HTMLElement, key: string): boolean => {
    if (target instanceof HTMLInputElement) return !INPUTS_WITHOUT_ARROW_KEYS.has(target.type)
    if (target.isContentEditable) return true

    const owner = target.closest(OWNS_ARROW_KEYS)

    if (!owner || !container.contains(owner)) return false
    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return true

    return !isClosedSelectOnly(owner, target)
}

const hasModifier = (event: ReactKeyboardEvent): boolean => event.altKey || event.ctrlKey || event.metaKey || event.shiftKey

/** Whether the table leaves this navigation key to the focused element. */
const leavesKeyToTarget = (event: ReactKeyboardEvent, target: HTMLElement, container: HTMLElement): boolean =>
    NAVIGATION_KEYS.has(event.key) && (hasModifier(event) || (target !== container && ownsNavigationKey(target, container, event.key)))

/** Up/Down/Home/End: the next, previous, first or last row the keys move through, from anywhere in the row. */
const moveToRow = (table: HTMLTableElement, row: HTMLTableRowElement, key: string): boolean => {
    const rows = getNavigableRows(table)
    const index = rows.indexOf(row)
    const destination = { ArrowDown: rows[index + 1], ArrowUp: rows[index - 1], Home: rows[0], End: rows.at(-1) }[
        key as 'ArrowDown' | 'ArrowUp' | 'Home' | 'End'
    ]

    // `-1`: a row of a StyledTable nested in a header cell, which the list (the bodies) does not hold.
    if (!destination || index === -1) return false
    focusTableElement(destination)

    return true
}

/**
 * Right from the row goes to its first control, then to the next (no wrap); Left goes back, and from the first control to
 * the row. Left on the row itself does nothing. The same for a body row and the header row. Columns not rendered yet are
 * revealed on the way (`columnReveal.ts`).
 */
const moveAlong = (row: HTMLTableRowElement, controlsOf: () => HTMLElement[], target: HTMLElement, direction: 1 | -1): boolean => {
    if (target === row ? direction < 0 : !controlsOf().includes(target)) return false

    void moveAcrossColumns(row, controlsOf, target, direction, () => {
        if (direction < 0) focusTableElement(row)
    })

    return true
}

/** The body's keys, on a row the keys move through or on a control in it. Returns whether the key was the table's. */
const runRowKey = (event: ReactKeyboardEvent, table: HTMLTableElement, row: HTMLTableRowElement, target: HTMLElement): boolean => {
    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowLeft':
            return moveAlong(row, () => getRowControls(row), target, event.key === 'ArrowRight' ? 1 : -1)
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Home':
        case 'End':
            return moveToRow(table, row, event.key)
        case 'Tab':
            return event.shiftKey ? focusHeaderOrBefore(table) : focusOutsideTable(table, 'next')
        default:
            return false
    }
}

/**
 * The header works like a row (AC 9): its row is its tab stop, Right and Left walk its controls as in a body row, Home and
 * End jump to the first and the last control. Up and Down do nothing: the header is not linked to the body. Tab goes to
 * the body's active row (with no rows, out of the table forwards), Shift+Tab out of the table backwards, from the row or
 * any control. Enter and Space stay with the control.
 */
const runHeaderKey = (event: ReactKeyboardEvent, table: HTMLTableElement, target: HTMLElement): boolean => {
    const headerRow = getHeaderTabStop(table)
    const controlsOf = (): HTMLElement[] => getHeaderControls(table)

    if (!headerRow || (target !== headerRow && !controlsOf().includes(target))) return false

    if (event.key === 'Tab') {
        const activeRow = event.shiftKey ? undefined : getActiveBodyRow(table)
        if (!activeRow) return focusOutsideTable(table, event.shiftKey ? 'prev' : 'next')
        focusTableElement(activeRow)

        return true
    }
    if (leavesKeyToTarget(event, target, headerRow)) return false

    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowLeft':
            return moveAlong(headerRow, controlsOf, target, event.key === 'ArrowRight' ? 1 : -1)
        case 'Home':
        case 'End':
            // From before the first column or after the last: in a wide table, columns not rendered yet count too.
            void moveAcrossColumns(headerRow, controlsOf, headerRow, event.key === 'Home' ? 1 : -1)
            return true
        default:
            return false
    }
}

/**
 * The outermost table's `onKeyDown` (a nested table has none, `useTableTabStops`). Keys a control handled already
 * (`defaultPrevented`), keys of a portalled menu (React bubbles them here, the DOM does not), keys of a dialog or popover
 * rendered inside a row or the header, and the arrow keys of a control that uses them are left alone.
 */
export const handleTableKeyDown = (event: ReactKeyboardEvent<HTMLTableElement>): void => {
    const table = event.currentTarget
    const { target } = event

    if (event.defaultPrevented || !(target instanceof HTMLElement) || !table.contains(target) || isBehindOverlay(target, table)) return

    if (target.closest('thead') === table.tHead) {
        if (runHeaderKey(event, table, target)) event.preventDefault()

        return
    }

    const row = navigableRowOf(target, table)
    if (!row) return

    if (isContextMenuKey(event)) {
        if (openRowActions(row)) event.preventDefault()

        return
    }
    if (leavesKeyToTarget(event, target, row)) return
    if (runRowKey(event, table, row, target)) event.preventDefault()
}
