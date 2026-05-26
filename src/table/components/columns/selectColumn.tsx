import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/react-table'
import { SELECT_COLUMN_ID } from '../../types'
import style from '../StyledTable.module.scss'
import { StyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
import { StyledTooltip } from 'src/table/shared-components/tooltip'

const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLElement>, onToggle: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onToggle()
}

export function selectColumn<TData>(isFixed: boolean, rowHeight?: number): ColumnDef<TData, unknown> {
    return {
        id: SELECT_COLUMN_ID,
        minSize: 38,
        maxSize: 38,
        size: 38,
        header: ({ table }: HeaderContext<TData, unknown>) => {
            return (
                <div
                    role='button'
                    tabIndex={0}
                    className='flex size-full items-center justify-start pl-2'
                    onClick={() => table.toggleAllRowsSelected()}
                    onKeyDown={(event) => handleToggleKeyDown(event, () => table.toggleAllRowsSelected())}
                >
                    <StyledCheckbox
                        size='small'
                        dataTest='cell-select-all'
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        // DO NOT REMOVE needed for layout consistency
                        hideWrapper
                    />
                </div>
            )
        },
        cell: ({ cell }: CellContext<TData, unknown>) => {
            const disabled = !cell.row.getCanSelect()
            return (
                <div
                    role='button'
                    tabIndex={disabled ? -1 : 0}
                    style={{ height: rowHeight ?? 'auto' }}
                    className='m-0 flex w-full items-center justify-start p-0 pl-2'
                    aria-disabled={disabled}
                    onClick={() => {
                        if (disabled) return
                        cell.row.toggleSelected()
                    }}
                    onKeyDown={(event) => {
                        if (disabled) return
                        handleToggleKeyDown(event, () => cell.row.toggleSelected())
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
                                onMouseUp={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                            />
                        </span>
                    </StyledTooltip>
                </div>
            )
        },
        fixedLeft: isFixed,
    }
}
