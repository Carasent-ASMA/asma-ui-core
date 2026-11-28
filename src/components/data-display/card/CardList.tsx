import { useEffect, useLayoutEffect, useMemo, useRef, type FocusEvent, type ReactNode, type RefObject } from 'react'
import { firstTabbable } from 'src/helpers/focusable'
import { cn } from 'src/helpers/cn'
import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'
import type { CardHeadingLevel } from './Card.types'
import { CardListItemContext, type CardListItemContextValue } from './cardModel'

/** Loading placeholder in the card's shape; hidden from assistive technology, the list says it is busy (CARD-17). */
export const CardSkeleton = (): JSX.Element => (
    <div aria-hidden='true' className='border-delta-300 box-border flex w-full max-w-150 flex-col gap-3 rounded-xl border border-solid bg-white px-4 py-3'>
        <div className='bg-delta-100 h-4 w-1/3 animate-pulse rounded-[4px] motion-reduce:animate-none' />
        <div className='bg-delta-100 h-5 w-4/5 animate-pulse rounded-[4px] motion-reduce:animate-none' />
        <div className='bg-delta-100 h-4 w-1/2 animate-pulse rounded-[4px] motion-reduce:animate-none' />
    </div>
)

export interface CardListSelection {
    /** Controlled by the app, so the checked cards survive a visit to an item and back (CARD-13). */
    checkedIds: readonly string[]
    onCheckedChange: (id: string, checked: boolean) => void
    disabledReason?: (id: string) => string | undefined
}

export interface CardListProps<T> {
    items: readonly T[]
    getId: (item: T) => string
    renderCard: (item: T) => ReactNode
    /**
     * Heading level of every card title in the list, so they all match (CARD-8). Optional: a card's own
     * `headingLevel` wins; without either, cards use `h3`.
     */
    cardHeadingLevel?: CardHeadingLevel
    /** Language of every card's built-in strings. Defaults to `en`, as in the rest of ui-core. */
    locale?: UiCoreLocale
    /** `grid` (default): as many columns of at least 18 rem as fit, the cards of a row equally tall; each card stays ≤ 37.5 rem. `column`: one left-aligned column (CARD-16). */
    layout?: 'column' | 'grid'
    loading?: boolean
    skeletonCount?: number
    /** Says why the list is empty and what to do (CARD-17). */
    empty?: ReactNode
    /** Announced politely when an action the user took changed the list (4.1.3). */
    statusMessage?: string
    /** Puts focus back on this card's link, e.g. after returning from the item it opens (CARD-13). */
    restoreFocusId?: string
    selection?: CardListSelection
    ariaLabel?: string
    className?: string
    dataTest: string
}

const focusCardIn = (listItem: Element | null | undefined): void => {
    if (!(listItem instanceof HTMLElement)) return
    const target = listItem.querySelector<HTMLElement>('[data-card-link]') ?? firstTabbable(listItem)
    target?.focus()
    target?.scrollIntoView?.({ block: 'nearest' })
}

/** When the focused card leaves the list, focus moves to the next card, never to the top of the page (CARD-17). */
const useFocusFollowsRemoval = (listRef: RefObject<HTMLUListElement>, ids: string[]): ((event: FocusEvent) => void) => {
    const focused = useRef<{ id: string; index: number } | null>(null)

    useLayoutEffect(() => {
        const last = focused.current
        if (!last || ids.includes(last.id)) return
        focused.current = null
        // Only rescue focus the removal dropped; never pull it from where the user has moved since.
        if (document.activeElement && document.activeElement !== document.body) return
        const nextIndex = Math.min(last.index, ids.length - 1)
        if (nextIndex >= 0) focusCardIn(listRef.current?.children[nextIndex])
    }, [ids, listRef])

    return (event) => {
        const item = event.target.closest('[data-card-id]')
        const id = item?.getAttribute('data-card-id')
        if (id) focused.current = { id, index: ids.indexOf(id) }
    }
}

const useRestoreFocus = (listRef: RefObject<HTMLUListElement>, restoreFocusId: string | undefined, isReady: boolean): void => {
    useEffect(() => {
        if (!restoreFocusId || !isReady) return
        focusCardIn(listRef.current?.querySelector(`[data-card-id="${CSS.escape(restoreFocusId)}"]`))
    }, [restoreFocusId, isReady, listRef])
}

const buildItemContext = (
    id: string,
    cardHeadingLevel: CardHeadingLevel | undefined,
    selection: CardListSelection | undefined,
    locale: UiCoreLocale | undefined,
): CardListItemContextValue => ({
    headingLevel: cardHeadingLevel,
    locale,
    checkbox: selection && {
        checked: selection.checkedIds.includes(id),
        onChange: (checked) => selection.onCheckedChange(id, checked),
        disabledReason: selection.disabledReason?.(id),
    },
})

/**
 * A group of cards is a list: `<ul>` with one `<li>` per card, loading and empty states, and a checkbox on
 * every card in select mode (CARD-7, CARD-13, CARD-16, CARD-17). Only the list: a heading, a count, a
 * bulk-actions bar or "Show more" around it are the app's, in its own design.
 *
 * @see asma-modules/_docs/ux/components/component-card.md:201 — CARD-17
 */
export const CardList = <T,>(props: CardListProps<T>): JSX.Element => {
    const { items, getId, renderCard, cardHeadingLevel, selection, loading = false, layout = 'grid', dataTest } = props
    const listRef = useRef<HTMLUListElement>(null)
    const ids = useMemo(() => items.map(getId), [items, getId])
    const trackFocus = useFocusFollowsRemoval(listRef, ids)
    useRestoreFocus(listRef, props.restoreFocusId, !loading)

    const isEmpty = !loading && items.length === 0
    const listClass =
        layout === 'grid' ? 'grid grid-cols-[repeat(auto-fill,minmax(min(18rem,100%),1fr))] gap-2' : 'flex flex-col items-start gap-2'

    return (
        <div className={cn('flex flex-col gap-2', props.className)} data-testid={dataTest}>
            <div role='status' className='sr-only'>
                {props.statusMessage}
            </div>
            {isEmpty ? (
                props.empty
            ) : (
                <ul
                    ref={listRef}
                    aria-label={props.ariaLabel}
                    aria-busy={loading || undefined}
                    className={cn('m-0 list-none p-0', listClass)}
                    onFocus={trackFocus}
                >
                    {loading
                        ? Array.from({ length: props.skeletonCount ?? 3 }, (_, index) => (
                              <li key={`skeleton-${index}`} className='w-full max-w-150'>
                                  <CardSkeleton />
                              </li>
                          ))
                        : items.map((item) => {
                              const id = getId(item)
                              return (
                                  <li key={id} data-card-id={id} className={cn('w-full max-w-150', layout === 'grid' && 'flex')}>
                                      <CardListItemContext.Provider value={buildItemContext(id, cardHeadingLevel, selection, props.locale)}>
                                          {renderCard(item)}
                                      </CardListItemContext.Provider>
                                  </li>
                              )
                          })}
                </ul>
            )}
        </div>
    )
}
