import type { KeyboardEvent } from 'react'

/** The two stops of a column in the column settings menu: its row (the checkbox) and its drag handle. */
export type ColumnItemPart = 'row' | 'handle'

/** Marks a column's `<li>` with its column id. */
export const COLUMN_ITEM_ATTRIBUTE = 'data-column-id'
/** Marks a column's two stops with their part. */
export const COLUMN_PART_ATTRIBUTE = 'data-column-part'

const partOf = (item: Element | undefined, part: ColumnItemPart): HTMLElement | null =>
    item?.querySelector<HTMLElement>(`[${COLUMN_PART_ATTRIBUTE}="${part}"]`) ?? null

/** The stop of one column, found by its id in the given list. */
export const columnStop = (list: Element | null, id: string, part: ColumnItemPart): HTMLElement | null =>
    partOf(
        [...(list?.querySelectorAll(`[${COLUMN_ITEM_ATTRIBUTE}]`) ?? [])].find(
            (item) => item.getAttribute(COLUMN_ITEM_ATTRIBUTE) === id,
        ),
        part,
    )

/**
 * The column settings menu's arrow keys (ASMA-8875, UX comment 95823), the table's rule: arrows move inside, Tab enters
 * and leaves. Up and Down go row to row (wrapping, as `StyledMenuList`), and Home and End to the first and last row,
 * always to the row, from the row or its handle. Right goes from a row to its handle, Left from a handle back to its row.
 * Space and Enter belong to the stop itself (the row toggles, the handle lifts), so they are left alone here.
 *
 * Not called while a column is lifted: dnd-kit's `KeyboardSensor` owns the keys then.
 */
export function moveFocusInColumnMenu(event: KeyboardEvent<HTMLUListElement>): void {
    const from = event.target instanceof Element ? event.target.closest<HTMLElement>(`[${COLUMN_PART_ATTRIBUTE}]`) : null
    const item = from?.closest(`[${COLUMN_ITEM_ATTRIBUTE}]`)
    if (!from || !item || !event.currentTarget.contains(item)) return

    const items = [...event.currentTarget.querySelectorAll(`[${COLUMN_ITEM_ATTRIBUTE}]`)]
    const index = items.indexOf(item)
    const part = from.getAttribute(COLUMN_PART_ATTRIBUTE) as ColumnItemPart
    let next: HTMLElement | null = null

    switch (event.key) {
        case 'ArrowDown':
            next = partOf(items[(index + 1) % items.length], 'row')
            break
        case 'ArrowUp':
            next = partOf(items[(index - 1 + items.length) % items.length], 'row')
            break
        case 'Home':
            next = partOf(items[0], 'row')
            break
        case 'End':
            next = partOf(items.at(-1), 'row')
            break
        case 'ArrowRight':
            next = part === 'row' ? partOf(item, 'handle') : null
            break
        case 'ArrowLeft':
            next = part === 'handle' ? partOf(item, 'row') : null
            break
        default:
            return
    }

    // The arrows never scroll the list or the page, even with nowhere to go (Right on a handle, Left on a row).
    event.preventDefault()
    next?.focus()
}
