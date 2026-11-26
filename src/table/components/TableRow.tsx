import { flexRender, type Row } from '@tanstack/react-table'
import { Fragment, useMemo, type CSSProperties, useEffect, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { ACTIONS_COLUMN_ID, INTERNAL_COLUMN_IDS, SELECT_COLUMN_ID, type StyledTableProps } from '../types'
import style from './StyledTable.module.scss'
import clsx from 'clsx'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRootContext } from 'src/table/context/RootContext'
import type { ColumnWindow } from 'src/table/hooks/useColumnVirtualizer'
import { COMPACT_COLUMN_MAX_WIDTH } from 'src/table/helpers/columnSpacing'

export function TableRow<TData extends { id: string | number }, TCustomData = Record<string, unknown>>({
    styledTableProps,
    row,
    index,
    hasFocusedRow,
    columnWindow: { paddingLeft, paddingRight, indexes },
}: {
    styledTableProps: StyledTableProps<TData, TCustomData>
    row: Row<TData>
    columnWindow: ColumnWindow
    index: number
    hasFocusedRow: boolean
}): JSX.Element {
    const {
        loading,
        getRowClassName,
        activeRowId,
        rowHeight,
        onRowClick,
        expandArrow,
        enableDnd,
        disableDndForRow,
        tdClassName,
        customSubRowData,
        renderSubRows,
        defaultExpanded,
        actions,
        customActionsNode,
        stickyActions,
        textExpandArrow,
        enableMultiRowSelection,
        enableRowSelection,
        singleSelectionRow,
    } = styledTableProps

    const disabledDnd = disableDndForRow?.(row)

    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
        disabled: !enableDnd || disabledDnd,
    })

    const dndStyle: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
    }

    const { isResizing, disableResizingFlag } = useRootContext()

    const isRowExpanded = row.isExpanded()
    const rowRef = useRef<HTMLTableRowElement | null>(null)
    const [collapsedRowHeight, setCollapsedRowHeight] = useState<number | undefined>(undefined)

    useLayoutEffect(() => {
        if (!isRowExpanded && rowRef.current) {
            setCollapsedRowHeight(rowRef.current.cells[0]?.clientHeight ?? rowRef.current.offsetHeight)
        }
    }, [isRowExpanded])

    const setRowRef = useCallback(
        (node: HTMLTableRowElement | null) => {
            rowRef.current = node
            if (!disabledDnd) setNodeRef(node)
        },
        [disabledDnd, setNodeRef],
    )

    const cellBandMinHeight = isRowExpanded ? (collapsedRowHeight ?? rowHeight) : rowHeight

    useEffect(() => {
        if (defaultExpanded && row.getCanExpand() && !row.getIsExpanded()) {
            row.toggleExpand()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onMouseUpAction = (
        e: React.MouseEvent<HTMLTableRowElement, MouseEvent> | React.KeyboardEvent<HTMLTableRowElement>,
    ) => {
        if (row.getCanExpand() && !expandArrow) {
            row.getToggleExpandedHandler()()
        }

        document.getElementById(row.id)?.focus()

        const selection = window.getSelection()?.type === 'Range'

        const isIdle = !selection && !isResizing
        const hasRowClickHandler = onRowClick instanceof Function

        if (!hasRowClickHandler && textExpandArrow && isIdle) {
            row.toggleExpand()
        } else if (hasRowClickHandler && isIdle) {
            onRowClick(e, row)
        }

        disableResizingFlag()
    }

    const onMouseUp = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        if (
            (e.target as HTMLDivElement).classList.contains('MuiModal-backdrop') ||
            (e.target as Node).nodeName === 'INPUT' ||
            (e.target as Node).nodeName === 'BUTTON' ||
            (e.target as Node).nodeName === 'LI' ||
            !!(e.target as HTMLElement).closest('li')
        ) {
            return
        }
        onMouseUpAction(e)
    }

    /**
     * Space on the row itself (ASMA-8875 AC 4, as the user reads it): with a select column, it toggles the row's selection
     * (a locked row: nothing); without one, it expands or collapses the row as its chevron does. `false` when it did nothing.
     */
    const onSpace = (): boolean => {
        if (row.getVisibleCells().some((cell) => cell.column.id === SELECT_COLUMN_ID)) {
            if (!row.getCanSelect()) return false
            row.toggleSelected()

            return true
        }
        if (!row.getCanExpand()) return false
        row.getToggleExpandedHandler()()

        return true
    }

    // Enter on the row itself opens it: its own table's `onRowClick` (ASMA-8875 AC 3), nested or not; Space selects or
    // expands it. Every other key is the outermost table's (`tableKeyboard.ts`), which hears it after this. Enter and Space
    // on a control are the control's.
    const onKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>): void => {
        if (e.target !== e.currentTarget || e.defaultPrevented) return
        if (e.key === 'Enter') {
            e.preventDefault()
            onMouseUpAction(e)
        } else if (e.key === ' ' && onSpace()) {
            e.preventDefault()
        }
    }

    const positionedCells = row.getVisibleCells().map((cell, idx, allCells) => ({
        ...cell,
        left: allCells.slice(0, idx).reduce((acc, col) => acc + (col.column.getSize() ?? 0), 0),
    }))

    const hasActionsContent = Boolean(actions) || Boolean(customActionsNode)

    const hasFixedRightColumns = positionedCells.some((cell) => Boolean(cell.column.columnDef.fixedRight))

    /**
     * ASMA-8427: an actions column that only hosts the header pin menu has empty body cells, and
     * pinned they only cover the column behind them — so they scroll with the data. The header cell
     * with the pin menu stays pinned either way. Beside fixed-right columns the column stays pinned,
     * so the body's right offsets keep matching the header's.
     */
    const isActionsColumnSticky = stickyActions ?? (hasActionsContent || hasFixedRightColumns)

    const centerCells = useMemo(
        () =>
            positionedCells.filter(
                (cell) =>
                    !cell.column.columnDef.fixedLeft &&
                    !cell.column.columnDef.fixedRight &&
                    cell.column.id !== ACTIONS_COLUMN_ID,
            ),
        [positionedCells],
    )

    const rightCells = useMemo(
        () => {
            const pinnedRightCells = positionedCells.filter(
                (cell) =>
                    Boolean(cell.column.columnDef.fixedRight) ||
                    (cell.column.id === ACTIONS_COLUMN_ID && isActionsColumnSticky),
            )

            return pinnedRightCells.map((cell, index, allCells) => ({
                ...cell,
                right: allCells.slice(index + 1).reduce((acc, col) => acc + (col.column.getSize() ?? 0), 0),
            }))
        },
        [positionedCells, isActionsColumnSticky],
    )

    const hasActionsColumn = useMemo(
        () => rightCells.some((cell) => cell.column.id === ACTIONS_COLUMN_ID),
        [rightCells],
    )

    const inlineActionsCell = isActionsColumnSticky
        ? undefined
        : positionedCells.find((cell) => cell.column.id === ACTIONS_COLUMN_ID)

    const leftCells = useMemo(
        () => positionedCells.filter((cell) => cell.column.columnDef.fixedLeft),
        [positionedCells],
    )

    const spaceForCheckmark = !enableMultiRowSelection && !enableRowSelection && singleSelectionRow
    const singleSelection = row.getIsSelected() && spaceForCheckmark
    const hasRowClickHandler = onRowClick instanceof Function

    // With each centre cell, its index among the centre columns: the keys reveal the ones not rendered (ASMA-8875).
    const centerCellsToRender = (indexes.length > 0 ? indexes : centerCells.map((_, index) => index)).flatMap((index) => {
        const cell = centerCells[index]
        return cell ? [{ cell, index }] : []
    })

    const renderCell = useCallback(
        (cell: (typeof positionedCells)[number], renderIndex: number, columnIndex?: number) => {
            const isActionsCell = cell.column.id === ACTIONS_COLUMN_ID
            const isFixedLeft = cell.column.columnDef.fixedLeft
            const isFixedRight = Boolean(cell.column.columnDef.fixedRight)
            const isLastFixedCell = cell.id === leftCells.at(-1)?.id
            const isFirstRightFixedCell = cell.id === rightCells.at(0)?.id && !isActionsCell
            const isExpandedRow = row.isExpanded()
            const isFirstCell = renderIndex === 0

            return (
                <td
                    key={cell.id}
                    className={clsx(
                        style['t-cell'],
                        !INTERNAL_COLUMN_IDS.includes(cell.column.id) && cell.column.getSize() > COMPACT_COLUMN_MAX_WIDTH && style['data-cell'],
                        cell.column.id === SELECT_COLUMN_ID && style['select-cell'],
                        hasRowClickHandler && 'cursor-pointer',
                        tdClassName,
                        isActionsCell && isActionsColumnSticky && style['action-cell'],
                        isActionsCell &&
                            isActionsColumnSticky &&
                            (!hasActionsContent || hasFixedRightColumns) &&
                            style['action-cell--no-shadow'],
                        isActionsCell &&
                            isActionsColumnSticky &&
                            Boolean(actions) &&
                            leftCells.length &&
                            style['shadowed'],
                        isActionsCell &&
                            isActionsColumnSticky &&
                            (getRowClassName?.(row) ? getRowClassName?.(row) : style['action-cell-default-background']),
                        isFixedLeft && style['fixed-cell'],
                        isFixedRight && style['fixed-right-cell'],
                        isLastFixedCell && style['shadowed'],
                        isFirstRightFixedCell && style['shadowed-right'],
                        row.getIsSelected() && style['selected'],
                        isFixedLeft &&
                            (getRowClassName?.(row) ? getRowClassName?.(row) : style['fixed-cell-default-background']),
                        isFixedRight &&
                            (getRowClassName?.(row)
                                ? getRowClassName?.(row)
                                : style['fixed-right-cell-default-background']),
                        isExpandedRow && style['expanded_row'],
                        Boolean(singleSelection) && style['single-selection'],
                    )}
                    data-column-index={columnIndex}
                    data-column-side={isFixedRight || isActionsCell ? 'right' : undefined}
                    style={{
                        left: isFixedLeft ? cell.left : undefined,
                        right: isFixedRight
                            ? (cell as (typeof rightCells)[number]).right + (hasActionsColumn ? -1 : 0)
                            : undefined,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: isFirstCell ? 32 : undefined,
                            minHeight: cellBandMinHeight,
                            position: 'relative',
                        }}
                    >
                        {isFirstCell && singleSelection && (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                }}
                            >
                                <Checkmark />
                            </span>
                        )}
                        <span style={{ marginLeft: isFirstCell && spaceForCheckmark ? 30 : 0, width: '100%' }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                    </div>
                </td>
            )
        },
        [
            singleSelection,
            actions,
            cellBandMinHeight,
            getRowClassName,
            hasRowClickHandler,
            hasActionsColumn,
            hasFixedRightColumns,
            leftCells,
            rightCells,
            row,
            hasActionsContent,
            isActionsColumnSticky,
            spaceForCheckmark,
            tdClassName,
        ],
    )


    return (
        <Fragment key={row.id}>
            <tr
                aria-selected={row.getIsSelected() || row.isFocused() ? 'true' : 'false'}
                tabIndex={row.isFocused() || (index === 0 && !hasFocusedRow) ? 0 : -1}
                data-index={index}
                data-test={row.id}
                data-active={activeRowId != null && row.id === activeRowId ? 'true' : undefined}
                id={row.id}
                className={clsx(style['t-row'], loading && style['is-loading'], getRowClassName?.(row))}
                style={{
                    height: rowHeight ? `${rowHeight}px` : 'inherit',
                    ...(enableDnd && dndStyle),
                }}
                ref={setRowRef}
                // This table's own row (`TABLE_ROW_ATTRIBUTE`): its controls are reached with the arrow keys. The focused-row
                // marker is the table's React state, which the tab stop falls back to (`FOCUSED_ROW_ATTRIBUTE`).
                data-table-row=''
                data-focused-row={row.isFocused() ? '' : undefined}
                onFocus={(event) => {
                    if (event.target === event.currentTarget) {
                        if (!row.isFocused()) row.onChangeFocused(true)
                    } else if (event.currentTarget.contains(event.target)) {
                        // A control in the row took the focus (an arrow key or the mouse): the row becomes the tab stop
                        // Tab comes back to. A portalled menu's focus bubbles here through React, but is not in the row.
                        row.takeTabStop()
                    }
                }}
                onMouseUp={onMouseUp}
                onMouseDown={(e) => {
                    if (e.detail > 1 && !hasRowClickHandler && textExpandArrow) {
                        e.preventDefault()
                    }
                }}
                onKeyDown={onKeyDown}
            >
                {leftCells.map((cell, idx) => renderCell(cell, idx))}

                {paddingLeft > 0 && (
                    <td
                        aria-hidden
                        className={style['t-cell']}
                        style={{
                            width: String(paddingLeft) + 'px',
                            minWidth: String(paddingLeft) + 'px',
                            maxWidth: String(paddingLeft) + 'px',
                            padding: 0,
                            border: 'none',
                        }}
                    />
                )}

                {centerCellsToRender.map(({ cell, index: columnIndex }, idx) =>
                    renderCell(cell, leftCells.length + idx, columnIndex),
                )}

                {paddingRight > 0 && (
                    <td
                        aria-hidden
                        className={style['t-cell']}
                        style={{
                            width: String(paddingRight) + 'px',
                            minWidth: String(paddingRight) + 'px',
                            maxWidth: String(paddingRight) + 'px',
                            padding: 0,
                            border: 'none',
                        }}
                    />
                )}

                {rightCells.map((cell, idx) => renderCell(cell, leftCells.length + centerCellsToRender.length + idx))}

                {/* An unpinned actions column renders in the normal column flow, after the data. */}
                {inlineActionsCell &&
                    renderCell(inlineActionsCell, leftCells.length + centerCellsToRender.length + rightCells.length)}
            </tr>
            {row.getIsExpanded() && (
                <>
                    {customSubRowData &&
                        renderSubRows?.({
                            rows: customSubRowData.get(row.original.id.toString()) ?? [],
                            row: row.original,
                        })}
                </>
            )}
        </Fragment>
    )
}

export const Checkmark = (): JSX.Element => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='20'
        height='20'
        viewBox='0 2 22 22'
        style={{ color: 'var(--colors-gama-500)' }}
    >
        <title>Checkmark</title>
        <path fill='currentColor' d='M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59z' />
    </svg>
)
