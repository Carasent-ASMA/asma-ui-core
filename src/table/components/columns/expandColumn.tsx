import { type CellContext, type HeaderContext } from '@tanstack/react-table'
import clsx from 'clsx'
import { EXPAND_COLUMN_ID, type ColumnDef } from '../../types'
import { ChevronDownIcon } from 'src/table/shared-components/ChevronDownIcon'
import style from '../StyledTable.module.scss'

/**
 * Visually blank, but the header cell names the column for a screen reader's table navigation (axe
 * `empty-table-header`), as `ActionsEmptyHeader` does. Module-level, so rebuilt columns do not remount it.
 */
function ExpandEmptyHeader<TData>(ctx: HeaderContext<TData, unknown>): JSX.Element {
    return <span className='sr-only'>{ctx.table.options.meta?.locale === 'no' ? 'Utvid' : 'Expand'}</span>
}

export function generateExpandColumn<TData>(
    isFixed: boolean,
    rowHeight?: number,
    locale?: 'en' | 'no',
): ColumnDef<TData, unknown> {
    return {
        id: EXPAND_COLUMN_ID,
        minSize: 50,
        maxSize: 50,
        size: 50,
        enableHiding: false,
        enableSorting: false,
        header: ExpandEmptyHeader,
        cell: ({ cell }: CellContext<TData, unknown>) => {
            const isExpanded = cell.row.getIsExpanded()
            const canExpand = cell.row.getCanExpand()
            return canExpand ? (
                // Native <button>: icon-only row-expand toggle, was a <span onClick> — unreachable by
                // keyboard and had no accessible name/state for assistive tech.
                <button
                    type='button'
                    aria-label={
                        locale === 'no'
                            ? isExpanded
                                ? `Skjul rad ${cell.row.index + 1}`
                                : `Utvid rad ${cell.row.index + 1}`
                            : isExpanded
                              ? `Collapse row ${cell.row.index + 1}`
                              : `Expand row ${cell.row.index + 1}`
                    }
                    aria-expanded={isExpanded}
                    // Reached with the arrow keys in its row, not with Tab; Enter and Space toggle it (ASMA-8875).
                    tabIndex={-1}
                    data-table-control=''
                    className={clsx(
                        'flex w-full items-center justify-center border-0 bg-transparent p-0 outline-none',
                        style['expand-control'],
                    )}
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
