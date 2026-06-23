import { useCallback, useMemo, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { useElementWidthPx } from 'src/hooks/useElementWidthPx'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { useWidthRegistry } from 'src/hooks/useWidthRegistry'
import {
    planBulkToolbarActions,
    planToolbarActions,
    type DynamicToolbarAction,
    type PlannedToolbarActions,
    type ResolveToolbarActionWidth,
} from './planToolbarActions'
import { DynamicToolbarLayoutContext } from './DynamicToolbarLayoutContext'
import {
    resolveBulkActionsAvailableWidth,
    resolvePageActionsAvailableWidth,
    resolveReserveBulkActionsWidthPx,
    resolveTitleAreaWidth,
    resolveToolbarLayout,
    type MeasuredToolbarWidths,
    type ToolbarLayoutMode,
} from './estimateToolbarLayout'
import {
    actionKey,
    filterKey,
    KEY_MORE_BUTTON,
    KEY_SEARCH,
    KEY_SELECTION_INDICATOR,
    KEY_TITLE,
    ToolbarMeasurementStrip,
} from './ToolbarMeasurement'
import {
    SearchSlot,
    SelectionIndicator,
    SelectionRow,
    TitleBlock,
    TitleText,
    UtilityCluster,
    type ToolbarSlot,
} from './ToolbarRows'
import { useToolbarTranslations, type ToolbarLocale } from './useTranslations'

export type { DynamicToolbarAction } from './planToolbarActions'
export type { ToolbarSlot } from './ToolbarRows'
export type { ToolbarLocale } from './useTranslations'
export { useDynamicToolbarLayout } from './DynamicToolbarLayoutContext'

export interface DynamicToolbarProps {
    title?: ToolbarSlot
    helperText?: ToolbarSlot
    beforeFilterActions?: DynamicToolbarAction[]
    filter?: ToolbarSlot
    search?: ToolbarSlot
    afterSearchActions?: DynamicToolbarAction[]
    selectedCount?: number
    onClearSelection?: () => void
    bulkActions?: DynamicToolbarAction[]
    maxVisibleBulkActions?: number
    locale?: ToolbarLocale
    className?: string
    style?: CSSProperties
    dataTest?: string
}

const DEFAULT_COMPACT_BREAKPOINT_PX = 744
const DEFAULT_RESERVE_BULK_ACTIONS_WIDTH_PX = 0
const DEFAULT_MAX_VISIBLE_BULK_ACTIONS = 2

/** Responsive breakpoints for bulk actions visibility based on container width */
const BULK_ACTIONS_BREAKPOINTS = [
    { minWidth: 361, maxVisible: 2 },
    { minWidth: 256, maxVisible: 1 },
    { minWidth: 0, maxVisible: 0 },
] as const

function getResponsiveMaxVisibleBulkActions(containerWidth: number, maxAllowed: number): number {
    const config = BULK_ACTIONS_BREAKPOINTS.find((bp) => containerWidth >= bp.minWidth)

    return Math.min(config?.maxVisible ?? 0, maxAllowed)
}

const EMPTY_ACTIONS_PLAN: PlannedToolbarActions = {
    inlineActions: [],
    overflowActions: [],
    showMoreMenu: false,
}

export function DynamicToolbar(props: DynamicToolbarProps): ReactElement {
    const {
        title,
        helperText,
        beforeFilterActions = [],
        filter,
        search,
        afterSearchActions = [],
        selectedCount = 0,
        onClearSelection,
        bulkActions = [],
        maxVisibleBulkActions = DEFAULT_MAX_VISIBLE_BULK_ACTIONS,
        locale = 'en',
        className,
        style,
        dataTest = 'dynamic-toolbar',
    } = props

    const t = useToolbarTranslations(locale)

    const { ref: containerRef, widthPx: containerWidth } = useElementWidthPx<HTMLDivElement>()
    const { register, widths } = useWidthRegistry()
    const isMobile = useMobileMediaQuery()

    const compactMaxVisibleBulkActions = useMemo(
        () => getResponsiveMaxVisibleBulkActions(containerWidth, maxVisibleBulkActions),
        [containerWidth, maxVisibleBulkActions],
    )

    const reserveMaxVisibleBulkActions =
        !isMobile && containerWidth >= DEFAULT_COMPACT_BREAKPOINT_PX
            ? maxVisibleBulkActions
            : compactMaxVisibleBulkActions

    const isSelectionMode = selectedCount > 0
    const showPageActions = !isSelectionMode

    const pageActions = useMemo(
        () => [...beforeFilterActions, ...afterSearchActions],
        [beforeFilterActions, afterSearchActions],
    )

    const resolveActionWidth: ResolveToolbarActionWidth = useCallback(
        (action, showLabel) => widths[actionKey(action.id, showLabel)],
        [widths],
    )

    const measured = useMemo((): MeasuredToolbarWidths => ({
        titleWidthPx: widths[KEY_TITLE],
        searchWidthPx: widths[KEY_SEARCH],
        filterLabelWidthPx: widths[filterKey(false)],
        filterIconWidthPx: widths[filterKey(true)],
        selectionIndicatorWidthPx: widths[KEY_SELECTION_INDICATOR],
        moreButtonWidthPx: widths[KEY_MORE_BUTTON],
        actionWidthPx: resolveActionWidth,
    }), [widths, resolveActionWidth])

    const effectiveReserveBulkPx = useMemo(
        () =>
            resolveReserveBulkActionsWidthPx(
                DEFAULT_RESERVE_BULK_ACTIONS_WIDTH_PX,
                bulkActions,
                resolveActionWidth,
                reserveMaxVisibleBulkActions,
            ),
        [bulkActions, resolveActionWidth, reserveMaxVisibleBulkActions],
    )

    const layoutResolution = useMemo(
        () =>
            resolveToolbarLayout({
                containerWidth,
                isMobile,
                isSelectionMode,
                compactBreakpointPx: DEFAULT_COMPACT_BREAKPOINT_PX,
                reserveBulkActionsWidthPx: effectiveReserveBulkPx,
                title,
                hasLeadingUtility: false,
                hasFilter: filter != null,
                hasSearch: search != null,
                hasTrailingUtility: false,
                pageActions,
                bulkActions,
                maxVisibleBulkActions: reserveMaxVisibleBulkActions,
                measured,
            }),
        [
            bulkActions,
            containerWidth,
            effectiveReserveBulkPx,
            filter,
            isMobile,
            isSelectionMode,
            reserveMaxVisibleBulkActions,
            measured,
            pageActions,
            search,
            title,
        ],
    )

    const { mode: layoutMode, filterIconOnly, trailingIconOnly } = layoutResolution

    const layoutContextValue = useMemo(
        () => ({
            containerWidth,
            filterIconOnly,
            trailingIconOnly,
        }),
        [containerWidth, filterIconOnly, trailingIconOnly],
    )

    const titleWidth = resolveTitleAreaWidth(title, measured.titleWidthPx)

    const pageActionsAvailableWidth = resolvePageActionsAvailableWidth({
        layoutMode,
        containerWidth,
        titleWidth,
        filterIconOnly,
        trailingIconOnly,
        hasFilter: filter != null,
        hasSearch: search != null,
        hasLeadingUtility: false,
        hasTrailingUtility: false,
        reserveBulkActionsWidthPx: isSelectionMode ? 0 : effectiveReserveBulkPx,
        measured,
    })

    const bulkActionsAvailableWidth = resolveBulkActionsAvailableWidth({
        layoutMode,
        containerWidth,
        titleWidth,
        filterIconOnly,
        hasFilter: filter != null,
        hasSearch: search != null,
        measured,
    })

    const pageActionsPlan = useMemo(
        () =>
            planToolbarActions({
                actions: pageActions,
                availableWidth: pageActionsAvailableWidth,
                collapseLabels: true,
                resolveActionWidth,
                moreButtonWidthPx: measured.moreButtonWidthPx,
            }),
        [pageActions, pageActionsAvailableWidth, resolveActionWidth, measured.moreButtonWidthPx],
    )

    const beforeFilterActionIds = useMemo(
        () => new Set(beforeFilterActions.map((action) => action.id)),
        [beforeFilterActions],
    )

    const beforeFilterActionsPlan = useMemo<PlannedToolbarActions>(() => {
        const inlineActions = pageActionsPlan.inlineActions.filter((item) => beforeFilterActionIds.has(item.action.id))

        return inlineActions.length ? { inlineActions, overflowActions: [], showMoreMenu: false } : EMPTY_ACTIONS_PLAN
    }, [beforeFilterActionIds, pageActionsPlan])

    const afterSearchActionsPlan = useMemo<PlannedToolbarActions>(() => {
        const inlineActions = pageActionsPlan.inlineActions.filter((item) => !beforeFilterActionIds.has(item.action.id))

        if (!inlineActions.length && !pageActionsPlan.showMoreMenu) {
            return EMPTY_ACTIONS_PLAN
        }

        return {
            inlineActions,
            overflowActions: pageActionsPlan.overflowActions,
            showMoreMenu: pageActionsPlan.showMoreMenu,
        }
    }, [beforeFilterActionIds, pageActionsPlan])

    const bulkActionsPlan = useMemo(
        () =>
            planBulkToolbarActions({
                actions: bulkActions,
                availableWidth: bulkActionsAvailableWidth,
                maxVisibleBulkActions:
                    layoutMode === 'compact' ? compactMaxVisibleBulkActions : maxVisibleBulkActions,
                resolveActionWidth,
                moreButtonWidthPx: measured.moreButtonWidthPx,
            }),
        [
            bulkActions,
            bulkActionsAvailableWidth,
            compactMaxVisibleBulkActions,
            layoutMode,
            maxVisibleBulkActions,
            resolveActionWidth,
            measured.moreButtonWidthPx,
        ],
    )

    const measurableActions = useMemo(() => {
        const byId = new Map<string, DynamicToolbarAction>()
        for (const action of [...pageActions, ...bulkActions]) {
            if (!action.hidden && !byId.has(action.id)) {
                byId.set(action.id, action)
            }
        }

        return [...byId.values()]
    }, [pageActions, bulkActions])

    const titleMeasureRef = register(KEY_TITLE, 'scroll')
    const searchMeasureRef = register(KEY_SEARCH)

    const filterSlot = filter != null ? (
        <span ref={register(filterKey(filterIconOnly))} className='inline-flex shrink-0 items-center'>
            {filter}
        </span>
    ) : undefined

    const measurementStrip = (
        <ToolbarMeasurementStrip
            actions={measurableActions}
            register={register}
            overflowMenuLabel={t.more}
            selectionIndicator={
                isSelectionMode
                    ? {
                          selectedCount,
                          hasClear: onClearSelection != null,
                          translations: t,
                      }
                    : undefined
            }
        />
    )

    const selectionRow = (
        <SelectionRow
            selectedCount={selectedCount}
            onClearSelection={onClearSelection}
            translations={t}
            bulkActionsPlan={bulkActionsPlan}
        />
    )

    const toolbarShell = (content: ReactNode, layout: ToolbarLayoutMode): ReactElement => (
        <DynamicToolbarLayoutContext.Provider value={layoutContextValue}>
            <div
                ref={containerRef}
                data-testid={dataTest}
                data-layout={layout}
                data-filter-icon-only={filterIconOnly ? 'true' : 'false'}
                data-trailing-icon-only={trailingIconOnly ? 'true' : 'false'}
                className={cn('relative flex w-full flex-col gap-2', className)}
                style={style}
            >
                {measurementStrip}
                {content}
            </div>
        </DynamicToolbarLayoutContext.Provider>
    )

    if (layoutMode === 'compact' || layoutMode === 'stacked') {
        return toolbarShell(
            <>
                <TitleBlock title={title} helperText={helperText} titleMeasureRef={titleMeasureRef} />
                <UtilityCluster
                    variant='utility-row'
                    beforeFilterActionsPlan={beforeFilterActionsPlan}
                    filter={filterSlot}
                    search={search}
                    afterSearchActionsPlan={afterSearchActionsPlan}
                    showPageActions={showPageActions}
                    overflowMenuLabel={t.more}
                    align={layoutMode === 'compact' ? 'start' : 'end'}
                />
                {isSelectionMode && selectionRow}
            </>,
            layoutMode,
        )
    }

    if (layoutMode === 'selection-split') {
        return toolbarShell(
            <>
                <div className='flex w-full min-w-0 flex-nowrap items-center justify-between gap-3'>
                    <div className='min-w-0 flex-1 overflow-hidden'>
                        <TitleBlock title={title} helperText={helperText} titleMeasureRef={titleMeasureRef} />
                    </div>
                    <div className='flex shrink-0 flex-nowrap items-center gap-2'>
                        {filterSlot}
                        {search != null && <SearchSlot search={search} measureRef={searchMeasureRef} />}
                    </div>
                </div>
                {selectionRow}
            </>,
            'selection-split',
        )
    }

    return toolbarShell(
        <div className='flex w-full min-w-0 flex-col gap-1'>
            <div className='flex w-full min-w-0 flex-nowrap items-center gap-3'>
                <div className='flex min-w-0 flex-1 items-center gap-3'>
                    {title && <TitleText title={title} measureRef={titleMeasureRef} />}
                    {isSelectionMode && (
                        <SelectionIndicator
                            selectedCount={selectedCount}
                            onClearSelection={onClearSelection}
                            translations={t}
                        />
                    )}
                </div>
                <div className='min-w-0 shrink-0'>
                    <UtilityCluster
                        variant={isSelectionMode ? 'inline-selection' : 'inline-normal'}
                        beforeFilterActionsPlan={beforeFilterActionsPlan}
                        filter={filterSlot}
                        search={search}
                        afterSearchActionsPlan={afterSearchActionsPlan}
                        bulkActionsPlan={bulkActionsPlan}
                        showPageActions={showPageActions}
                        overflowMenuLabel={t.more}
                        searchMeasureRef={searchMeasureRef}
                    />
                </div>
            </div>
            {helperText && <div className='text-sm text-delta-700'>{helperText}</div>}
        </div>,
        'inline',
    )
}
