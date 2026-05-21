import { type Table } from '@tanstack/react-table'
import { TableHeaderCell } from './TableHeaderCell'
import style from '../StyledTable.module.scss'
import { ACTIONS_COLUMN_ID, type StyledTableProps } from 'src/table/types'
import { cn } from 'src/table/helpers/cn'
import { type CSSProperties } from 'react'
import type { ColumnWindow } from 'src/table/hooks/useColumnVirtualizer'

export function TableHeader<
    TData extends {
        id: string | number
    },
    TCustomData = Record<string, unknown>,
>({
    table,
    styledTableProps,
    tableCanResize,
    tableWidth,
    columnWindow: { paddingLeft, paddingRight, indexes },
}: {
    table: Table<TData>
    styledTableProps: StyledTableProps<TData, TCustomData>
    tableCanResize: boolean
    tableWidth: number | null
    columnWindow: ColumnWindow
}) {
    const { stickyHeader = false, tableHeaderRef, tableHeaderStyle = {} } = styledTableProps
    const headerGroups = table.getHeaderGroups()

    const styles: CSSProperties = {
        ...tableHeaderStyle,
    }

    return (
        <thead
            className={cn(
                style['table-header'],
                stickyHeader && style['table-header--sticky'],
                styledTableProps.tableHeaderClassName,
            )}
            style={styles}
            ref={tableHeaderRef}
        >
            {headerGroups.map((headerGroup) => {
                const positionedHeaders = headerGroup.headers.map((header, index, allHeaders) => ({
                    header,
                    left: allHeaders.slice(0, index).reduce((acc, col) => acc + (col.column.getSize() || 0), 0),
                }))

                const leftHeaders = positionedHeaders.filter(({ header }) => header.column.columnDef.fixedLeft)
                const centerHeaders = positionedHeaders.filter(
                    ({ header }) =>
                        !header.column.columnDef.fixedLeft &&
                        !header.column.columnDef.fixedRight &&
                        header.column.id !== ACTIONS_COLUMN_ID,
                )
                const rightHeaders = positionedHeaders
                    .filter(({ header }) => header.column.columnDef.fixedRight || header.column.id === ACTIONS_COLUMN_ID)
                const hasActionsColumn = rightHeaders.some(({ header }) => header.column.id === ACTIONS_COLUMN_ID)
                const rightHeadersWithOffsets = rightHeaders.map((headerItem, index, allHeaders) => ({
                    ...headerItem,
                    right:
                        allHeaders.slice(index + 1).reduce((acc, col) => acc + (col.header.column.getSize() || 0), 0) +
                        (hasActionsColumn ? -1 : 0),
                }))

                const centerHeadersToRender = indexes.reduce<typeof centerHeaders>((acc, index) => {
                    const header = centerHeaders[index]
                    if (header) {
                        acc.push(header)
                    }
                    return acc
                }, [])

                return (
                    <tr key={headerGroup.id}>
                        {leftHeaders.map(({ header, left }) => (
                            <TableHeaderCell
                                key={header.id}
                                styledTableProps={styledTableProps}
                                header={header}
                                tableCanResize={tableCanResize}
                                left={left}
                                tableWidth={tableWidth}
                            />
                        ))}

                        {paddingLeft > 0 && (
                            <th
                                aria-hidden
                                style={{
                                    width: String(paddingLeft) + 'px',
                                    minWidth: String(paddingLeft) + 'px',
                                    maxWidth: String(paddingLeft) + 'px',
                                    padding: 0,
                                    border: 'none',
                                }}
                            />
                        )}

                        {centerHeadersToRender.map((item) => {
                            if (!item) return null
                            const { header, left } = item
                            return (
                                <TableHeaderCell
                                    key={header.id}
                                    styledTableProps={styledTableProps}
                                    header={header}
                                    tableCanResize={tableCanResize}
                                    left={left}
                                    tableWidth={tableWidth}
                                />
                            )
                        })}

                        {paddingRight > 0 && (
                            <th
                                aria-hidden
                                style={{
                                    width: String(paddingRight) + 'px',
                                    minWidth: String(paddingRight) + 'px',
                                    maxWidth: String(paddingRight) + 'px',
                                    padding: 0,
                                    border: 'none',
                                }}
                            />
                        )}

                        {rightHeadersWithOffsets.map(({ header, left, right }) => (
                            <TableHeaderCell
                                key={header.id}
                                styledTableProps={styledTableProps}
                                header={header}
                                tableCanResize={tableCanResize}
                                left={left}
                                right={right}
                                tableWidth={tableWidth}
                            />
                        ))}
                    </tr>
                )
            })}
        </thead>
    )
}
