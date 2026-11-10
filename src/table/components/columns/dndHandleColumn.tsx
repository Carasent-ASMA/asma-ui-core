import { useSortable } from '@dnd-kit/sortable'
import type { Arguments } from '@dnd-kit/sortable/dist/hooks/useSortable'
import clsx from 'clsx'
import type { FC } from 'react'
import { DotsHorizontalIcon } from 'src/table/shared-components/DotsHorizontalIcon'
import { DND_HANDLE_COLUMN_ID, type CellContext, type ColumnDef } from 'src/table/types'

export function generateDndHandleColumn<TData>(
    custom_props?: ColumnDef<TData, unknown>,
    rowHeight?: number,
    locale?: 'en' | 'no',
): ColumnDef<TData, unknown> {
    return {
        enableHiding: false,
        enableSorting: false,
        header: () => null,
        cell: ({ row }: CellContext<TData, unknown>) => (
            <RowDragHandleCell
                ariaLabel={locale === 'no' ? `Endre rekkefølge på rad ${row.index + 1}` : `Reorder row ${row.index + 1}`}
                rowId={row.id}
                rowHeight={rowHeight}
            />
        ),
        minSize: 50,
        size: 50,
        ...custom_props,
        id: DND_HANDLE_COLUMN_ID,
    }
}

export const RowDragHandleCell: FC<
    Partial<Omit<Arguments, 'id'>> & {
        ariaLabel?: string
        rowId: string
        rowHeight?: number
    }
> = ({ ariaLabel, rowId, rowHeight, ...rest }): JSX.Element => {
    const { attributes, listeners } = useSortable({ id: rowId, ...rest })

    return (
        <div
            {...attributes}
            {...listeners}
            aria-label={ariaLabel}
            style={{
                height: rowHeight ?? 'auto',
            }}
        >
            <DotsHorizontalIcon
                width={24}
                height={24}
                className={clsx(rest.disabled ? 'text-delta-300 cursor-not-allowed' : 'text-delta-800 cursor-grab')}
            />
        </div>
    )
}
