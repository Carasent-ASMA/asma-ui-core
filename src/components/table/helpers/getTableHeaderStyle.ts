import type { Header } from '@tanstack/react-table'
import { last } from 'lodash-es'

export const getTableHeaderStyle = <TData>(props: {
    enableResizing: boolean
    header: Header<TData, unknown>
    element: HTMLTableCellElement | null
}) => {
    const { header, enableResizing, element } = props

    let columnWidth: number | string = header.getSize()

    if (!enableResizing) {
        // setup size, if user predefined it in column builder
        if (columnWidth) {
            columnWidth = `${columnWidth}px`
        }

        // last column, except actions
        const hasActionsColumn = last(header.headerGroup.headers)?.id === 'actions'
        const lastUserColumn =
            header.headerGroup.headers[header.headerGroup.headers.length - (hasActionsColumn ? 2 : 1)]
        //  setup full width for last user created column
        if (lastUserColumn?.id === header.id || !columnWidth) {
            columnWidth = '100%'
        }

        return {
            width: columnWidth || header.column.columnDef.size,
            maxWidth: columnWidth || header.column.columnDef.maxSize,
            minWidth: columnWidth || header.column.columnDef.minSize,
        }
    }

    // *
    //  styles for Resizing table

    // const enableResizing = header.column.columnDef.enableResizing
    const width = header.column.columnDef.size
    const minWidth = header.column.columnDef.minSize
    const maxWidth = header.column.columnDef.maxSize

    // if (!!maxWidth && maxWidth < currentWidthFromDom) {
    //     currentWidthFromDom = maxWidth
    // }

    return {
        width,
        maxWidth,
        minWidth,
    }
}
