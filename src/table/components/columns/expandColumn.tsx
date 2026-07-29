import { type CellContext } from '@tanstack/react-table'
import { EXPAND_COLUMN_ID, type ColumnDef } from '../../types'
import { ChevronDownIcon } from 'src/table/shared-components/ChevronDownIcon'

export function generateExpandColumn<TData>(isFixed: boolean, rowHeight?: number): ColumnDef<TData, unknown> {
    return {
        id: EXPAND_COLUMN_ID,
        minSize: 50,
        maxSize: 50,
        size: 50,
        enableHiding: false,
        enableSorting: false,
        header: () => null,
        cell: ({ cell }: CellContext<TData, unknown>) => {
            const isExpanded = cell.row.getIsExpanded()
            const canExpand = cell.row.getCanExpand()
            return canExpand ? (
                // Native <button>: icon-only row-expand toggle, was a <span onClick> — unreachable by
                // keyboard and had no accessible name/state for assistive tech.
                <button
                    type='button'
                    aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                    aria-expanded={isExpanded}
                    className='flex w-full items-center justify-center border-0 bg-transparent p-0 outline-none focus:outline-none'
                    onClick={() => cell.row.getToggleExpandedHandler()()}
                    style={{ height: rowHeight ?? 'auto' }}
                >
                    <ChevronDownIcon
                        className='block size-6 shrink-0'
                        width={24}
                        height={24}
                        style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transformBox: 'fill-box',
                            transformOrigin: 'center',
                            transitionProperty: 'transform',
                            transitionDuration: '500ms',
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    />
                </button>
            ) : null
        },
        fixedLeft: isFixed,
    }
}
