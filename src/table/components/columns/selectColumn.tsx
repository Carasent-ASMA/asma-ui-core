import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/react-table'
import type { KeyboardEvent, MouseEvent } from 'react'
import { SELECT_COLUMN_ID } from '../../types'
import style from '../StyledTable.module.scss'
import { StyledCheckbox } from 'src/table/shared-components/StyledCheckbox'
import { StyledTooltip } from 'src/table/shared-components/tooltip'

const stopMouseEvent = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
}

const handleToggleKeyDown = (event: KeyboardEvent<HTMLElement>, onToggle: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    event.stopPropagation()
    onToggle()
}

const getSelectionLabels = (locale?: 'en' | 'no') => {
    if (locale === 'no') {
        return {
            selectAll: 'Velg alle rader',
            selectRow: (rowNumber: number) => `Velg rad ${rowNumber}`,
        }
    }

    return {
        selectAll: 'Select all rows',
        selectRow: (rowNumber: number) => `Select row ${rowNumber}`,
    }
}

export function selectColumn<TData>(isFixed: boolean, rowHeight?: number, locale?: 'en' | 'no'): ColumnDef<TData, unknown> {
    const labels = getSelectionLabels(locale)

    return {
        id: SELECT_COLUMN_ID,
        minSize: 38,
        maxSize: 38,
        size: 38,
        header: ({ table }: HeaderContext<TData, unknown>) => {
            return (
                <div
                    role='checkbox'
                    tabIndex={0}
                    aria-label={labels.selectAll}
                    aria-checked={table.getIsSomeRowsSelected() ? 'mixed' : table.getIsAllRowsSelected()}
                    className='flex size-full items-center justify-start pl-2'
                    onClick={() => table.toggleAllRowsSelected()}
                    onMouseDown={stopMouseEvent}
                    onMouseUp={stopMouseEvent}
                    onKeyDown={(event) => handleToggleKeyDown(event, () => table.toggleAllRowsSelected())}
                >
                    <StyledCheckbox
                        size='small'
                        dataTest='cell-select-all'
                        aria-hidden
                        tabIndex={-1}
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={table.getIsSomeRowsSelected()}
                        className='pointer-events-none'
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
                    role='checkbox'
                    tabIndex={disabled ? -1 : 0}
                    aria-label={labels.selectRow(cell.row.index + 1)}
                    aria-checked={cell.row.getIsSelected()}
                    aria-disabled={disabled}
                    style={{ height: rowHeight ?? 'auto' }}
                    className='m-0 flex w-full items-center justify-start p-0 pl-2'
                    onClick={() => {
                        if (disabled) return
                        cell.row.toggleSelected()
                    }}
                    onMouseDown={stopMouseEvent}
                    onMouseUp={stopMouseEvent}
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
                                aria-hidden
                                tabIndex={-1}
                                checked={cell.row.getIsSelected()}
                                // DO NOT REMOVE needed for layout consistency
                                hideWrapper
                                disabled={disabled}
                                className='pointer-events-none'
                            />
                        </span>
                    </StyledTooltip>
                </div>
            )
        },
        fixedLeft: isFixed,
    }
}
