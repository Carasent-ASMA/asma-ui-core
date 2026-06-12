import type { ToolbarSlot } from './ToolbarRows'
import {
    MORE_BUTTON_PX,
    resolveToolbarActionWidth,
    type DynamicToolbarAction,
    type ResolveToolbarActionWidth,
} from './planToolbarActions'

const CLUSTER_GAP_PX = 8
const INLINE_ROW_GAP_PX = 12
const SEARCH_FIELD_PX = 168
const LEADING_UTILITY_PX = 44
const FILTER_WITH_LABEL_PX = 92
const FILTER_ICON_ONLY_PX = 44
const TRAILING_WITH_LABEL_PX = 148
const TRAILING_ICON_ONLY_PX = 44
const SELECTION_INDICATOR_PX = 168
const TITLE_CHAR_PX = 11
const TITLE_MIN_PX = 96
const TITLE_MAX_PX = 360
/** Char-count stand-in for JSX titles, which cannot be measured from text. */
const TITLE_JSX_FALLBACK_CHARS = 12

export type ToolbarLayoutMode = 'compact' | 'stacked' | 'selection-split' | 'inline'

export interface ToolbarLayoutResolution {
    mode: ToolbarLayoutMode
    filterIconOnly: boolean
    trailingIconOnly: boolean
}

/**
 * Real, rendered widths measured by DynamicToolbar. Every field is optional:
 * a missing value falls back to the heuristic estimate, so layout planning
 * works on first render and degrades gracefully.
 */
export interface MeasuredToolbarWidths {
    titleWidthPx?: number
    leadingUtilityWidthPx?: number
    searchWidthPx?: number
    filterLabelWidthPx?: number
    filterIconWidthPx?: number
    trailingLabelWidthPx?: number
    trailingIconWidthPx?: number
    selectionIndicatorWidthPx?: number
    moreButtonWidthPx?: number
    actionWidthPx?: ResolveToolbarActionWidth
}

interface SlotWidths {
    leading: number
    search: number
    selectionIndicator: number
    filter: (iconOnly: boolean) => number
    trailing: (iconOnly: boolean) => number
}

function resolveSlotWidths(measured?: MeasuredToolbarWidths): SlotWidths {
    return {
        leading: measured?.leadingUtilityWidthPx ?? LEADING_UTILITY_PX,
        search: measured?.searchWidthPx ?? SEARCH_FIELD_PX,
        selectionIndicator: measured?.selectionIndicatorWidthPx ?? SELECTION_INDICATOR_PX,
        filter: (iconOnly) =>
            iconOnly
                ? (measured?.filterIconWidthPx ?? FILTER_ICON_ONLY_PX)
                : (measured?.filterLabelWidthPx ?? FILTER_WITH_LABEL_PX),
        trailing: (iconOnly) =>
            iconOnly
                ? (measured?.trailingIconWidthPx ?? TRAILING_ICON_ONLY_PX)
                : (measured?.trailingLabelWidthPx ?? TRAILING_WITH_LABEL_PX),
    }
}

function titleTextLength(title?: ToolbarSlot): number {
    if (!title) {
        return 0
    }

    if (typeof title === 'string') {
        return title.length
    }

    return TITLE_JSX_FALLBACK_CHARS
}

export function estimateTitleAreaWidth(title?: ToolbarSlot): number {
    const length = titleTextLength(title)
    const textWidth = length > 0 ? length * TITLE_CHAR_PX + 24 : 0

    return Math.min(TITLE_MAX_PX, Math.max(TITLE_MIN_PX, textWidth))
}

/**
 * Width reserved for the title area. Prefers the measured natural width
 * (capped — the title is allowed to truncate rather than dominate layout),
 * falling back to the character-count estimate before measurement.
 */
export function resolveTitleAreaWidth(title: ToolbarSlot | undefined, measuredTitleWidthPx?: number): number {
    if (measuredTitleWidthPx != null && measuredTitleWidthPx > 0) {
        return Math.min(TITLE_MAX_PX, measuredTitleWidthPx)
    }

    return estimateTitleAreaWidth(title)
}

export function estimateActionsStripWidth(
    actions: DynamicToolbarAction[],
    showLabel: boolean,
    resolveActionWidth?: ResolveToolbarActionWidth,
): number {
    const visible = actions.filter((action) => !action.hidden)

    if (!visible.length) {
        return 0
    }

    return (
        visible.reduce(
            (sum, action) => sum + resolveToolbarActionWidth(action, showLabel, resolveActionWidth) + CLUSTER_GAP_PX,
            0,
        ) - CLUSTER_GAP_PX
    )
}

/**
 * Bulk zone width as it actually renders: the top-priority actions inline
 * (labels always shown) up to `maxVisibleBulkActions`, plus the More trigger
 * when the remaining actions overflow into the menu.
 */
export function estimateBulkStripWidth(
    bulkActions: DynamicToolbarAction[],
    maxVisibleBulkActions: number,
    resolveActionWidth?: ResolveToolbarActionWidth,
): number {
    const visible = bulkActions
        .filter((action) => !action.hidden)
        .sort((first, second) => (second.priority ?? 0) - (first.priority ?? 0))

    if (!visible.length) {
        return 0
    }

    const inline = visible.slice(0, maxVisibleBulkActions)
    const inlineWidth = estimateActionsStripWidth(inline, true, resolveActionWidth)

    if (visible.length === inline.length) {
        return inlineWidth
    }

    return inlineWidth + (inline.length ? CLUSTER_GAP_PX : 0) + MORE_BUTTON_PX
}

export function resolveReserveBulkActionsWidthPx(
    reserveBulkActionsWidthPx: number,
    bulkActions: DynamicToolbarAction[],
    resolveActionWidth?: ResolveToolbarActionWidth,
    maxVisibleBulkActions = 3,
): number {
    if (reserveBulkActionsWidthPx > 0) {
        return reserveBulkActionsWidthPx
    }

    return estimateBulkStripWidth(bulkActions, maxVisibleBulkActions, resolveActionWidth)
}

export interface EstimateUtilitiesWidthOptions {
    hasLeadingUtility: boolean
    hasFilter: boolean
    hasSearch: boolean
    hasTrailingUtility: boolean
    showPageActions: boolean
    showBulkActions: boolean
    filterIconOnly: boolean
    trailingIconOnly: boolean
    pageActionsWidthPx: number
    bulkActionsWidthPx: number
    /** §4/§7: search before filter on utility row */
    searchBeforeFilter?: boolean
    measured?: MeasuredToolbarWidths
}

export function estimateUtilitiesClusterWidth(options: EstimateUtilitiesWidthOptions): number {
    const {
        hasLeadingUtility,
        hasFilter,
        hasSearch,
        hasTrailingUtility,
        showPageActions,
        showBulkActions,
        filterIconOnly,
        trailingIconOnly,
        pageActionsWidthPx,
        bulkActionsWidthPx,
        searchBeforeFilter = false,
        measured,
    } = options

    const slots = resolveSlotWidths(measured)

    let width = 0

    if (showPageActions && hasLeadingUtility) {
        width += slots.leading + CLUSTER_GAP_PX
    }

    const filterPx = hasFilter ? slots.filter(filterIconOnly) + CLUSTER_GAP_PX : 0
    const searchPx = hasSearch ? slots.search + CLUSTER_GAP_PX : 0

    if (searchBeforeFilter) {
        width += searchPx + filterPx
    } else {
        width += filterPx + searchPx
    }

    if (showPageActions) {
        if (pageActionsWidthPx > 0) {
            width += pageActionsWidthPx + CLUSTER_GAP_PX
        }

        if (hasTrailingUtility) {
            width += slots.trailing(trailingIconOnly) + CLUSTER_GAP_PX
        }
    }

    if (showBulkActions && bulkActionsWidthPx > 0) {
        width += bulkActionsWidthPx + CLUSTER_GAP_PX
    }

    return Math.max(0, width - CLUSTER_GAP_PX)
}

export function resolveToolbarLayout(options: {
    containerWidth: number
    isMobile: boolean
    isSelectionMode: boolean
    compactBreakpointPx: number
    reserveBulkActionsWidthPx: number
    title?: ToolbarSlot
    hasLeadingUtility: boolean
    hasFilter: boolean
    hasSearch: boolean
    hasTrailingUtility: boolean
    pageActions: DynamicToolbarAction[]
    bulkActions: DynamicToolbarAction[]
    maxVisibleBulkActions?: number
    measured?: MeasuredToolbarWidths
}): ToolbarLayoutResolution {
    const {
        containerWidth,
        isMobile,
        isSelectionMode,
        compactBreakpointPx,
        reserveBulkActionsWidthPx,
        title,
        hasLeadingUtility,
        hasFilter,
        hasSearch,
        hasTrailingUtility,
        pageActions,
        bulkActions,
        maxVisibleBulkActions = 2,
        measured,
    } = options

    const width = containerWidth > 0 ? containerWidth : Number.POSITIVE_INFINITY
    const showPageActions = !isSelectionMode
    const showBulkActions = isSelectionMode
    const reservePx = isSelectionMode ? 0 : reserveBulkActionsWidthPx

    const slots = resolveSlotWidths(measured)
    const titleWidth = resolveTitleAreaWidth(title, measured?.titleWidthPx)
    const pageWithLabels = estimateActionsStripWidth(pageActions, true, measured?.actionWidthPx)
    const pageIconOnly = estimateActionsStripWidth(pageActions, false, measured?.actionWidthPx)
    const bulkStripWidth = estimateBulkStripWidth(bulkActions, maxVisibleBulkActions, measured?.actionWidthPx)

    const utilitiesWidth = (variant: {
        filterIconOnly: boolean
        trailingIconOnly: boolean
        pageActionsWidthPx: number
        bulkActionsWidthPx?: number
        searchBeforeFilter?: boolean
    }) =>
        estimateUtilitiesClusterWidth({
            hasLeadingUtility,
            hasFilter,
            hasSearch,
            hasTrailingUtility,
            showPageActions,
            showBulkActions,
            bulkActionsWidthPx: 0,
            measured,
            ...variant,
        })

    if (isMobile || width < compactBreakpointPx) {
        const rowFits = (variant: {
            filterIconOnly: boolean
            trailingIconOnly: boolean
            pageActionsWidthPx: number
        }) => width >= utilitiesWidth({ ...variant, searchBeforeFilter: true })

        const trailingFlag = (iconOnly: boolean) => (isSelectionMode ? true : iconOnly)

        if (rowFits({ filterIconOnly: false, trailingIconOnly: false, pageActionsWidthPx: pageWithLabels })) {
            return { mode: 'compact', filterIconOnly: false, trailingIconOnly: trailingFlag(false) }
        }

        if (rowFits({ filterIconOnly: false, trailingIconOnly: true, pageActionsWidthPx: pageWithLabels })) {
            return { mode: 'compact', filterIconOnly: false, trailingIconOnly: true }
        }

        if (rowFits({ filterIconOnly: false, trailingIconOnly: true, pageActionsWidthPx: pageIconOnly })) {
            return { mode: 'compact', filterIconOnly: false, trailingIconOnly: true }
        }

        return { mode: 'compact', filterIconOnly: true, trailingIconOnly: true }
    }

    if (isSelectionMode) {
        /** Filter + search only — the slots that stay on the title row in §3. */
        const filterSearchWidth = (filterIconOnly: boolean) =>
            estimateUtilitiesClusterWidth({
                hasLeadingUtility: false,
                hasFilter,
                hasSearch,
                hasTrailingUtility: false,
                showPageActions: false,
                showBulkActions: false,
                filterIconOnly,
                trailingIconOnly: true,
                pageActionsWidthPx: 0,
                bulkActionsWidthPx: 0,
                measured,
            })

        const selectionInlineWidth =
            titleWidth +
            slots.selectionIndicator +
            utilitiesWidth({
                filterIconOnly: false,
                trailingIconOnly: true,
                pageActionsWidthPx: 0,
                bulkActionsWidthPx: bulkStripWidth,
            }) +
            INLINE_ROW_GAP_PX

        if (width >= selectionInlineWidth) {
            return { mode: 'inline', filterIconOnly: false, trailingIconOnly: true }
        }

        const splitRowOneWithLabels = titleWidth + filterSearchWidth(false) + INLINE_ROW_GAP_PX
        const splitRowTwoWithLabels = slots.selectionIndicator + bulkStripWidth + INLINE_ROW_GAP_PX
        if (width >= Math.max(splitRowOneWithLabels, splitRowTwoWithLabels)) {
            const filterIconOnlyOnRow = width < titleWidth + filterSearchWidth(true) + INLINE_ROW_GAP_PX
            return { mode: 'selection-split', filterIconOnly: filterIconOnlyOnRow, trailingIconOnly: true }
        }

        return { mode: 'compact', filterIconOnly: true, trailingIconOnly: true }
    }

    const inlineFits = (variant: {
        filterIconOnly: boolean
        trailingIconOnly: boolean
        pageActionsWidthPx: number
    }) => width >= titleWidth + utilitiesWidth(variant) + reservePx + INLINE_ROW_GAP_PX

    const inlineSteps: {
        filterIconOnly: boolean
        trailingIconOnly: boolean
        pageActionsWidthPx: number
    }[] = [
        { filterIconOnly: false, trailingIconOnly: false, pageActionsWidthPx: pageWithLabels },
        { filterIconOnly: false, trailingIconOnly: true, pageActionsWidthPx: pageWithLabels },
        { filterIconOnly: false, trailingIconOnly: true, pageActionsWidthPx: pageIconOnly },
        { filterIconOnly: true, trailingIconOnly: true, pageActionsWidthPx: pageIconOnly },
    ]

    for (const step of inlineSteps) {
        if (inlineFits(step)) {
            return { mode: 'inline', filterIconOnly: step.filterIconOnly, trailingIconOnly: step.trailingIconOnly }
        }
    }

    const utilityRowWithLabels = utilitiesWidth({
        filterIconOnly: false,
        trailingIconOnly: false,
        pageActionsWidthPx: pageWithLabels,
        searchBeforeFilter: true,
    })
    if (width >= utilityRowWithLabels) {
        return { mode: 'stacked', filterIconOnly: false, trailingIconOnly: false }
    }

    const utilityRowIconsOnly = utilitiesWidth({
        filterIconOnly: true,
        trailingIconOnly: true,
        pageActionsWidthPx: pageIconOnly,
        searchBeforeFilter: true,
    })
    if (width >= utilityRowIconsOnly) {
        return { mode: 'stacked', filterIconOnly: true, trailingIconOnly: true }
    }

    return { mode: 'compact', filterIconOnly: true, trailingIconOnly: true }
}

/** Width budget for `planToolbarActions` based on resolved layout. */
export function resolvePageActionsAvailableWidth(options: {
    layoutMode: ToolbarLayoutMode
    containerWidth: number
    titleWidth: number
    filterIconOnly: boolean
    trailingIconOnly: boolean
    hasFilter: boolean
    hasSearch: boolean
    hasLeadingUtility: boolean
    hasTrailingUtility: boolean
    reserveBulkActionsWidthPx: number
    measured?: MeasuredToolbarWidths
}): number {
    const {
        layoutMode,
        containerWidth,
        titleWidth,
        filterIconOnly,
        trailingIconOnly,
        hasFilter,
        hasSearch,
        hasLeadingUtility,
        hasTrailingUtility,
        reserveBulkActionsWidthPx,
        measured,
    } = options

    const slots = resolveSlotWidths(measured)

    const fixedSlots =
        (hasLeadingUtility ? slots.leading + CLUSTER_GAP_PX : 0) +
        (hasFilter ? slots.filter(filterIconOnly) + CLUSTER_GAP_PX : 0) +
        (hasSearch ? slots.search + CLUSTER_GAP_PX : 0) +
        (hasTrailingUtility ? slots.trailing(trailingIconOnly) + CLUSTER_GAP_PX : 0)

    if (layoutMode === 'stacked' || layoutMode === 'compact') {
        return Math.max(80, containerWidth - fixedSlots)
    }

    return Math.max(
        80,
        containerWidth -
            titleWidth -
            fixedSlots -
            INLINE_ROW_GAP_PX -
            reserveBulkActionsWidthPx,
    )
}

export function resolveBulkActionsAvailableWidth(options: {
    layoutMode: ToolbarLayoutMode
    containerWidth: number
    titleWidth: number
    filterIconOnly: boolean
    hasFilter: boolean
    hasSearch: boolean
    measured?: MeasuredToolbarWidths
}): number {
    const { layoutMode, containerWidth, titleWidth, filterIconOnly, hasFilter, hasSearch, measured } = options

    const slots = resolveSlotWidths(measured)

    const persistent =
        (hasFilter ? slots.filter(filterIconOnly) + CLUSTER_GAP_PX : 0) +
        (hasSearch ? slots.search + CLUSTER_GAP_PX : 0)

    if (layoutMode === 'inline') {
        return Math.max(
            120,
            containerWidth - titleWidth - slots.selectionIndicator - persistent - INLINE_ROW_GAP_PX * 2,
        )
    }

    // selection-split & compact: bulk actions own their full-width row (only the
    // selection indicator shares it), so do NOT subtract filter/search widths.
    return Math.max(120, containerWidth - slots.selectionIndicator - INLINE_ROW_GAP_PX)
}
