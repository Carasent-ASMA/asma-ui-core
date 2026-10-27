import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { StyledButton } from 'src/components/inputs/button'
import { CloseIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { StyledWidgetTitle } from '../../widget/widget-title/StyledWidgetTitle'
import type { PlannedToolbarActions } from './planToolbarActions'
import { hasPlannedActions, ToolbarActionGroup } from './ToolbarActionGroup'
import { formatSelectionLabel, type ToolbarTranslations } from './useTranslations'

/**
 * Slot for toolbar content: JSX widgets or plain text titles.
 *
 * Slot components that support collapsing their label to icon-only should read
 * `useDynamicToolbarLayout()` (`filterIconOnly` / `trailingIconOnly`) — the
 * toolbar never mutates slot elements.
 */
export type ToolbarSlot = ReactElement | string

/** Callback ref used to track a slot's rendered width. */
export type MeasureRef = (element: HTMLElement | null) => void

export type UtilityRowVariant = 'inline-normal' | 'inline-selection' | 'utility-row'

export function SelectionIndicator({
    selectedCount,
    onClearSelection,
    translations,
}: {
    selectedCount: number
    onClearSelection?: () => void
    translations: ToolbarTranslations
}): JSX.Element {
    return (
        <div
            className='flex shrink-0 items-center whitespace-nowrap'
            aria-live='polite'
            aria-atomic='true'
        >
            <StyledButton
                dataTest='dynamic-toolbar-clear-selection'
                variant='text'
                className='!min-w-0 !px-1 !font-semibold'
                startIcon={onClearSelection ? <CloseIcon width={20} height={20} /> : undefined}
                onClick={onClearSelection}
                aria-label={translations.clearSelection}
            >
                {formatSelectionLabel(selectedCount, translations)}
            </StyledButton>
        </div>
    )
}

export function SelectionRow({
    selectedCount,
    onClearSelection,
    translations,
    bulkActionsPlan,
}: {
    selectedCount: number
    onClearSelection?: () => void
    translations: ToolbarTranslations
    bulkActionsPlan: PlannedToolbarActions
}): JSX.Element {
    return (
        <div className='flex w-full min-w-0 flex-nowrap items-center justify-between gap-3 max-xs:flex-wrap max-xs:gap-y-2'>
            <SelectionIndicator
                selectedCount={selectedCount}
                onClearSelection={onClearSelection}
                translations={translations}
            />
            <ToolbarActionGroup
                plan={bulkActionsPlan}
                overflowMenuLabel={translations.more}
                inProgressLabel={translations.inProgress}
                selectionTone
            />
        </div>
    )
}

export function SearchSlot({
    search,
    expanded,
    measureRef,
}: {
    search: ToolbarSlot
    expanded?: boolean
    measureRef?: MeasureRef
}): JSX.Element {
    return (
        <div
            ref={expanded ? undefined : measureRef}
            style={expanded ? ({ '--dynamic-toolbar-search-width': '100%' } as CSSProperties) : undefined}
            className={cn(
                expanded
                    ? // Utility row only: narrower than a phone the search takes its own line.
                      'min-w-0 flex-1 max-xs:basis-full'
                    : 'w-40 shrink-0',
            )}
        >
            {search}
        </div>
    )
}

/** Keeps children mounted while hidden so slots fade instead of popping. */
export function FadeSlot({
    visible,
    flattenBelowXs = false,
    children,
}: {
    visible: boolean
    /** Below xs, drops both wrappers so each child wraps as its own item of the parent row. */
    flattenBelowXs?: boolean
    children: ReactNode
}): JSX.Element {
    return (
        <div
            className={cn(
                'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out',
                visible ? 'max-w-[2000px] opacity-100' : 'pointer-events-none max-w-0 opacity-0',
                flattenBelowXs && 'max-xs:contents',
            )}
            aria-hidden={!visible}
        >
            <div className={cn('inline-flex items-center gap-2', flattenBelowXs && 'max-xs:contents')}>{children}</div>
        </div>
    )
}

export function TitleText({ title, measureRef }: { title: ToolbarSlot; measureRef?: MeasureRef }): JSX.Element {
    /* `measureRef` reads scrollWidth, so the natural title width is known even
     * while the rendered title is truncated. */
    if (typeof title === 'string') {
        return (
            <StyledWidgetTitle
                ref={measureRef}
                className={cn(
                    '!min-w-0 truncate',
                    'max-xs:hyphens-auto max-xs:whitespace-normal max-xs:![overflow-wrap:anywhere]',
                )}
            >
                {title}
            </StyledWidgetTitle>
        )
    }

    return (
        <div
            ref={measureRef}
            className={cn(
                'min-w-0 truncate',
                'max-xs:hyphens-auto max-xs:whitespace-normal max-xs:![overflow-wrap:anywhere]',
            )}
        >
            {title}
        </div>
    )
}

export function TitleBlock({
    title,
    helperText,
    titleMeasureRef,
}: {
    title?: ToolbarSlot
    helperText?: ToolbarSlot
    titleMeasureRef?: MeasureRef
}): JSX.Element | null {
    if (!title && !helperText) {
        return null
    }

    return (
        <div className='min-w-0 max-w-full'>
            {title && <TitleText title={title} measureRef={titleMeasureRef} />}
            {helperText && <div className='mt-1 text-sm text-delta-700'>{helperText}</div>}
        </div>
    )
}

/**
 * Utility cluster — fixed internal order per variant (flex-nowrap).
 * - inline-normal: before-filter actions → filter → search → after-search actions
 * - inline-selection: bulk → filter → search
 * - utility-row (§4/§7): before-filter actions → search (flex) → filter → after-search actions
 *
 * Bulk actions render only in the `inline-selection` variant; the other
 * variants pair with a separate {@link SelectionRow} when selection is active.
 */
export function UtilityCluster({
    variant,
    beforeFilterActionsPlan,
    filter,
    search,
    afterSearchActionsPlan,
    bulkActionsPlan,
    showPageActions,
    overflowMenuLabel,
    inProgressLabel,
    searchMeasureRef,
    align = 'end',
}: {
    variant: UtilityRowVariant
    beforeFilterActionsPlan: PlannedToolbarActions
    filter?: ReactNode
    search?: ToolbarSlot
    afterSearchActionsPlan: PlannedToolbarActions
    bulkActionsPlan?: PlannedToolbarActions
    showPageActions: boolean
    overflowMenuLabel: string
    inProgressLabel?: string
    searchMeasureRef?: MeasureRef
    align?: 'start' | 'end'
}): JSX.Element | null {
    const hasBeforeFilterActions = showPageActions && hasPlannedActions(beforeFilterActionsPlan)
    const hasAfterSearchActions = showPageActions && hasPlannedActions(afterSearchActionsPlan)
    const hasBulkActions = variant === 'inline-selection' && hasPlannedActions(bulkActionsPlan)
    const hasFilterOrSearch = filter != null || search != null
    /* Narrower than a phone, the utility row wraps button by button: the action groups give up their
     * nowrap wrappers, so an action that fits stays next to the filter and the next one wraps. */
    const flattenBelowXs = variant === 'utility-row'
    const actionGroupClassName = flattenBelowXs ? 'max-xs:contents' : undefined

    if (!hasFilterOrSearch && !hasBeforeFilterActions && !hasAfterSearchActions && !hasBulkActions) {
        return null
    }

    const beforeFilterBlock = hasBeforeFilterActions ? (
        <FadeSlot visible={hasBeforeFilterActions} flattenBelowXs={flattenBelowXs}>
            <ToolbarActionGroup
                plan={beforeFilterActionsPlan}
                className={actionGroupClassName}
                overflowMenuLabel={overflowMenuLabel}
                inProgressLabel={inProgressLabel}
            />
        </FadeSlot>
    ) : null

    const afterSearchBlock = hasAfterSearchActions ? (
        <FadeSlot visible={hasAfterSearchActions} flattenBelowXs={flattenBelowXs}>
            <div className={cn('flex flex-nowrap items-center gap-2', actionGroupClassName)}>
                <ToolbarActionGroup
                    plan={afterSearchActionsPlan}
                    className={actionGroupClassName}
                    overflowMenuLabel={overflowMenuLabel}
                    inProgressLabel={inProgressLabel}
                />
            </div>
        </FadeSlot>
    ) : null

    const filterSearchInline = (
        <>
            {filter}
            {search != null && <SearchSlot search={search} measureRef={searchMeasureRef} />}
        </>
    )

    return (
        <div
            className={cn(
                'flex w-full min-w-0 flex-nowrap items-center gap-2',
                align === 'end' ? 'justify-end' : 'justify-start',
                // Narrower than a phone: search, filter and actions wrap, the search on its own line.
                variant === 'utility-row' && 'max-xs:flex-wrap',
            )}
        >
            {variant === 'inline-selection' && (
                <>
                    {hasBulkActions && bulkActionsPlan && (
                        <ToolbarActionGroup
                            plan={bulkActionsPlan}
                            overflowMenuLabel={overflowMenuLabel}
                            inProgressLabel={inProgressLabel}
                            selectionTone
                        />
                    )}
                    {filterSearchInline}
                </>
            )}

            {variant === 'inline-normal' && (
                <>
                    {beforeFilterBlock}
                    {filterSearchInline}
                    {afterSearchBlock}
                </>
            )}

            {variant === 'utility-row' && (
                <>
                    {beforeFilterBlock}
                    {search != null && <SearchSlot search={search} expanded />}
                    {filter}
                    {afterSearchBlock}
                </>
            )}
        </div>
    )
}
