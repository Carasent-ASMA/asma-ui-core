import { Fragment, useState } from 'react'
import { StyledButton } from 'src/components/inputs/button'
import { DotsVerticalIcon } from 'src/components/icons'
import { StyledMenu } from 'src/components/navigation/menu/StyledMenu'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { cn } from 'src/helpers/cn'
import type { DynamicToolbarAction, PlannedToolbarActions } from './planToolbarActions'

/** True when the plan renders anything (inline buttons or the More menu). */
export function hasPlannedActions(plan?: PlannedToolbarActions): boolean {
    return plan != null && (plan.inlineActions.length > 0 || plan.showMoreMenu)
}

export function ToolbarActionButton({
    action,
    showLabel,
    selectionTone = false,
}: {
    action: DynamicToolbarAction
    showLabel: boolean
    selectionTone?: boolean
}): JSX.Element {
    if (action.render) {
        return action.render({ showLabel })
    }

    const accessibleLabel = action.ariaLabel ?? action.label

    return (
        <StyledButton
            dataTest={action.dataTest ?? `dynamic-toolbar-action-${action.id}`}
            variant={action.variant ?? (selectionTone ? 'text' : 'outlined')}
            error={action.tone === 'danger'}
            size={action.size ?? 'large'}
            /* An action button runs its own onClick — it must never be the submit button of a
             * surrounding <form>. StyledButton sets no default, so a bare <button> would be
             * `type="submit"`, which fires the form instead (StyledDialogFooter footers commonly
             * sit inside one). */
            type='button'
            disabled={action.disabled}
            startIcon={action.icon}
            onClick={action.onClick}
            /* An explicit ariaLabel always wins (e.g. a badge count appended to the name);
             * otherwise the visible label is the accessible name and needs no duplication. */
            aria-label={showLabel && action.ariaLabel == null ? undefined : accessibleLabel}
        >
            {showLabel ? action.label : undefined}
        </StyledButton>
    )
}

export function MoreTriggerButton({
    overflowMenuLabel,
    onOpen,
}: {
    overflowMenuLabel: string
    onOpen?: (anchor: HTMLElement) => void
}): JSX.Element {
    return (
        <StyledButton
            dataTest='dynamic-toolbar-overflow-actions'
            variant='text'
            size='large'
            /* Opens a menu; never submits a surrounding <form>. */
            type='button'
            endIcon={<DotsVerticalIcon width={20} height={20} />}
            onClick={(event) => onOpen?.(event.currentTarget)}
            aria-label={overflowMenuLabel}
            aria-haspopup='menu'
        >
            {overflowMenuLabel}
        </StyledButton>
    )
}

/** Inline action buttons plus the "More" overflow menu for a planned strip. */
export function ToolbarActionGroup({
    plan,
    overflowMenuLabel,
    className,
    selectionTone = false,
    registerActionWidth,
}: {
    plan: PlannedToolbarActions
    overflowMenuLabel: string
    className?: string
    selectionTone?: boolean
    /**
     * Width-registry hookup for `measureInStrip: false` actions: their single visible
     * mount is measured here, so the planner budgets the real rendered width and the
     * `estimatedWidthPx` only bridges the gap until the first measurement.
     */
    registerActionWidth?: (actionId: string, showLabel: boolean) => (element: HTMLElement | null) => void
}): JSX.Element | null {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const { inlineActions, overflowActions, showMoreMenu } = plan

    if (!inlineActions.length && !showMoreMenu) {
        return null
    }

    return (
        <div className={cn('flex shrink-0 flex-nowrap items-center gap-2', className)}>
            {inlineActions.map(({ action, showLabel }) => {
                const button = (
                    <ToolbarActionButton
                        key={action.id}
                        action={action}
                        showLabel={showLabel}
                        selectionTone={selectionTone}
                    />
                )

                if (registerActionWidth == null || action.measureInStrip !== false) {
                    return button
                }

                return (
                    <span
                        key={action.id}
                        ref={registerActionWidth(action.id, showLabel)}
                        className='inline-flex shrink-0'
                    >
                        {button}
                    </span>
                )
            })}

            {showMoreMenu && (
                <>
                    {/* The trigger toggles: pressing it again closes the menu it opened. `StyledPopover`
                        excludes the anchor from its outside-press handler on purpose, so the press
                        reaches this button with the anchor still set — dismissal is ours to do. */}
                    <MoreTriggerButton
                        overflowMenuLabel={overflowMenuLabel}
                        onOpen={(anchor) => setAnchorEl((current) => (current ? null : anchor))}
                    />

                    <StyledMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {overflowActions.map((action, index) => (
                            <Fragment key={action.id}>
                                {index > 0 && <hr className='m-0 border-0 border-t border-solid border-delta-200' />}

                                <StyledMenuItem
                                    disabled={action.disabled}
                                    onClick={() => {
                                        setAnchorEl(null)
                                        action.onClick()
                                    }}
                                >
                                    <div
                                        className={cn(
                                            'flex items-center gap-2',
                                            action.tone === 'danger' ? 'text-beta-500' : 'text-delta-700',
                                        )}
                                    >
                                        {action.icon}
                                        <span>{action.label}</span>
                                    </div>
                                </StyledMenuItem>
                            </Fragment>
                        ))}
                    </StyledMenu>
                </>
            )}
        </div>
    )
}
