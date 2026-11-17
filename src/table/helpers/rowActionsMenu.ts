import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { focusTableElement } from './scrollFocusIntoView'
import { isBehindOverlay, navigableRowOf, rowCandidates } from './tableControls'

/**
 * The context-menu key and Shift+F10 open the focused row's ⋮ menu (ASMA-8875), the convention of Windows and most data
 * grids. Two paths lead here, and either may come alone or both: the keydown (macOS, Linux), and the `contextmenu` event
 * a keyboard starts (Windows sends it on the Menu key's keyup and for Shift+F10, whatever the keydown did). The action is
 * idempotent, so a keydown and a `contextmenu` from one press open the menu once. A mouse right-click is never taken.
 */

/** Marks the row's ⋮ (`RowActionMenu`), so that the keys find it. */
export const ROW_ACTIONS_TRIGGER_ATTRIBUTE = 'data-row-actions-trigger'

/**
 * Whether a keyboard started this `contextmenu`: Chromium (125+) sends a `PointerEvent` with an empty `pointerType` for
 * it, a mouse sends `'mouse'` and a touch `'touch'`. A plain `MouseEvent` (older engines) is the keyboard's unless it
 * carries the right button.
 */
export const isKeyboardContextMenu = (event: MouseEvent): boolean =>
    typeof PointerEvent !== 'undefined' && event instanceof PointerEvent ? event.pointerType === '' : event.button !== 2

/** The context-menu key, or Shift+F10 with no other modifier. */
export const isContextMenuKey = (event: ReactKeyboardEvent): boolean =>
    event.key === 'ContextMenu' ||
    (event.key === 'F10' && event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey)

/**
 * Opens the row's ⋮ menu as Enter on the ⋮ would: the click carries no pointer press count (`detail` 0), so the menu
 * counts as opened by the keyboard and its first item takes the focus. An open menu is left as it is; an `aria-disabled`
 * ⋮ only takes the focus, so that its reason shows. `false` for a row without a ⋮: the key and the event are then left
 * alone, and the browser's own menu opens.
 */
export const openRowActions = (row: HTMLTableRowElement): boolean => {
    const trigger = rowCandidates(row).find((element) => element.hasAttribute(ROW_ACTIONS_TRIGGER_ATTRIBUTE))

    if (!trigger) return false
    if (trigger.getAttribute('aria-expanded') === 'true') return true

    focusTableElement(trigger)
    if (trigger.getAttribute('aria-disabled') !== 'true') trigger.click()

    return true
}

/**
 * The `contextmenu` event on the outermost table: one the keyboard started on a row or a control in it opens that row's
 * ⋮. A portalled ⋮ menu is not in the table's DOM; `RowActionMenu` keeps the keyboard's `contextmenu` in its own menu.
 */
export const handleTableContextMenu = (event: ReactMouseEvent<HTMLTableElement>): void => {
    const table = event.currentTarget
    const { target } = event

    if (event.defaultPrevented || !(target instanceof Element) || !table.contains(target) || isBehindOverlay(target, table)) return
    if (!isKeyboardContextMenu(event.nativeEvent)) return

    const row = navigableRowOf(target, table)
    if (row && openRowActions(row)) event.preventDefault()
}
