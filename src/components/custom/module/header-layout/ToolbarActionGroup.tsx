import { useState } from 'react'
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
            disabled={action.disabled}
            startIcon={action.icon}
            onClick={action.onClick}
            aria-label={showLabel ? undefined : accessibleLabel}
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
}: {
    plan: PlannedToolbarActions
    overflowMenuLabel: string
    className?: string
    selectionTone?: boolean
}): JSX.Element | null {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const { inlineActions, overflowActions, showMoreMenu } = plan

    if (!inlineActions.length && !showMoreMenu) {
        return null
    }

    return (
        <div className={cn('flex shrink-0 flex-nowrap items-center gap-2', className)}>
            {inlineActions.map(({ action, showLabel }) => (
                <ToolbarActionButton
                    key={action.id}
                    action={action}
                    showLabel={showLabel}
                    selectionTone={selectionTone}
                />
            ))}

            {showMoreMenu && (
                <>
                    <MoreTriggerButton
                        overflowMenuLabel={overflowMenuLabel}
                        onOpen={setAnchorEl}
                    />

                    <StyledMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {overflowActions.map((action) => (
                            <StyledMenuItem
                                key={action.id}
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
                        ))}
                    </StyledMenu>
                </>
            )}
        </div>
    )
}
