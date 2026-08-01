import { useVirtualizer } from '@tanstack/react-virtual'
import { type ReactNode, useRef } from 'react'

/**
 * Renders only the rows in view, for lists long enough that mounting all of them is the bottleneck.
 *
 * Lives here rather than in each consumer because `@tanstack/react-virtual` is already a dependency
 * of this package (the table's column virtualizer uses it), and because the mechanism is the part
 * that gets copied wrong: the spacer must carry the *full* scroll height or the scrollbar lies, rows
 * must be positioned rather than laid out, and each row needs `measureElement` or variable heights
 * drift. Encapsulating it keeps the virtualizer an implementation detail of this package instead of a
 * dependency every app adds for itself.
 *
 * **This virtualizes RENDERING, not loading.** Every item must already be in memory — `items` is the
 * complete list. A consumer that also wants to fetch lazily needs its own windowing on top, and
 * should think hard about whether partial data still satisfies its own invariants.
 *
 * Variable row heights work without configuration: `estimatedItemHeight` only seeds the first paint,
 * after which real heights are measured.
 */
export interface VirtualizedListProps<TItem> {
    items: readonly TItem[]
    /** Stable identity per row. Index-based keys would remount rows on reorder and lose focus. */
    getItemKey: (item: TItem, index: number) => string
    renderItem: (item: TItem, index: number) => ReactNode
    /** First-paint estimate only; real heights are measured after mount. Defaults to 48. */
    estimatedItemHeight?: number
    /** Rows kept mounted beyond the viewport, so scrolling does not reveal blank space. Defaults to 8. */
    overscan?: number
    /** Applied to the scroll container — give it a bounded height, or nothing can scroll. */
    className?: string
    dataTest?: string
    /** Rendered instead of the list when `items` is empty. */
    emptyState?: ReactNode
}

export function VirtualizedList<TItem>({
    className,
    dataTest,
    emptyState,
    estimatedItemHeight = 48,
    getItemKey,
    items,
    overscan = 8,
    renderItem,
}: VirtualizedListProps<TItem>): React.ReactElement | null {
    const scrollRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: items.length,
        estimateSize: () => estimatedItemHeight,
        getScrollElement: () => scrollRef.current,
        overscan,
    })

    if (items.length === 0) {
        return emptyState === undefined ? null : <>{emptyState}</>
    }

    return (
        <div className={className} data-testid={dataTest} ref={scrollRef}>
            <div className='relative w-full' style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                    const item = items[virtualItem.index]

                    if (item === undefined) {
                        return null
                    }

                    return (
                        <div
                            className='absolute left-0 top-0 w-full'
                            // `data-index` is not decoration: `measureElement` reads it to know which
                            // row it just measured.
                            data-index={virtualItem.index}
                            key={getItemKey(item, virtualItem.index)}
                            ref={virtualizer.measureElement}
                            style={{ transform: `translateY(${virtualItem.start}px)` }}
                        >
                            {renderItem(item, virtualItem.index)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
