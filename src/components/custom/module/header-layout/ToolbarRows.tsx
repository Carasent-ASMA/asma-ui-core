import type { ReactElement, ReactNode } from 'react'
import { StyledButton } from 'src/components/inputs/button'
import { CloseIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
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
                size='small'
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
        <div className='flex w-full min-w-0 flex-nowrap items-center justify-between gap-3'>
            <SelectionIndicator
                selectedCount={selectedCount}
                onClearSelection={onClearSelection}
                translations={translations}
            />
            <ToolbarActionGroup
                plan={bulkActionsPlan}
                overflowMenuLabel={translations.more}
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
            className={cn(
                '[&_.MuiFormControl-root]:w-full',
                expanded
                    ? 'min-w-0 flex-1 [&_.MuiFormControl-root]:max-w-none'
                    : 'w-[min(240px,40vw)] max-w-[280px] shrink-0',
            )}
        >
            {search}
        </div>
    )
}

/** Keeps children mounted while hidden so slots fade instead of popping. */
export function FadeSlot({ visible, children }: { visible: boolean; children: ReactNode }): JSX.Element {
    return (
        <div
            className={cn(
                'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out',
                visible ? 'max-w-[2000px] opacity-100' : 'pointer-events-none max-w-0 opacity-0',
            )}
            aria-hidden={!visible}
        >
            <div className='inline-flex items-center gap-2'>{children}</div>
        </div>
    )
}

export function TitleText({ title, measureRef }: { title: ToolbarSlot; measureRef?: MeasureRef }): JSX.Element {
    /* `measureRef` reads scrollWidth, so the natural title width is known even
     * while the rendered title is truncated. */
    return (
        <div ref={measureRef} className='min-w-0 truncate text-2xl font-semibold text-delta-800'>
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
    searchMeasureRef?: MeasureRef
    align?: 'start' | 'end'
}): JSX.Element | null {
    const hasBeforeFilterActions = showPageActions && hasPlannedActions(beforeFilterActionsPlan)
    const hasAfterSearchActions = showPageActions && hasPlannedActions(afterSearchActionsPlan)
    const hasBulkActions = variant === 'inline-selection' && hasPlannedActions(bulkActionsPlan)
    const hasFilterOrSearch = filter != null || search != null

    if (!hasFilterOrSearch && !hasBeforeFilterActions && !hasAfterSearchActions && !hasBulkActions) {
        return null
    }

    const beforeFilterBlock = hasBeforeFilterActions ? (
        <FadeSlot visible={hasBeforeFilterActions}>
            <ToolbarActionGroup plan={beforeFilterActionsPlan} overflowMenuLabel={overflowMenuLabel} />
        </FadeSlot>
    ) : null

    const afterSearchBlock = hasAfterSearchActions ? (
        <FadeSlot visible={hasAfterSearchActions}>
            <div className='flex flex-nowrap items-center gap-2'>
                <ToolbarActionGroup plan={afterSearchActionsPlan} overflowMenuLabel={overflowMenuLabel} />
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
            )}
        >
            {variant === 'inline-selection' && (
                <>
                    {hasBulkActions && bulkActionsPlan && (
                        <ToolbarActionGroup
                            plan={bulkActionsPlan}
                            overflowMenuLabel={overflowMenuLabel}
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
