import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import type { CellContext, Row } from '@tanstack/react-table'
import { StyledPopover as Popover } from 'src/components/utils/popover'
import { StyledMenuList as MenuList } from 'src/components/navigation/menu'
import { DotsVerticalIcon } from 'src/table/shared-components/DotsVerticalIcon'

import { StyledMenuItem } from 'src/table/shared-components/StyledMenuItem'
import { isCustomAction, type IAction, type ICustomAction, type RowActionsState } from 'src/table/types'
import React, { useEffect, useMemo, useState } from 'react'
import { StyledButton } from 'src/table/shared-components/button'
import { StyledTooltip } from 'src/table/shared-components/tooltip'
import { CircleWarningOutlineIcon } from 'src/table/shared-components/CircleWarningOutlineIcon'

export function RowActionMenu<TData>({
    tableData,
    actions,
    rowActionsState,
}: {
    tableData: CellContext<TData, unknown>
    actions: (row: Row<TData>) => (IAction<TData> | ICustomAction<TData>)[]
    rowActionsState?: (row: Row<TData>) => RowActionsState | undefined
}): JSX.Element {
    const { anchorEl, open, handleClose, handleOpen } = useToggleMenuVisibility()
    const allActions = actions(tableData.row)
    const state = rowActionsState?.(tableData.row) ?? { state: 'enabled' as const }
    const locale = tableData.table.options.meta?.locale
    const noActionsLabel = locale === 'no' ? 'Ingen handlinger tilgjengelig' : 'No actions available'

    const allHidden = useMemo(() => {
        return allActions.every((a) => ('component' in a ? false : a.hide))
    }, [allActions])

    const hasVisibleActions = allActions.length > 0 && !allHidden
    const showNoActions = state.state === 'enabled' && !hasVisibleActions

    const shouldShowButton =
        state.state !== 'hidden' && (hasVisibleActions || showNoActions || state.state === 'disabled')

    const [disabledTooltipOpen, setDisabledTooltipOpen] = useState(false)

    useEffect(() => {
        if (!disabledTooltipOpen) return
        const t = window.setTimeout(() => setDisabledTooltipOpen(false), 1600)
        return () => window.clearTimeout(t)
    }, [disabledTooltipOpen])

    if (!shouldShowButton) return <div className='flex w-[40px] items-center justify-center' />

    const disabled = state.state === 'disabled'

    const button = (
        <StyledButton
            dataTest=''
            variant='text'
            size='small'
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()

                if (disabled) return

                handleOpen(e)
                tableData.row.onChangeFocused(true)
            }}
            onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
            }}
            onMouseUp={(e) => {
                e.stopPropagation()
                e.preventDefault()
            }}
        >
            <DotsVerticalIcon className={disabled ? 'text-delta-300' : 'text-delta-700'} width={20} height={20} />
        </StyledButton>
    )

    return (
        <div className='flex w-[40px] items-center justify-center'>
            <div className='flex items-center justify-center'>
                {state.state === 'disabled' ? (
                    <StyledTooltip
                        title={state.tooltipTitle}
                        arrow
                        placement={state.tooltipPlacement ?? 'top'}
                        open={disabledTooltipOpen}
                        onOpen={() => setDisabledTooltipOpen(true)}
                        onClose={() => setDisabledTooltipOpen(false)}
                    >
                        <span
                            className='cursor-not-allowed'
                            onTouchStart={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                setDisabledTooltipOpen(true)
                            }}
                            onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                            }}
                        >
                            {button}
                        </span>
                    </StyledTooltip>
                ) : (
                    button
                )}
                {state.state === 'enabled' && (
                    <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={() => {
                            handleClose()
                            tableData.row.onChangeFocused(false)
                        }}
                        onClick={() => {
                            handleClose()
                            tableData.row.onChangeFocused(false)
                        }}
                        anchorOrigin={{
                            horizontal: 'center',
                            vertical: 'bottom',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        {showNoActions ? (
                            <div className='flex items-center gap-2 p-3 text-base text-delta-700'>
                                <CircleWarningOutlineIcon width={20} height={20} />
                                <span>{noActionsLabel}</span>
                            </div>
                        ) : (
                            <MenuList disablePadding>
                                {allActions.map((action, index) => {
                                    if (isCustomAction(action)) {
                                        const CustomComponent = action.component(tableData.row, handleClose)
                                        return React.isValidElement(CustomComponent) ? (
                                            <React.Fragment key={index}>{CustomComponent}</React.Fragment>
                                        ) : null
                                    }

                                    if (action.hide) return null

                                    return (
                                        <StyledTooltip
                                            key={index}
                                            title={action?.tooltipTitle}
                                            arrow
                                            placement={action?.tooltipPlacement ?? 'left'}
                                        >
                                            <span>
                                                <StyledMenuItem
                                                    className={action.className}
                                                    disabled={action.disabled}
                                                    onClick={() => {
                                                        if (action.disabled) return
                                                        action.onClick?.(tableData.row)
                                                    }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                    }}
                                                    onMouseUp={(e) => {
                                                        e.stopPropagation()
                                                        e.preventDefault()
                                                    }}
                                                >
                                                    {action.label}
                                                </StyledMenuItem>
                                            </span>
                                        </StyledTooltip>
                                    )
                                })}
                            </MenuList>
                        )}
                    </Popover>
                )}
            </div>
        </div>
    )
}
