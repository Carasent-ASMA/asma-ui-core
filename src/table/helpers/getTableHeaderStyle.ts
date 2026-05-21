import type { Header } from '@tanstack/react-table'
import { ACTIONS_COLUMN_ID } from 'src/table/types'

export const getTableHeaderStyle = <TData>(props: {
    enableResizing: boolean
    header: Header<TData, unknown>
    element: HTMLTableCellElement | null
    tableWidth: number | null
}) => {
    const { header, enableResizing, tableWidth /* element */ } = props

    let columnWidth: number | string = header.getSize()

    const totalSize = header.headerGroup.headers.reduce((sum, currentHeader) => {
        return sum + currentHeader.getSize()
    }, 0)

    const hasActionsColumn = header.headerGroup.headers.some((hdr) => hdr.id === ACTIONS_COLUMN_ID)
    const lastColumn = header.headerGroup.headers[header.headerGroup.headers.length - (hasActionsColumn ? 2 : 1)]

    const lastColumnWidth = Number(lastColumn?.getSize())

    if (!enableResizing) {
        // setup SIZE, if user predefined it in column builder
        if (columnWidth) {
            columnWidth = `${columnWidth}px`
        }

        // setup full width for last user created column
        if (lastColumn && lastColumn.id === header.id) {
            let size

            if (tableWidth) {
                size = Math.floor(tableWidth) - totalSize + lastColumnWidth
            } else {
                size = '100%'
            }

            const minSize = header.column.columnDef.minSize || 0

            if (typeof size === 'string') {
                columnWidth = size
            } else if (size > minSize) {
                columnWidth = `${size}px`
            } else {
                columnWidth = `${minSize}px`
            }
        }

        return {
            width: columnWidth || header.column.columnDef.size,
            maxWidth: columnWidth || header.column.columnDef.maxSize,
            minWidth: columnWidth || header.column.columnDef.minSize,
        }
    }

    // *******************************//
    //  styles for Resizing table    //
    // ***************************** //

    // the column MinSize && MaxSize set by the user has the highest priority
    return {
        width: columnWidth || header.column.columnDef.size,
        maxWidth: header.column.columnDef.maxSize || columnWidth,
        minWidth: header.column.columnDef.minSize || columnWidth,
    }
}
