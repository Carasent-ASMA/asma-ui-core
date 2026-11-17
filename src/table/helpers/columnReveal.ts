import type { Virtualizer } from '@tanstack/react-virtual'
import { focusTableElement } from './scrollFocusIntoView'

/**
 * Left/Right in a row or the header of a wide table (ASMA-8875): the centre columns are virtualised (above 20 of them,
 * `useColumnVirtualizer`), so the next control in visual order may sit in a column that is not rendered yet. Visual order
 * is the fixed-left columns, centre 0…N-1, then the fixed-right ones and the actions column. When the next rendered control
 * lies beyond unrendered centre columns, the table first scrolls the nearest of them in, waits for it to render, and looks
 * again, until it finds a control or none is left in that direction.
 */

/** A centre cell's index among the centre columns (`td`/`th`), the one the virtualizer counts. */
export const COLUMN_INDEX_ATTRIBUTE = 'data-column-index'
/** A cell after the centre: `right` (fixed-right, and the actions column). */
export const COLUMN_SIDE_ATTRIBUTE = 'data-column-side'

/** What the keys use of the table's column virtualizer: how many centre columns there are, and the scroll to one. */
export type ColumnVirtualizer = Pick<Virtualizer<HTMLDivElement, HTMLTableCellElement>, 'options' | 'scrollToIndex'>

const virtualizers = new WeakMap<HTMLTableElement, ColumnVirtualizer>()
/** One move at a time per table: a newer key press makes an older, still revealing one stop. */
const moves = new WeakMap<HTMLTableElement, number>()

/** Registers the table's column virtualizer for the keys. The entry goes with the `<table>` (a WeakMap). */
export const registerColumnReveal = (table: HTMLTableElement, virtualizer: ColumnVirtualizer): void => {
    virtualizers.set(table, virtualizer)
}

/** Where an element sits in visual order: a centre index, -1 before the centre, `count` after it. */
const positionOf = (element: HTMLElement, count: number): number => {
    const cell = element.closest('td, th')
    if (!cell) return Number.NEGATIVE_INFINITY

    const index = cell.getAttribute(COLUMN_INDEX_ATTRIBUTE)
    if (index !== null) return Number(index)

    return cell.getAttribute(COLUMN_SIDE_ATTRIBUTE) === 'right' ? count : -1
}

/** The centre columns rendered in this row now: first and last index, or `undefined` when none is. */
const renderedRange = (row: HTMLTableRowElement): { first: number; last: number } | undefined => {
    const indexes = Array.from(row.cells)
        .map((cell) => cell.getAttribute(COLUMN_INDEX_ATTRIBUTE))
        .filter((index): index is string => index !== null)
        .map(Number)

    return indexes.length ? { first: Math.min(...indexes), last: Math.max(...indexes) } : undefined
}

/**
 * The nearest unrendered centre column strictly between `from` and `to`, in the direction of travel: the next column
 * itself when the rendered window starts beyond it, else the first one past the window. If the nearer one is not between,
 * the farther one is not either.
 */
const unrenderedBetween = (row: HTMLTableRowElement, count: number, from: number, to: number, direction: 1 | -1): number | undefined => {
    const range = renderedRange(row)
    if (!range) return undefined

    const near = direction > 0 ? Math.max(from + 1, 0) : Math.min(from - 1, count - 1)
    const column = direction > 0 ? (near < range.first ? near : range.last + 1) : near > range.last ? near : range.first - 1

    return column >= 0 && column < count && column > Math.min(from, to) && column < Math.max(from, to) ? column : undefined
}

type Step = { control: HTMLElement } | { reveal: number } | 'none'

/** The next step from a position: a control to focus, a column to reveal first, or nothing in that direction. */
const nextStep = (row: HTMLTableRowElement, controls: HTMLElement[], from: number, direction: 1 | -1, adjacent?: HTMLElement): Step => {
    const count = virtualizers.get(row.closest('table')!)?.options.count ?? 0
    const next =
        adjacent ??
        (direction > 0
            ? controls.find((control) => positionOf(control, count) > from)
            : controls.findLast((control) => positionOf(control, count) < from))
    const end = next ? positionOf(next, count) : direction > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    const reveal = unrenderedBetween(row, count, from, end, direction)

    if (reveal !== undefined) return { reveal }

    return next ? { control: next } : 'none'
}

const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()))

const isRendered = (row: HTMLTableRowElement, column: number): boolean =>
    Array.from(row.cells).some((cell) => cell.getAttribute(COLUMN_INDEX_ATTRIBUTE) === String(column))

/** At most this many frames for a revealed column to render before the move gives up. */
const RENDER_WAIT_FRAMES = 30

/**
 * Scrolls a column in and waits for it to render; `false` when it does not, or the move is no longer current. Coming in
 * from the right it ends at the window's edge, from the left it starts there; either way it renders, and the focus then
 * scrolls it clear of the fixed columns.
 */
const revealColumn = async (
    row: HTMLTableRowElement,
    virtualizer: ColumnVirtualizer,
    column: number,
    direction: 1 | -1,
    isCurrent: () => boolean,
): Promise<boolean> => {
    virtualizer.scrollToIndex(column, { align: direction > 0 ? 'end' : 'start' })
    for (let frame = 0; frame < RENDER_WAIT_FRAMES && !isRendered(row, column); frame += 1) await nextFrame()

    return isCurrent() && isRendered(row, column)
}

/**
 * Moves the focus to the next control in visual order (Right: `1`, Left: `-1`) from `origin`, revealing unrendered centre
 * columns on the way. `origin` is a control, or the row itself: then the move starts before the first column (Right, Home)
 * or after the last one (Left, End). `onNone` runs when there is nothing in that direction.
 *
 * Up to its first `await` this runs synchronously, so a control already rendered takes the focus at once; a reveal finishes
 * later. The search goes one way only — every column passed had no control — and stops for a newer move or a focus
 * elsewhere. If nothing was found and the origin unmounted while the window scrolled, the focus goes back to the origin's
 * column, onto the control in it.
 */
export const moveAcrossColumns = async (
    row: HTMLTableRowElement,
    controlsOf: () => HTMLElement[],
    origin: HTMLElement,
    direction: 1 | -1,
    onNone?: () => void,
): Promise<void> => {
    const table = row.closest('table')!
    const virtualizer = virtualizers.get(table)
    const count = virtualizer?.options.count ?? 0
    const controls = controlsOf()
    const fromRow = origin === row
    const index = fromRow ? (direction > 0 ? -1 : controls.length) : controls.indexOf(origin)
    const from = fromRow ? direction * Number.NEGATIVE_INFINITY : positionOf(origin, count)
    const move = (moves.get(table) ?? 0) + 1
    // The origin may unmount while the window scrolls; the focus then falls to the page, which is not "moved elsewhere".
    const isCurrent = (): boolean =>
        moves.get(table) === move && [origin, document.body, null].includes(document.activeElement as HTMLElement | null)

    moves.set(table, move)
    let step = nextStep(row, controls, from, direction, controls[index + direction])

    for (let attempt = 0; virtualizer && step !== 'none' && 'reveal' in step && attempt <= count; attempt += 1) {
        const column: number = step.reveal
        if (!(await revealColumn(row, virtualizer, column, direction, isCurrent))) break
        step = nextStep(row, controlsOf(), column - direction, direction)
    }

    if (step !== 'none' && 'control' in step) return focusTableElement(step.control)
    if (step === 'none') onNone?.()
    if (!isCurrent() || origin.isConnected || !virtualizer || from < 0 || from >= count) return
    if (!(await revealColumn(row, virtualizer, from, (-direction) as 1 | -1, isCurrent))) return

    const control = controlsOf().find((candidate) => positionOf(candidate, count) === from)
    if (control) focusTableElement(control)
}
