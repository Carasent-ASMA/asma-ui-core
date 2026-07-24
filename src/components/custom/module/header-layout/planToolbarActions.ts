import type { ReactElement } from 'react'

export interface DynamicToolbarActionRenderOptions {
    showLabel: boolean
}

export interface DynamicToolbarAction {
    id: string
    label: string
    onClick: () => void
    icon?: ReactElement
    disabled?: boolean
    hidden?: boolean
    variant?: 'contained' | 'outlined' | 'text' | 'textGray' | 'textWhite'
    /** Visual tone. `danger` renders the action in the destructive/red palette. */
    tone?: 'default' | 'danger'
    size?: 'large' | 'small' | 'medium'
    /**
     * Higher priority resists overflow longer — lower-priority actions move
     * into the More menu first. Label collapse is positional (right to left).
     */
    priority?: number
    /** Never move into the More overflow menu. */
    keepVisible?: boolean
    /** Allow label + icon to collapse to icon-only. */
    canHideLabel?: boolean
    /** Allow moving into the More overflow menu. */
    canOverflow?: boolean
    dataTest?: string
    estimatedWidthPx?: number
    ariaLabel?: string
    /** Custom inline renderer for richer actions such as popover triggers. */
    render?: (options: DynamicToolbarActionRenderOptions) => ReactElement
}

export interface PlannedToolbarAction {
    action: DynamicToolbarAction
    showLabel: boolean
    width: number
}

export interface PlannedToolbarActions {
    inlineActions: PlannedToolbarAction[]
    overflowActions: DynamicToolbarAction[]
    showMoreMenu: boolean
}

export const ACTION_GAP_PX = 8
/** Fallback width of the icon-only "More" overflow trigger button. */
export const MORE_BUTTON_PX = 40
const ICON_ONLY_MIN_WIDTH_PX = 40

/**
 * Supplies the real (measured) width of an action. Returning `undefined`
 * falls back to `estimateToolbarActionWidth`.
 */
export type ResolveToolbarActionWidth = (
    action: DynamicToolbarAction,
    showLabel: boolean,
) => number | undefined

/* Width heuristics used until the real rendered widths are measured. */
const ACTION_PADDING_PX = 42
const ACTION_ICON_PX = 22
const ACTION_CHAR_PX = 7
const ACTION_MIN_TEXT_PX = 26
const ICON_ONLY_WIDTH_RATIO = 0.55

export function estimateToolbarActionWidth(action: DynamicToolbarAction, showLabel: boolean): number {
    if (action.estimatedWidthPx) {
        return showLabel
            ? action.estimatedWidthPx
            : Math.max(ICON_ONLY_MIN_WIDTH_PX, Math.floor(action.estimatedWidthPx * ICON_ONLY_WIDTH_RATIO))
    }

    const iconWidth = action.icon ? ACTION_ICON_PX : 0
    const textWidth = showLabel ? Math.max(ACTION_MIN_TEXT_PX, action.label.length * ACTION_CHAR_PX) : 0

    return ACTION_PADDING_PX + iconWidth + textWidth
}

export function resolveToolbarActionWidth(
    action: DynamicToolbarAction,
    showLabel: boolean,
    resolveActionWidth?: ResolveToolbarActionWidth,
): number {
    return resolveActionWidth?.(action, showLabel) ?? estimateToolbarActionWidth(action, showLabel)
}

/** Total strip width: item widths + (N - 1) gaps. */
function plannedStripWidth(planned: PlannedToolbarAction[]): number {
    if (!planned.length) {
        return 0
    }

    return planned.reduce((sum, item) => sum + item.width, 0) + (planned.length - 1) * ACTION_GAP_PX
}

function stripWidthWithMore(
    planned: PlannedToolbarAction[],
    hasOverflow: boolean,
    moreButtonWidthPx: number,
): number {
    const inlineWidth = plannedStripWidth(planned)

    if (!hasOverflow) {
        return inlineWidth
    }

    return inlineWidth + (planned.length ? ACTION_GAP_PX : 0) + moreButtonWidthPx
}

function sortActionsByPriority(actions: DynamicToolbarAction[]): DynamicToolbarAction[] {
    return actions
        .filter((action) => !action.hidden)
        .sort((first, second) => (second.priority ?? 0) - (first.priority ?? 0))
}

function sortOverflowActionsByPriority(actions: DynamicToolbarAction[]): DynamicToolbarAction[] {
    return [...actions].sort((first, second) => (second.priority ?? 0) - (first.priority ?? 0))
}

function collapseLabelsFromLeft(
    planned: PlannedToolbarAction[],
    availableWidth: number,
    resolveActionWidth?: ResolveToolbarActionWidth,
): PlannedToolbarAction[] {
    const next = [...planned]

    for (let index = 0; index < next.length && plannedStripWidth(next) > availableWidth; index += 1) {
        const candidate = next[index]
        if (!candidate || !candidate.showLabel || candidate.action.canHideLabel === false) {
            continue
        }

        next[index] = {
            ...candidate,
            showLabel: false,
            width: resolveToolbarActionWidth(candidate.action, false, resolveActionWidth),
        }
    }

    return next
}

/**
 * Moves lowest-priority overflowable actions into the More menu until the
 * remaining inline strip (including the More trigger itself once anything
 * overflows) fits the available width.
 */
function moveActionsToOverflow(options: {
    planned: PlannedToolbarAction[]
    availableWidth: number
    preOverflow: DynamicToolbarAction[]
    moreButtonWidthPx: number
    /** Bulk strips may push any action into More — see `planBulkToolbarActions`. */
    ignoreKeepVisible?: boolean
}): { inlineActions: PlannedToolbarAction[]; overflowActions: DynamicToolbarAction[] } {
    const { planned, availableWidth, preOverflow, moreButtonWidthPx, ignoreKeepVisible = false } = options

    const inlineActions = [...planned]
    const overflowActions: DynamicToolbarAction[] = []

    /** Lowest-priority overflowable action goes first; ties pick the rightmost. */
    const getOverflowCandidateIndex = () => {
        let candidateIndex = -1
        let lowestPriority = Number.POSITIVE_INFINITY

        for (let index = inlineActions.length - 1; index >= 0; index -= 1) {
            const item = inlineActions[index]
            if (!item || (!ignoreKeepVisible && (item.action.keepVisible || item.action.canOverflow === false))) {
                continue
            }

            const priority = item.action.priority ?? 0
            if (priority < lowestPriority) {
                lowestPriority = priority
                candidateIndex = index
            }
        }

        return candidateIndex
    }

    const hasOverflow = () => preOverflow.length > 0 || overflowActions.length > 0

    while (inlineActions.length && stripWidthWithMore(inlineActions, hasOverflow(), moreButtonWidthPx) > availableWidth) {
        const index = getOverflowCandidateIndex()
        if (index < 0) {
            break
        }

        const [removed] = inlineActions.splice(index, 1)
        if (removed) {
            overflowActions.unshift(removed.action)
        }
    }

    return { inlineActions, overflowActions: sortOverflowActionsByPriority([...preOverflow, ...overflowActions]) }
}

/**
 * A More menu holding a single action wastes as much space as the action
 * itself, so promote a lone overflow action back inline — but only when it
 * actually fits (full label first, icon-only as fallback unless disallowed —
 * bulk actions always keep their labels).
 */
function resolveOverflowPresentation(options: {
    inlineActions: PlannedToolbarAction[]
    overflowActions: DynamicToolbarAction[]
    availableWidth: number
    resolveActionWidth?: ResolveToolbarActionWidth
    allowIconOnlyPromotion?: boolean
}): PlannedToolbarActions {
    const {
        inlineActions,
        overflowActions,
        availableWidth,
        resolveActionWidth,
        allowIconOnlyPromotion = true,
    } = options

    const singleOverflowAction = overflowActions.length === 1 ? overflowActions[0] : undefined

    if (singleOverflowAction) {
        const promote = (showLabel: boolean): PlannedToolbarActions => ({
            inlineActions: [
                ...inlineActions,
                {
                    action: singleOverflowAction,
                    showLabel,
                    width: resolveToolbarActionWidth(singleOverflowAction, showLabel, resolveActionWidth),
                },
            ],
            overflowActions: [],
            showMoreMenu: false,
        })

        const fitsPromoted = (showLabel: boolean) =>
            plannedStripWidth(promote(showLabel).inlineActions) <= availableWidth

        if (fitsPromoted(true)) {
            return promote(true)
        }

        if (allowIconOnlyPromotion && singleOverflowAction.canHideLabel !== false && fitsPromoted(false)) {
            return promote(false)
        }
    }

    return {
        inlineActions,
        overflowActions,
        showMoreMenu: overflowActions.length >= 1,
    }
}

export function planToolbarActions(options: {
    actions: DynamicToolbarAction[]
    availableWidth: number
    maxInlineActions?: number
    collapseLabels?: boolean
    resolveActionWidth?: ResolveToolbarActionWidth
    moreButtonWidthPx?: number
}): PlannedToolbarActions {
    const {
        actions,
        availableWidth,
        maxInlineActions,
        collapseLabels = true,
        resolveActionWidth,
        moreButtonWidthPx = MORE_BUTTON_PX,
    } = options

    const sorted = sortActionsByPriority(actions)
    const cappedByPriority = maxInlineActions ? sorted.slice(0, maxInlineActions) : sorted
    const preOverflow = maxInlineActions ? sorted.slice(maxInlineActions) : []

    const cappedIds = new Set(cappedByPriority.map((action) => action.id))
    const capped = actions.filter((action) => !action.hidden && cappedIds.has(action.id))

    let planned: PlannedToolbarAction[] = capped.map((action) => ({
        action,
        showLabel: true,
        width: resolveToolbarActionWidth(action, true, resolveActionWidth),
    }))

    if (collapseLabels) {
        planned = collapseLabelsFromLeft(planned, availableWidth, resolveActionWidth)
    }

    const { inlineActions, overflowActions } = moveActionsToOverflow({
        planned,
        availableWidth,
        preOverflow,
        moreButtonWidthPx,
    })

    return resolveOverflowPresentation({ inlineActions, overflowActions, availableWidth, resolveActionWidth })
}

/**
 * Bulk actions overflow progressively: every action keeps its full label,
 * and the lowest-priority actions drop into the "More" menu until the
 * remaining inline strip fits the available width.
 */
export function planBulkToolbarActions(options: {
    actions: DynamicToolbarAction[]
    availableWidth: number
    maxVisibleBulkActions?: number
    resolveActionWidth?: ResolveToolbarActionWidth
    moreButtonWidthPx?: number
}): PlannedToolbarActions {
    const {
        actions,
        availableWidth,
        maxVisibleBulkActions = 3,
        resolveActionWidth,
        moreButtonWidthPx = MORE_BUTTON_PX,
    } = options

    const sorted = sortActionsByPriority(actions)

    if (sorted.length === 0) {
        return { inlineActions: [], overflowActions: [], showMoreMenu: false }
    }

    const capped = sorted.slice(0, maxVisibleBulkActions)
    const preOverflow = sorted.slice(maxVisibleBulkActions)

    const planned: PlannedToolbarAction[] = capped.map((action) => ({
        action,
        showLabel: true,
        width: resolveToolbarActionWidth(action, true, resolveActionWidth),
    }))

    const { inlineActions, overflowActions } = moveActionsToOverflow({
        planned,
        availableWidth,
        preOverflow,
        moreButtonWidthPx,
        ignoreKeepVisible: true,
    })

    return {
        inlineActions,
        overflowActions,
        showMoreMenu: overflowActions.length >= 1,
    }
}
