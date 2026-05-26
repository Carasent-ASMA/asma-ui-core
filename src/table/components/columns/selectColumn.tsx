import type { MouseEvent } from 'react'
import type { CellContext, HeaderContext } from '@tanstack/react-table'
import { SELECT_COLUMN_ID, type ColumnDef } from '../../types'
import style from '../StyledTable.module.scss'
import { StyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
import { StyledTooltip } from 'src/table/shared-components/tooltip'

export function selectColumn<TData>(isFixed: boolean, rowHeight?: number): ColumnDef<TData, unknown> {
    return {
        id: SELECT_COLUMN_ID,
        minSize: 38,
        maxSize: 38,
        size: 38,
        header: ({ table }: HeaderContext<TData, TData>) => {
            return (
                <button
                    type='button'
                    className='flex size-full items-center justify-start pl-2'
                    onClick={() => table.toggleAllRowsSelected()}
                >
                    <StyledCheckbox
                        size='small'
                        dataTest='cell-select-all'
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        // DO NOT REMOVE needed for layout consistency
                        hideWrapper
                    />
                </button>
            )
        },
        cell: ({ cell }: CellContext<TData, TData>) => {
            const disabled = !cell.row.getCanSelect()
            return (
                <button
                    type='button'
                    style={{ height: rowHeight ?? 'auto' }}
                    className='m-0 flex w-full items-center justify-start p-0 pl-2'
                    aria-disabled={disabled}
                    onClick={() => {
                        if (disabled) return
                        cell.row.toggleSelected()
                    }}
                >
                    <StyledTooltip arrow placement='top-start' title={cell.row.getRowSelectionTooltip()}>
                        <span className={disabled ? style['cursor-not-allowed'] : undefined}>
                            <StyledCheckbox
                                size='small'
                                dataTest='cell-select'
                                checked={cell.row.getIsSelected()}
                                // DO NOT REMOVE needed for layout consistency
                                hideWrapper
                                disabled={disabled}
                                onMouseUp={(event: MouseEvent<HTMLElement>) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                }}
                            />
                        </span>
                    </StyledTooltip>
                </button>
            )
        },
        fixedLeft: isFixed,
    }
}
