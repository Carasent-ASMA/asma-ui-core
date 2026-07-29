import { useSortable } from '@dnd-kit/sortable'
import type { Arguments } from '@dnd-kit/sortable/dist/hooks/useSortable'
import clsx from 'clsx'
import type { FC } from 'react'
import { DotsHorizontalIcon } from 'src/table/shared-components/DotsHorizontalIcon'
import { DND_HANDLE_COLUMN_ID, type CellContext, type ColumnDef } from 'src/table/types'

export function generateDndHandleColumn<TData>(
    custom_props?: ColumnDef<TData, unknown>,
    rowHeight?: number,
): ColumnDef<TData, unknown> {
    return {
        enableHiding: false,
        enableSorting: false,
        header: () => null,
        cell: ({ row }: CellContext<TData, unknown>) => <RowDragHandleCell rowId={row.id} rowHeight={rowHeight} />,
        minSize: 50,
        size: 50,
        ...custom_props,
        id: DND_HANDLE_COLUMN_ID,
    }
}

export const RowDragHandleCell: FC<
    Partial<Omit<Arguments, 'id'>> & {
        rowId: string
        rowHeight?: number
    }
> = ({ rowId, rowHeight, ...rest }): JSX.Element => {
    const { attributes, listeners } = useSortable({ id: rowId, ...rest })

    return (
        <div
            {...attributes}
            {...listeners}
            style={{
                height: rowHeight ?? 'auto',
            }}
        >
            <DotsHorizontalIcon
                width={24}
                height={24}
                className={clsx(rest.disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-grab text-delta-800')}
            />
        </div>
    )
}
