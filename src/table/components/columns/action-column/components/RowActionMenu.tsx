import { useToggleMenuVisibility } from 'src/table/hooks/useToggleMenuVisibility.hook'
import type { CellContext, Row } from '@tanstack/react-table'
import { StyledPopover as Popover } from 'src/components/utils/popover'
import { StyledMenuList as MenuList } from 'src/components/navigation/menu'
import { DotsVerticalIcon } from 'src/table/shared-components/DotsVerticalIcon'

import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { isCustomAction, type IAction, type ICustomAction, type RowActionsState } from 'src/table/types'
import React, { useId, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledTooltip } from 'src/table/shared-components/tooltip'
import { CircleWarningOutlineIcon } from 'src/table/shared-components/CircleWarningOutlineIcon'
import { focusOutsideTable } from 'src/table/helpers/tableTabStops'
import { isKeyboardContextMenu } from 'src/table/helpers/rowActionsMenu'

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
    // Like the selects: Enter/Space on the ⋮ puts focus (and its bar) on the first item; a mouse open
    // leaves focus on the ⋮, and the first arrow key moves it into the menu.
    const [openedByKeyboard, setOpenedByKeyboard] = useState(false)
    const menuId = useId()
    const allActions = actions(tableData.row)
    const state = rowActionsState?.(tableData.row) ?? { state: 'enabled' as const }
    const locale = tableData.table.options.meta?.locale
    const noActionsLabel = locale === 'no' ? 'Ingen handlinger tilgjengelig' : 'No actions available'
    const rowActionsLabel = locale === 'no' ? 'Radhandlinger' : 'Row actions'

    const allHidden = useMemo(() => {
        return allActions.every((a) => ('component' in a ? false : a.hide))
    }, [allActions])

    /**
     * Tab in the open menu leaves the row the way Tab from the row does: out of the table (ASMA-8875). The popover would
     * work its way out from the ⋮'s place in the Tab sequence, and the ⋮ has none: it is reached with the arrow keys.
     * Shift+Tab is the popover's, back to the ⋮.
     */
    const leaveMenuOnTab = (event: KeyboardEvent<HTMLElement>): void => {
        const trigger = anchorEl
        if (event.key !== 'Tab' || event.shiftKey || event.defaultPrevented || !(trigger instanceof HTMLElement)) return
        event.preventDefault()
        if (!focusOutsideTable(trigger, 'next')) trigger.focus()
        handleClose()
    }

    /**
     * The keyboard's `contextmenu` inside this ⋮'s open menu (Windows sends it on the Menu key's keyup, after the keydown
     * opened the menu and moved the focus into it): no browser menu over ours. The menu is portalled, so React brings
     * the event here and the DOM does not; the table handles the one on the row (`rowActionsMenu.ts`).
     */
    const keepKeyboardContextMenuInMenu = (event: MouseEvent<HTMLElement>): void => {
        if (event.currentTarget.contains(event.target as Node) || !isKeyboardContextMenu(event.nativeEvent)) return
        event.preventDefault()
    }

    const hasVisibleActions = allActions.length > 0 && !allHidden
    const showNoActions = state.state === 'enabled' && !hasVisibleActions

    const shouldShowButton =
        state.state !== 'hidden' && (hasVisibleActions || showNoActions || state.state === 'disabled')

    if (!shouldShowButton) return <div className='flex w-[40px] items-center justify-center' />

    const disabled = state.state === 'disabled'

    const button = (
        <StyledButton
            dataTest='row-actions-button'
            // Editor and qnreditor Playwright specs (`testIdAttribute: 'data-test'`) still query the legacy hook.
            data-test='row-actions-button'
            aria-label={rowActionsLabel}
            aria-haspopup='true'
            aria-expanded={open}
            variant='text'
            size='small'
            // Icon-only (`startIcon`, no children): a 32 x 32px button, as Figma's table row "More" (Table cells, Type=More
            // menu). As children the icon took the label's padding, 42px, and its 40px slot clipped the focus ring's sides.
            startIcon={<DotsVerticalIcon className={disabled ? 'text-delta-300' : 'text-delta-700'} width={20} height={20} />}
            // Reached with the arrow keys in its row, not with Tab; the context-menu key opens it (ASMA-8875).
            tabIndex={-1}
            data-table-control=''
            data-row-actions-trigger=''
            /* `aria-disabled`, not native `disabled`: the ⋮ stays focusable, so keyboard users reach it
             * (ArrowRight in its row) and its reason (disabled-states DIS-2, DIS-3). A press only shows the reason. */
            aria-disabled={disabled || undefined}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()

                if (disabled) return

                // `onMouseDown` preserves table selection, so a pointer click does not natively
                // focus this button. The menu trigger—not its containing row—owns keyboard focus.
                e.currentTarget.focus({ preventScroll: true })
                if (open) {
                    handleClose()
                } else {
                    // A click from Enter/Space carries no pointer press count.
                    setOpenedByKeyboard(e.detail === 0)
                    handleOpen(e)
                }
            }}
            onKeyDown={(e) => {
                if (!open || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
                e.preventDefault()
                e.stopPropagation()
                const items = document.getElementById(menuId)?.querySelectorAll<HTMLElement>('[role="menuitem"]')
                if (!items?.length) return
                items[e.key === 'ArrowDown' ? 0 : items.length - 1]?.focus()
            }}
            onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
            }}
            onMouseUp={(e) => {
                e.stopPropagation()
                e.preventDefault()
            }}
        />
    )

    return (
        // Not a control: it only keeps the keyboard's `contextmenu` from this ⋮'s portalled menu from opening the
        // browser's menu over it.
        <div className='flex w-[40px] items-center justify-center' onContextMenu={keepKeyboardContextMenuInMenu}>
            <div className='flex items-center justify-center'>
                {state.state === 'disabled' ? (
                    <StyledTooltip
                        title={state.tooltipTitle}
                        arrow
                        placement={state.tooltipPlacement ?? 'top'}
                        openOnTap
                        persistentDescription
                    >
                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions --
                            not a control: `{button}` is the real, focusable (`aria-disabled`) StyledButton
                            whose reason is reachable by keyboard. This span only keeps the click/touch
                            from reaching the row. */}
                        <span
                            className='cursor-not-allowed'
                            onTouchStart={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
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
                        id={menuId}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        onClick={() => {
                            // An item's click closes the menu; the focus goes back to the ⋮ first (WAI-ARIA menu button),
                            // in this same event. A dialog the action opens remembers what had the focus as it opens, and
                            // returns it there on close: without this it opened after the menu had gone, with the focus on
                            // <body>, so closing it lost the focus. A custom action's click bubbles here too.
                            anchorEl?.focus({ preventScroll: true })
                            handleClose()
                        }}
                        // Same as `StyledMenu`: the arrow keys, not Tab, step from the ⋮ into the menu.
                        tabIntoContent={false}
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
                            <div className='text-delta-700 flex items-center gap-2 p-3 text-base'>
                                <CircleWarningOutlineIcon width={20} height={20} />
                                <span>{noActionsLabel}</span>
                            </div>
                        ) : (
                            <MenuList
                                /* Custom StyledMenuList prop (an imperative `.focus()`, not the native
                                   attribute): WAI-ARIA Menu pattern — opening the ⋮ by keyboard moves focus
                                   onto the first item, so the arrow keys work at once. */
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus={openedByKeyboard}
                                onKeyDown={leaveMenuOnTab}
                            >
                                {allActions.map((action, index) => {
                                    if (isCustomAction(action)) {
                                        const CustomComponent = action.component(tableData.row, handleClose)
                                        return React.isValidElement(CustomComponent) ? (
                                            <React.Fragment key={index}>{CustomComponent}</React.Fragment>
                                        ) : null
                                    }

                                    if (action.hide) return null

                                    if (action.disabled && action.tooltipTitle) {
                                        return (
                                            <StyledMenuItem
                                                key={index}
                                                className={action.className}
                                                disabled
                                                disabledReason={action.tooltipTitle}
                                                reasonPlacement={action.tooltipPlacement ?? 'left'}
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
                                        )
                                    }

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
