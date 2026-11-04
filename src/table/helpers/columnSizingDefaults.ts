import { INTERNAL_COLUMN_IDS } from 'src/table/types'
import { getLeafColumnInfos, type ColumnDefLike } from './columnIds'

/** TanStack's own default column width, used when neither the column nor the table's `defaultColumn` has a `size`. */
const TANSTACK_DEFAULT_SIZE = 150
/** UX round 4 (D16): the room a sortable column's triangle needs, in px. */
export const SORTABLE_EXTRA_WIDTH = 20
/** ui-core's own minimum width of a resizable column. It does not grow with D16. */
export const RESIZABLE_MIN_SIZE = 100

/** The parts of a column definition that decide its default width. */
export interface SizableColumnDef extends ColumnDefLike {
    size?: number
    minSize?: number
    maxSize?: number
}

interface ColumnSizingDefaultsOptions {
    /** The table's own `defaultColumn`, which each column definition is merged over. */
    defaultColumn?: SizableColumnDef
    /** The table's `enableSorting`. */
    enableSorting?: boolean
    /** Whether the table can resize its columns (D15): only then does a column get ui-core's minimum width. */
    canResize: boolean
}

/**
 * Resolves the default `size`, `minSize` and `maxSize` of every leaf column before TanStack sees the definitions
 * (ASMA-8597, UX round 4, P2e). It changes defaults only: a width the user saved, an app's `initialState.columnSizing`
 * and a controlled `state.columnSizing` are applied on top by TanStack as given (DEC-D16).
 *
 * - **D16, +20 px for a sortable column.** A data column that can sort (the rule `getLeafColumnInfos` already uses, which is
 *   TanStack's `getCanSort()` for a leaf) gets `size` + 20, where `size` is its own, else the table's `defaultColumn.size`,
 *   else TanStack's 150. Its `minSize` and `maxSize` grow by 20 when the column or `defaultColumn` sets them. A sortable
 *   column that opts out of resizing grows too (DEC-D16-OPTOUTS): it keeps no handle, and a `minSize === maxSize` column
 *   stays fixed, at the new width. Columns that cannot sort, group headers and ui-core's own columns are left as they are.
 * - **DEC-NARROW, the minimum of a resizable column.** A column that sets no `minSize` gets the smaller of 100 px and its
 *   default width (its `size` after D16) as its minimum, so turning resizing on never widens a column past its default
 *   width. A column with no `size` at all keeps the 100 px minimum. A column that sets its own `minSize` keeps it.
 *   ui-core's own columns keep the 100 px minimum they have always had.
 */
export const resolveColumnSizingDefaults = <TDef extends SizableColumnDef>(
    columns: readonly TDef[],
    options: ColumnSizingDefaultsOptions,
): TDef[] => {
    const { defaultColumn, canResize } = options

    const resolve = (def: TDef): TDef => {
        if (def.columns?.length) {
            return { ...def, columns: def.columns.map((child) => resolve(child as TDef)) }
        }

        const leaf = getLeafColumnInfos([def], { defaultColumn, enableSorting: options.enableSorting })[0]

        // No id, no column (TanStack refuses it): not ours to size.
        if (!leaf) return def

        const merged = { ...defaultColumn, ...def }
        const isInternal = INTERNAL_COLUMN_IDS.includes(leaf.id)
        const grows = leaf.canSort && !isInternal
        const size = grows ? (merged.size ?? TANSTACK_DEFAULT_SIZE) + SORTABLE_EXTRA_WIDTH : merged.size

        let minSize = merged.minSize

        if (minSize !== undefined) {
            if (grows) minSize += SORTABLE_EXTRA_WIDTH
        } else if (canResize) {
            // ui-core's own minimum. A column that is narrower than that keeps its declared width as its minimum, unless
            // it is one of ui-core's own columns, which have always had the full 100 px.
            minSize = isInternal || size === undefined ? RESIZABLE_MIN_SIZE : Math.min(RESIZABLE_MIN_SIZE, size)
        }

        const maxSize = grows && merged.maxSize !== undefined ? merged.maxSize + SORTABLE_EXTRA_WIDTH : merged.maxSize

        const resolved = { ...def }

        // Only set what changes, so a definition keeps inheriting what it did not set from `defaultColumn`.
        if (size !== merged.size) resolved.size = size
        if (minSize !== merged.minSize) resolved.minSize = minSize
        if (maxSize !== merged.maxSize) resolved.maxSize = maxSize

        return resolved
    }

    return columns.map(resolve)
}

/**
 * Whether a column has a fixed width: it sets `maxSize` equal to `minSize`. Such a column has no resize handle (OQ-15,
 * the apps' own decision), however resizing came to be on. Reads the resolved definition (`column.columnDef`).
 */
export const hasFixedWidth = (columnDef: Pick<SizableColumnDef, 'minSize' | 'maxSize'>): boolean =>
    columnDef.maxSize !== undefined && columnDef.minSize === columnDef.maxSize
