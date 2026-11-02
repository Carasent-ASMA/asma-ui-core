import clsx from 'clsx'
import style from '../StyledTable.module.scss'
import { DropUpIcon } from 'src/table/shared-components/DropUpIcon'
import { DropDownIcon } from 'src/table/shared-components/DropDownIcon'

type Direction = 'asc' | 'desc'

/**
 * The sort indicator slot of a sortable header (Figma "Header with sorting", the 20 × 28 `Sorting` frame).
 * It is decorative: `aria-sort` on the header cell carries the state.
 *
 * It holds two glyphs, and the stylesheet shows one of them (ASMA-8597, UX round 3, 2026-11-02):
 * - the **current** glyph, at rest, only while the column is sorted: its direction, in `gama-500`;
 * - the **preview** glyph, while the header is hovered or keyboard-focused (`:hover`, `:focus-visible`): what the
 *   header will look like right after a click. A sorted column whose next click sorts the other way shows that
 *   direction, still in `gama-500`. One whose next click removes the sort (`getNextSortingOrder()` is `false`), and
 *   an unsorted one, show the grey glyph pointing the way the first click sorts (`getFirstSortDir()`).
 *
 * CSS cannot know the next direction, so it comes in as props and is written to the DOM: both glyphs are always
 * there and a data attribute says what each one is. The slot gets its 20px only while the column is sorted, hovered
 * or keyboard-focused (UX, ASMA-8597, comments 94750 and 94751), and collapses to nothing otherwise.
 */
export function SortIndicator({
    sorted,
    firstDirection,
    nextOrder,
}: {
    sorted: false | Direction
    /** Where a first click sorts: `column.getFirstSortDir()`. */
    firstDirection: Direction
    /** What a plain click does next: `column.getNextSortingOrder()`; `false` removes the sort. */
    nextOrder: false | Direction
}): JSX.Element {
    const current = sorted || firstDirection
    // Only a sorted column whose click sorts again previews a primary glyph; an unsorted one is unchanged (grey).
    const previewIsPrimary = Boolean(sorted && nextOrder)
    const preview = sorted && nextOrder ? nextOrder : firstDirection
    const CurrentGlyph = current === 'asc' ? DropUpIcon : DropDownIcon
    const PreviewGlyph = preview === 'asc' ? DropUpIcon : DropDownIcon

    return (
        <span
            aria-hidden='true'
            className={clsx(
                style['sort-indicator'],
                sorted && style['sort-indicator--sorted'],
                previewIsPrimary && style['sort-indicator--preview-primary'],
            )}
            data-sort-direction={current}
            data-sort-state={sorted || 'none'}
            data-preview-direction={preview}
            data-preview-tone={previewIsPrimary ? 'primary' : 'neutral'}
        >
            <CurrentGlyph className={clsx(style['sort-glyph'], style['sort-glyph--current'])} focusable='false' height={28} width={28} />
            <PreviewGlyph className={clsx(style['sort-glyph'], style['sort-glyph--preview'])} focusable='false' height={28} width={28} />
        </span>
    )
}
