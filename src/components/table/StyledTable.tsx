import { type StyledTableProps, type TableState } from './types'
import { TableHeader } from './components/TableHeader'
import { TableBody } from './components/TableBody'
import { TableFooter } from './components/TableFooter'
import { useStyledTable } from './hooks/useStyledTable'
import { injectColumns } from './helpers/injectColumns'

import style from './StyledTable.module.scss'
import clsx from 'clsx'
import { memo, useMemo } from 'react'
import type { ColumnSizingState } from './types'

/**
 *
 * Custom props:
 * @param size: Column sizing. use NaN (width 100%) -  only one time for the main column. It will make the column very responsive.. Example is in Storybook.
 *
 *  @param focusable: Used for controlling the focus of rows. If set to true, the tabIndex={0} attribute will be added to each table row. Used, for example, when adding a new item to scroll to it and focus it
 *
 */
export const StyledTable = <
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>(
    props: StyledTableProps<TData, TCustomData> & {
        getColumnSizing?: (column_sizing: ColumnSizingState) => void
        getTableState?: (tableState: TableState) => void
    },
) => {
    const { className, height } = props

    injectColumns(props)
    const { table } = useStyledTable(props)

    const columnSizeVars = useMemo(() => {
        if (!props.enableColumnResizing) return

        const headers = table.getFlatHeaders()
        const colSizes: { [key: string]: number } = {}
        for (let i = 0; i < headers.length; i++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const header = headers[i]!
            colSizes[`--header-${header.id}-size`] = header.getSize()
            colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
        }
        props.getTableState?.(table.getState())
        props.getColumnSizing?.(table.getState().columnSizing)
        return colSizes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.enableColumnResizing, table.getState().columnSizingInfo, table.getState().columnSizing])

    return (
        <div className={style['asma-core-ui-styled-table']}>
            <div className={clsx(style['table-wrapper'], className)} style={{ height }}>
                <table
                    className={style['styled-table']}
                    style={{
                        ...columnSizeVars,
                        //width: table.getTotalSize(),
                    }}
                >
                    <TableHeader table={table} styledTableProps={props} tableCanResize={!!props.enableColumnResizing} />
                    {columnSizeVars ? (
                        <>
                            {table.getState().columnSizingInfo.isResizingColumn ? (
                                <MemoizedTableBody table={table} styledTableProps={props} />
                            ) : (
                                <TableBody table={table} styledTableProps={props} />
                            )}
                        </>
                    ) : (
                        <TableBody table={table} styledTableProps={props} />
                    )}
                </table>
            </div>
            <TableFooter table={table} styledTableProps={props} />
        </div>
    )
}

export const MemoizedTableBody = memo(
    TableBody,
    (prev, next) => prev.table.options.data === next.table.options.data,
) as typeof TableBody
