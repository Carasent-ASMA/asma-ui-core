import { type Table } from '@tanstack/react-table'
import paginationStyle from './TablePagination.module.scss'
import { TablePagination } from './TablePagination'
import { TableRowCountSelect } from './TableRowCountSelect'
import type { StyledTableProps } from '../../types'
import style from '../StyledTable.module.scss'

const MIN_ROWS_FOR_FOOTER = 5

export function TableFooter<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    table,
    styledTableProps,
    canShowStickyFooter,
}: {
    table: Table<TData>
    styledTableProps: StyledTableProps<TData, TCustomData>
    canShowStickyFooter: boolean
}): JSX.Element | null {
    const totalRowCount = table.getRowCount()
    const pageCount = table.getPageCount() ?? 1
    const footerNode = styledTableProps.footer?.(table)
    const hasFooterNode = footerNode !== null && footerNode !== undefined && footerNode !== false
    const locale = styledTableProps.locale ?? 'en'
    const hasEnoughRowsForFooter = totalRowCount >= MIN_ROWS_FOR_FOOTER

    if (styledTableProps.hideFooter) return null

    const paginationAlignLeft = styledTableProps.paginationAlignLeft
    const shouldShowRowCountSelect = !styledTableProps.hideRowCountSelect
    const shouldShowPagination = pageCount > 1
    // The row-count threshold only hides the pagination controls; a custom footer node must always render.
    const shouldShowControls = hasEnoughRowsForFooter && (shouldShowRowCountSelect || shouldShowPagination)
    const hasAnythingToRender = hasFooterNode || shouldShowControls

    if (!hasAnythingToRender) return null

    return (
        <div
            className={canShowStickyFooter ? style['table-footer--sticky'] : style['table-footer--inline']}
            style={paginationAlignLeft ? { justifyContent: 'flex-start' } : undefined}
        >
            {!paginationAlignLeft && footerNode}
            {shouldShowControls && (
                <div className={paginationStyle['table-pagination']}>
                    {shouldShowRowCountSelect && <TableRowCountSelect table={table} locale={locale} />}
                    {shouldShowPagination && <TablePagination table={table} locale={locale} />}
                </div>
            )}
            {paginationAlignLeft && footerNode}
        </div>
    )
}
