import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/react-table'
import type { KeyboardEvent, MouseEvent } from 'react'
import { SELECT_COLUMN_ID } from '../../types'
import style from '../StyledTable.module.scss'
import { cn } from 'src/table/helpers/cn'
import { StyledCheckbox } from 'src/components/inputs/checkbox/base-ui/StyledCheckbox'
import { StyledTooltip } from 'src/table/shared-components/tooltip'
import { composeHandlers, pressedStateHandlers } from 'src/helpers/pressedState'

const stopMouseEvent = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
}

// Like a native control: Enter toggles on keydown, Space once on keyup, never on key repeat (ASMA-9003).
const handleToggleKeyDown = (event: KeyboardEvent<HTMLElement>, onToggle: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Enter') onToggle()
}

// Runs before the pressed-state keyup clears `data-pressed="key"` (a Space press begun on this cell).
const handleToggleKeyUp = (event: KeyboardEvent<HTMLElement>, onToggle: () => void) => {
    if (event.key !== ' ' || event.currentTarget.getAttribute('data-pressed') !== 'key') return
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
            const selectAllPressed = pressedStateHandlers({ enabled: true, keyboard: true })
            return (
                <div
                    role='checkbox'
                    // A header control (ASMA-8875): never a tab stop; the header row is, and the arrow keys reach it.
                    tabIndex={-1}
                    data-table-control=''
                    aria-label={labels.selectAll}
                    aria-checked={table.getIsSomeRowsSelected() ? 'mixed' : table.getIsAllRowsSelected()}
                    className={cn('asma-touch-ready', style['select-control'])}
                    onClick={() => table.toggleAllRowsSelected()}
                    // Not prevented: the browser's mouse focus shows no `:focus-visible`, and Space then toggles it back.
                    onMouseDown={(event) => event.stopPropagation()}
                    onMouseUp={stopMouseEvent}
                    {...selectAllPressed}
                    onKeyDown={composeHandlers(selectAllPressed.onKeyDown, (event) =>
                        handleToggleKeyDown(event, () => table.toggleAllRowsSelected()),
                    )}
                    onKeyUp={composeHandlers(
                        (event) => handleToggleKeyUp(event, () => table.toggleAllRowsSelected()),
                        selectAllPressed.onKeyUp,
                    )}
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
                        className={cn('pointer-events-none', style['select-checkbox'])}
                        checkboxClassName={style['select-checkbox-box']}
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
            const rowPressed = pressedStateHandlers({ enabled: !locked, keyboard: true })

            // The tooltip wraps the checkbox itself, the element that takes the focus, so its text (the reason a row is
            // locked, or a hint) opens on keyboard focus as on hover (ASMA-8875). A locked row's checkbox is not
            // focusable: its reason opens on hover.
            return (
                <StyledTooltip arrow placement='top-start' title={cell.row.getRowSelectionTooltip()}>
                    <div
                        role='checkbox'
                        // Reached with the arrow keys in its row, not with Tab (ASMA-8875). A locked row's checkbox is
                        // not a control at all: no marker, so the arrows pass it.
                        tabIndex={-1}
                        data-table-control={locked ? undefined : ''}
                        aria-label={labels.selectRow(cell.row.index + 1)}
                        aria-checked={cell.row.getIsSelected()}
                        aria-disabled={locked}
                        style={{ height: rowHeight ?? 'auto' }}
                        className={cn('asma-touch-ready', style['select-control'])}
                        onClick={() => {
                            if (locked) return
                            cell.row.toggleSelected()
                        }}
                        // Not prevented (a locked one takes no focus): the browser's mouse focus shows no `:focus-visible`.
                        onMouseDown={(event) => {
                            if (locked) event.preventDefault()
                            event.stopPropagation()
                        }}
                        onMouseUp={stopMouseEvent}
                        {...rowPressed}
                        onKeyDown={composeHandlers(rowPressed.onKeyDown, (event) => {
                            if (locked) return
                            handleToggleKeyDown(event, () => cell.row.toggleSelected())
                        })}
                        onKeyUp={composeHandlers((event) => {
                            if (locked) return
                            handleToggleKeyUp(event, () => cell.row.toggleSelected())
                        }, rowPressed.onKeyUp)}
                    >
                        <span className={locked ? style['cursor-not-allowed'] : undefined}>
                            {/* `decorative` — see the header checkbox above. */}
                            <StyledCheckbox
                                size='small'
                                dataTest='cell-select'
                                // Editor and qnreditor picker tests still query the legacy `data-test` hook.
                                data-test='cell-select'
                                decorative
                                checked={checked}
                                // DO NOT REMOVE needed for layout consistency
                                hideWrapper
                                disabled={disabled}
                                readOnly={readOnly}
                                className={cn('pointer-events-none', style['select-checkbox'])}
                                checkboxClassName={style['select-checkbox-box']}
                            />
                        </span>
                    </div>
                </StyledTooltip>
            )
        },
        fixedLeft: isFixed,
    }
}
