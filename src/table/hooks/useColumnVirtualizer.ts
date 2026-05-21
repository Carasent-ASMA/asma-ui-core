import type { Table } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { MutableRefObject } from 'react'
import { ACTIONS_COLUMN_ID } from 'src'

export type ColumnWindow = {
    indexes: number[]
    paddingLeft: number
    paddingRight: number
}

export function useColumnVirtualizer<TData extends { id: string | number }>({
    table,
    scrollRef,
    isMobileView,
}: {
    table: Table<TData>
    scrollRef?: MutableRefObject<HTMLDivElement | null>
    isMobileView: boolean
}) {
    const centerColumns = table
        .getVisibleLeafColumns()
        .filter((column) => !column.columnDef.fixedLeft && !column.columnDef.fixedRight && column.id !== ACTIONS_COLUMN_ID)

    const columnVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableCellElement>({
        count: centerColumns.length,
        getScrollElement: () => scrollRef?.current || null,
        estimateSize: (index) => centerColumns[index]?.getSize?.() ?? 120,
        horizontal: true,
        overscan: 2,
    })

    if (isMobileView) {
        return {
            columnWindow: {
                indexes: centerColumns.map((_, i) => i),
                paddingLeft: 0,
                paddingRight: 0,
            },
        }
    }

    const virtualColumns = columnVirtualizer.getVirtualItems()
    const totalSize = columnVirtualizer.getTotalSize()

    return {
        columnWindow: {
            indexes: virtualColumns.map((item) => item.index),
            paddingLeft: virtualColumns[0]?.start ?? 0,
            paddingRight: virtualColumns.length
                ? Math.max(0, totalSize - (virtualColumns[virtualColumns.length - 1]?.end ?? 0))
                : 0,
        },
    }
}
