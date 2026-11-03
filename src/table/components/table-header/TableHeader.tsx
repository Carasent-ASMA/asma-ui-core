import { type Table } from '@tanstack/react-table'
import { TableHeaderCell } from './TableHeaderCell'
import style from '../StyledTable.module.scss'
import { ACTIONS_COLUMN_ID, type StyledTableProps } from 'src/table/types'
import { cn } from 'src/table/helpers/cn'
import { type CSSProperties } from 'react'
import type { ColumnWindow } from 'src/table/hooks/useColumnVirtualizer'
import { getActiveBodyRow, getLastHeaderControl } from 'src/table/helpers/headerControls'

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
}): JSX.Element {
    const { stickyHeader = false, hideHeader = false, tableHeaderRef, tableHeaderStyle = {} } = styledTableProps
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
            // A hidden header is skipped by the keyboard entirely (ASMA-8702): no invisible tab stops.
            {...(hideHeader ? { inert: '' } : {})}
        >
            {headerGroups.map((headerGroup) => {
                const positionedHeaders = headerGroup.headers.map((header, index, allHeaders) => ({
                    header,
                    left: allHeaders.slice(0, index).reduce((acc, col) => acc + (col.column.getSize() ?? 0), 0),
                }))

                const leftHeaders = positionedHeaders.filter(({ header }) => header.column.columnDef.fixedLeft)
                const centerHeaders = positionedHeaders.filter(
                    ({ header }) =>
                        !header.column.columnDef.fixedLeft &&
                        !header.column.columnDef.fixedRight &&
                        header.column.id !== ACTIONS_COLUMN_ID,
                )
                const rightHeaders = positionedHeaders
                    .filter(
                        ({ header }) => Boolean(header.column.columnDef.fixedRight) || header.column.id === ACTIONS_COLUMN_ID,
                    )
                const hasActionsColumn = rightHeaders.some(({ header }) => header.column.id === ACTIONS_COLUMN_ID)
                const rightHeadersWithOffsets = rightHeaders.map((headerItem, index, allHeaders) => ({
                    ...headerItem,
                    right:
                        allHeaders.slice(index + 1).reduce((acc, col) => acc + (col.header.column.getSize() ?? 0), 0) +
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
                    <tr
                        key={headerGroup.id}
                        // The header row is not a tab stop (ASMA-8702): Tab walks the sortable headers and the pin in
                        // visual order. The body is one roving tab stop (ASMA-8087), so Tab leaves the header for the
                        // body here, not through whatever follows the header in the DOM.
                        onKeyDown={(event) => {
                            // Only Tab pressed on the LAST header control goes to the rows. Every other control keeps
                            // the default, which is the next control. A Tab that something handled already is left
                            // alone: the column settings popover is portalled, but React still bubbles its keys to
                            // this row, and it has moved focus into its panel on Tab and called `preventDefault`
                            // (WCAG 2.1.1, ASMA-8597).
                            if (event.key !== 'Tab' || event.shiftKey || event.defaultPrevented) return

                            const table = event.currentTarget.closest('table')

                            if (event.target !== getLastHeaderControl(table)) return
                            // Enter the rows on the one the user last worked with — the row that holds the
                            // roving tab stop — not always on the first.
                            const activeRow = getActiveBodyRow(table)

                            if (!activeRow) return
                            event.preventDefault()
                            activeRow.focus()
                        }}
                    >
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
