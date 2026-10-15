import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import type { CellContext, Row } from '@tanstack/react-table'
import { StyledPopover as Popover } from 'src/components/utils/popover'
import { StyledMenuList as MenuList } from 'src/components/navigation/menu'
import { DotsVerticalIcon } from 'src/table/shared-components/DotsVerticalIcon'

import { StyledMenuItem } from 'src/table/shared-components/StyledMenuItem'
import { isCustomAction, type IAction, type ICustomAction, type RowActionsState } from 'src/table/types'
import React, { useEffect, useMemo, useRef, useState } from 'react'
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
    const rowActionsLabel = locale === 'no' ? 'Radhandlinger' : 'Row actions'

    const allHidden = useMemo(() => {
        return allActions.every((a) => ('component' in a ? false : a.hide))
    }, [allActions])

    const hasVisibleActions = allActions.length > 0 && !allHidden
    const showNoActions = state.state === 'enabled' && !hasVisibleActions

    const shouldShowButton =
        state.state !== 'hidden' && (hasVisibleActions || showNoActions || state.state === 'disabled')

    const [disabledTooltipOpen, setDisabledTooltipOpen] = useState(false)
    // Only a tooltip opened by touch closes itself: there is no hover to end and no focus to leave.
    const openedByTouchRef = useRef(false)
    const openDisabledTooltip = (byTouch: boolean): void => {
        openedByTouchRef.current = byTouch
        setDisabledTooltipOpen(true)
    }

    useEffect(() => {
        if (!disabledTooltipOpen || !openedByTouchRef.current) return
        const t = window.setTimeout(() => setDisabledTooltipOpen(false), 1600)
        return () => window.clearTimeout(t)
    }, [disabledTooltipOpen])

    if (!shouldShowButton) return <div className='flex w-[40px] items-center justify-center' />

    const disabled = state.state === 'disabled'

    const button = (
        <StyledButton
            dataTest='row-actions-button'
            aria-label={rowActionsLabel}
            aria-haspopup='true'
            aria-expanded={open}
            variant='text'
            size='small'
            /* `aria-disabled`, not native `disabled`: the ⋮ stays in the Tab order so keyboard users
             * reach it and its reason (disabled-states DIS-2, DIS-3). A press only shows the reason. */
            aria-disabled={disabled ? true : undefined}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()

                if (disabled) {
                    openDisabledTooltip(false)
                    return
                }

                // `onMouseDown` preserves table selection, so a pointer click does not natively
                // focus this button. The menu trigger—not its containing row—owns keyboard focus.
                e.currentTarget.focus({ preventScroll: true })
                if (open) {
                    handleClose()
                } else {
                    handleOpen(e)
                }
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
                        onOpen={() => openDisabledTooltip(false)}
                        onClose={() => setDisabledTooltipOpen(false)}
                    >
                        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions --
                            not a control: `{button}` inside is the (aria-disabled, focusable) control. A
                            controlled tooltip turns off its own hover and focus listeners, so this wrapper
                            opens it on hover, on the button's focus (focus events bubble) and on touch, and
                            closes it on leave, blur and Escape. */}
                        <span
                            className='cursor-not-allowed'
                            onMouseEnter={() => openDisabledTooltip(false)}
                            onMouseLeave={() => setDisabledTooltipOpen(false)}
                            onFocus={() => openDisabledTooltip(false)}
                            onBlur={() => setDisabledTooltipOpen(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setDisabledTooltipOpen(false)
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                openDisabledTooltip(true)
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
                        onClose={handleClose}
                        onClick={handleClose}
                        anchorOrigin={{
                            horizontal: 'right',
                            vertical: 'bottom',
                        }}
                        transformOrigin={{
                            horizontal: 'right',
                            vertical: 'top',
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
