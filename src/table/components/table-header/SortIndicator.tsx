import clsx from 'clsx'
import style from '../StyledTable.module.scss'
import { DropUpIcon } from 'src/table/shared-components/DropUpIcon'
import { DropDownIcon } from 'src/table/shared-components/DropDownIcon'
import type { SortDirection, SortPreview } from 'src/table/helpers/sortPreview'

/**
 * The sort indicator slot of a sortable header (Figma "Header with sorting", the 20 × 28 `Sorting` frame).
 * It is decorative: `aria-sort` on the header cell carries the state.
 *
 * It holds two glyphs, and the stylesheet shows one of them (ASMA-8597, UX round 3, 2026-11-02):
 * - the **current** glyph, at rest, only while the column is sorted: its direction, in `gama-500`;
 * - the **preview** glyph, while the header is hovered or keyboard-focused (`:hover`, `:focus-visible`): what the
 *   header will look like right after a plain click, worked out by `getSortPreview` (which mirrors TanStack's
 *   `toggleSorting`, multi-sort included). A sorted column whose click sorts again shows that direction, still in
 *   `gama-500`. One whose click removes the sort, and an unsorted one, show the grey glyph pointing the way the
 *   first click sorts (`getFirstSortDir()`). With Shift held the click multi-sorts instead; the preview still shows
 *   the plain click (a known limitation).
 *
 * CSS cannot know the next direction, so it comes in as a prop and is written to the DOM: both glyphs are always
 * there and a data attribute says what each one is. The slot gets its 20px only while the column is sorted, hovered
 * or keyboard-focused (UX, ASMA-8597, comments 94750 and 94751), and collapses to nothing otherwise.
 */
export function SortIndicator({
    sorted,
    firstDirection,
    preview,
}: {
    sorted: false | SortDirection
    /** Where a first click sorts: `column.getFirstSortDir()`. */
    firstDirection: SortDirection
    /** What the header looks like after a plain click: `getSortPreview(...)`. */
    preview: SortPreview
}): JSX.Element {
    const current = sorted || firstDirection
    const previewIsPrimary = preview.primary
    const CurrentGlyph = current === 'asc' ? DropUpIcon : DropDownIcon
    const PreviewGlyph = preview.direction === 'asc' ? DropUpIcon : DropDownIcon

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
            data-preview-direction={preview.direction}
            data-preview-tone={previewIsPrimary ? 'primary' : 'neutral'}
        >
            <CurrentGlyph className={clsx(style['sort-glyph'], style['sort-glyph--current'])} focusable='false' height={28} width={28} />
            <PreviewGlyph className={clsx(style['sort-glyph'], style['sort-glyph--preview'])} focusable='false' height={28} width={28} />
        </span>
    )
}
