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
                    className={style['select-control']}
                    onClick={() => table.toggleAllRowsSelected()}
                    onMouseDown={stopMouseEvent}
                    onMouseUp={stopMouseEvent}
                    onKeyDown={(event) => handleToggleKeyDown(event, () => table.toggleAllRowsSelected())}
                >
                    {/* `decorative`: the wrapping div is the real control (it owns role, focus,
                        click and keyboard). A nested real <input type="checkbox"> is an axe
                        `nested-interactive` violation that `aria-hidden` + `tabIndex={-1}` do
                        not satisfy — only removing the input does (ASMA-8143). Same classes and
                        `data-*` state attributes, so the rendered box is unchanged. */}
                    <StyledCheckbox
                        size='small'
                        dataTest='cell-select-all'
                        decorative
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
            const locked = !cell.row.getCanSelect()
            const checked = cell.row.getIsSelected()
            /*
             * A row that is **ticked and locked** is not a disabled control, it is a read-only one:
             * it says "already taken", and the greyed `delta-200` fill said "unavailable", which in a
             * picker reads as a row you may not have rather than one you already do. `readOnly` is the
             * state the checkbox has always shipped for this (Figma State=Read-only — white box,
             * `delta-500` border and tick); this is its first use.
             *
             * An **unticked** locked row keeps `disabled`, and must: read-only renders a plain empty
             * box, which is exactly what a selectable row looks like, so the one thing the user needs
             * to know about that row would stop being visible.
             *
             * Neither is operable — the wrapper below ignores click and keyboard either way, and
             * `aria-disabled` keeps saying so.
             */
            const disabled = locked && !checked
            const readOnly = locked && checked

            return (
                <div
                    role='checkbox'
                    tabIndex={locked ? -1 : 0}
                    aria-label={labels.selectRow(cell.row.index + 1)}
                    aria-checked={cell.row.getIsSelected()}
                    aria-disabled={locked}
                    style={{ height: rowHeight ?? 'auto' }}
                    className={style['select-control']}
                    onClick={() => {
                        if (locked) return
                        cell.row.toggleSelected()
                    }}
                    onMouseDown={stopMouseEvent}
                    onMouseUp={stopMouseEvent}
                    onKeyDown={(event) => {
                        if (locked) return
                        handleToggleKeyDown(event, () => cell.row.toggleSelected())
                    }}
                >
                    <StyledTooltip arrow placement='top-start' title={cell.row.getRowSelectionTooltip()}>
                        <span className={locked ? style['cursor-not-allowed'] : undefined}>
                            {/* `decorative` — see the header checkbox above. */}
                            <StyledCheckbox
                                size='small'
                                dataTest='cell-select'
                                decorative
                                checked={checked}
                                // DO NOT REMOVE needed for layout consistency
                                hideWrapper
                                disabled={disabled}
                                readOnly={readOnly}
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
