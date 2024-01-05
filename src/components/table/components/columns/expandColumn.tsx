import { type CellContext } from '@tanstack/react-table'
import { ChevronDownIcon, ChevronUpIcon } from 'src/components/data-display/icons'
import { EXPAND_COLUMN_ID } from '../../types'

export function generateExpandColumn<TData>() {
    return {
        id: EXPAND_COLUMN_ID,
        maxSize: 50,
        size: 50,
        enableHiding: false,
        enableSorting: false,
        header: () => null,
        cell: ({ cell }: CellContext<TData, TData>) => {
            const isExpanded = cell.row.getIsExpanded()
            const canExpand = cell.row.getCanExpand()
            return canExpand ? (
                <span
                    className='flex w-fit h-fit bg-transparent outline-none focus:outline-none items-center justify-center'
                    onClick={() => cell.row.getToggleExpandedHandler()()}
                >
                    {isExpanded ? <ChevronUpIcon width={24} height={24} /> : <ChevronDownIcon width={24} height={24} />}
                </span>
            ) : null
        },
    }
}
