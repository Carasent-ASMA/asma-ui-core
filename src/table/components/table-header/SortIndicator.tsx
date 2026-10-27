import clsx from 'clsx'
import style from '../StyledTable.module.scss'
import { DropUpIcon } from 'src/table/shared-components/DropUpIcon'
import { DropDownIcon } from 'src/table/shared-components/DropDownIcon'

/**
 * The sort indicator slot of a sortable header (Figma "Header with sorting", the 20 × 28 `Sorting` frame).
 * It is decorative: `aria-sort` on the header cell carries the state. A sorted column always shows the
 * glyph in the primary colour; an unsorted one shows it, grey and pointing the way the next click will
 * sort, only while the header is hovered or keyboard-focused. The glyph is in the DOM either way, so the
 * slot never changes the layout.
 */
export function SortIndicator({
    sorted,
    nextDirection,
}: {
    sorted: false | 'asc' | 'desc'
    /** Where a click sorts next: `column.getFirstSortDir()` for an unsorted column. */
    nextDirection: 'asc' | 'desc'
}): JSX.Element {
    const direction = sorted || nextDirection
    const Glyph = direction === 'asc' ? DropUpIcon : DropDownIcon

    return (
        <span
            aria-hidden='true'
            className={clsx(style['sort-indicator'], sorted && style['sort-indicator--sorted'])}
            data-sort-direction={direction}
            data-sort-state={sorted || 'none'}
        >
            <Glyph className={style['sort-glyph']} focusable='false' height={28} width={28} />
        </span>
    )
}
