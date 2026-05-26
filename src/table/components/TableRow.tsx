import { flexRender, type Row } from '@tanstack/react-table'
import { Fragment, useMemo, type CSSProperties, useEffect, useCallback } from 'react'
import { ACTIONS_COLUMN_ID, type StyledTableProps } from '../types'
import style from './StyledTable.module.scss'
import clsx from 'clsx'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRootContext } from 'src/table/context/RootContext'
import type { ColumnWindow } from 'src/table/hooks/useColumnVirtualizer'
import { compact } from 'lodash-es'

export function TableRow<TData extends { id: string | number }, TCustomData = Record<string, unknown>>({
    styledTableProps,
    row,
    index,
    columnWindow: { paddingLeft, paddingRight, indexes },
}: {
    styledTableProps: StyledTableProps<TData, TCustomData>
    row: Row<TData>
    columnWindow: ColumnWindow
    index: number
}): JSX.Element {
    const {
        loading,
        getRowClassName,
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

    const positionedCells = row.getVisibleCells().map((cell, idx, allCells) => ({
        ...cell,
        left: allCells.slice(0, idx).reduce((acc, col) => acc + (col.column.getSize() ?? 0), 0),
    }))

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
                (cell) => Boolean(cell.column.columnDef.fixedRight) || cell.column.id === ACTIONS_COLUMN_ID,
            )

            return pinnedRightCells.map((cell, index, allCells) => ({
                ...cell,
                right: allCells.slice(index + 1).reduce((acc, col) => acc + (col.column.getSize() ?? 0), 0),
            }))
        },
        [positionedCells],
    )

    const hasActionsColumn = useMemo(
        () => rightCells.some((cell) => cell.column.id === ACTIONS_COLUMN_ID),
        [rightCells],
    )


    const shouldStickActionsCell = Boolean(actions) || Boolean(customActionsNode)

    const hasFixedRightColumns = useMemo(
        () => rightCells.some((cell) => Boolean(cell.column.columnDef.fixedRight)),
        [rightCells],
    )

    const leftCells = useMemo(
        () => positionedCells.filter((cell) => cell.column.columnDef.fixedLeft),
        [positionedCells],
    )

    const spaceForCheckmark = !enableMultiRowSelection && !enableRowSelection && singleSelectionRow
    const singleSelection = row.getIsSelected() && spaceForCheckmark
    const hasRowClickHandler = onRowClick instanceof Function

    const centerCellsToRender = indexes.length > 0 ? compact(indexes.map((index) => centerCells[index])) : centerCells

    const renderCell = useCallback(
        (cell: (typeof positionedCells)[number], renderIndex: number) => {
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
                        hasRowClickHandler && 'cursor-pointer',
                        tdClassName,
                        isActionsCell && style['action-cell'],
                        isActionsCell && !shouldStickActionsCell && style['action-cell--not-fixed'],
                        isActionsCell && shouldStickActionsCell && hasFixedRightColumns && style['action-cell--no-shadow'],
                        isActionsCell && shouldStickActionsCell && Boolean(actions) && leftCells.length && style['shadowed'],
                        isActionsCell &&
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
                        (Boolean(singleSelection) || row.isFocused()) && style['single-selection'],
                    )}
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
            getRowClassName,
            hasRowClickHandler,
            hasActionsColumn,
            hasFixedRightColumns,
            leftCells,
            rightCells,
            row,
            shouldStickActionsCell,
            spaceForCheckmark,
            tdClassName,
        ],
    )


    return (
        <Fragment key={row.id}>
            <tr
                aria-selected={row.getIsSelected() || row.isFocused() ? 'true' : 'false'}
                tabIndex={row.isFocused() ? 0 : -1}
                data-index={index}
                data-test={row.id}
                id={row.id}
                className={clsx(style['t-row'], loading && style['is-loading'], getRowClassName?.(row))}
                style={{
                    height: rowHeight ? `${rowHeight}px` : 'inherit',
                    ...(enableDnd && dndStyle),
                }}
                ref={disabledDnd ? undefined : setNodeRef}
                onMouseUp={onMouseUp}
                onMouseDown={(e) => {
                    if (e.detail > 1 && !hasRowClickHandler && textExpandArrow) {
                        e.preventDefault()
                    }
                }}
                onKeyDown={(e) => {
                    switch (e.key) {
                        case 'Tab':
                        case 'ArrowDown':
                            row.focusNextRow()
                            e.preventDefault()
                            break
                        case 'ArrowUp':
                            row.focusPrevRow()
                            e.preventDefault()
                            break
                        case 'Enter':
                            onMouseUpAction(e)
                            break
                    }
                }}
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

                {centerCellsToRender.map((cell, idx) => renderCell(cell, leftCells.length + idx))}

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
