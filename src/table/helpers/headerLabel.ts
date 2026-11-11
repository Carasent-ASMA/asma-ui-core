import type { ColumnDef, RowData } from '@tanstack/react-table'

/**
 * The text a column is called by: `pinnedHeaderText` when the column sets it (a function header cannot say its own text),
 * else a string header, else `undefined`. The column settings list a column by this text (falling back to the column id),
 * and a truncated header shows it in a tooltip, so the two always read alike.
 */
export const headerLabelText = <TData extends RowData, TValue>(columnDef: ColumnDef<TData, TValue>): string | undefined =>
    columnDef.pinnedHeaderText ?? (typeof columnDef.header === 'string' ? columnDef.header : undefined)
