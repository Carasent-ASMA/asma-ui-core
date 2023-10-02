import type { CellContext, ColumnMeta, HeaderContext, Row } from '@tanstack/react-table'
import type { AccessorFn, ColumnDefTemplate } from '@tanstack/react-table'
import type {
    ColumnPinningColumnDef,
    ColumnSizingColumnDef,
    FiltersColumnDef,
    GroupingColumnDef,
    RowData,
    SortingColumnDef,
    VisibilityColumnDef,
} from '@tanstack/react-table'
import type { MouseEvent } from 'react'

declare module '@tanstack/react-table' {
    interface ColumnDefExtensions<TData extends RowData, TValue = unknown>
        extends VisibilityColumnDef,
            ColumnPinningColumnDef,
            FiltersColumnDef<TData>,
            SortingColumnDef<TData>,
            GroupingColumnDef<TData, TValue>,
            ColumnSizingColumnDef {
        className?: string
        cellAlign?: 'left' | 'center' | 'right'
        headerAlign?: 'left' | 'center' | 'right'
    }

    interface ColumnDefBase<TData extends RowData, TValue = unknown> extends ColumnDefExtensions<TData, TValue> {
        getUniqueValues?: AccessorFn<TData, unknown[]>
        footer?: ColumnDefTemplate<HeaderContext<TData, TValue>>
        cell?: ColumnDefTemplate<CellContext<TData, TValue>>
        meta?: ColumnMeta<TData, TValue>
    }
}

export type TableRowClickHandler<TData extends RowData> = (
    e: MouseEvent<HTMLTableRowElement, globalThis.MouseEvent>,
    row: Row<TData>,
) => void
