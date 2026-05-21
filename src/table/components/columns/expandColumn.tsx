import { type CellContext } from '@tanstack/react-table'
import { EXPAND_COLUMN_ID } from '../../types'
import { ChevronDownIcon } from 'src/table/shared-components/ChevronDownIcon'

export function generateExpandColumn<TData>(isFixed: boolean, rowHeight?: number) {
    return {
        id: EXPAND_COLUMN_ID,
        minSize: 50,
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
                    className='flex w-full outline-none focus:outline-none items-center justify-center'
                    onClick={() => cell.row.getToggleExpandedHandler()()}
                    style={{ height: rowHeight ? rowHeight : 'auto' }}
                >
                    <ChevronDownIcon
                        width={24}
                        height={24}
                        style={{
                            rotate: isExpanded ? '180deg' : '0deg',
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            transitionDuration: '500ms',
                        }}
                    />
                </span>
            ) : null
        },
        fixedLeft: isFixed,
    }
}
