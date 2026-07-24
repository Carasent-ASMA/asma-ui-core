import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import type { CSSProperties, Key, ReactNode } from 'react'
import { useRef } from 'react'

export interface TVirtualListProps<TItem> {
    items: readonly TItem[]
    /** Fixed row height in px, or a per-index height. Treated as an estimate when `measureRows` is on. */
    itemSize: number | ((index: number) => number)
    /** Viewport height of the scroll container. */
    height: number | string
    /** Viewport width of the scroll container. Defaults to '100%'. */
    width?: number | string
    /** Re-measure rendered rows with a ResizeObserver — for rows whose real height is content-driven. */
    measureRows?: boolean
    overscan?: number
    /** Stable row identity for the measurement cache; defaults to the row index. */
    getItemKey?: (index: number) => Key
    className?: string
    /** Class of the inner sizer element — e.g. pass a min-width class to allow horizontal overflow. */
    contentClassName?: string
    contentStyle?: CSSProperties
    dataTest?: string
    renderItem: (item: TItem, index: number) => ReactNode
}

/**
 * @figmaNode none — **headless windowing primitive** (no DS visuals). It only owns a scroll
 * container + absolutely-positioned row wrappers; all row appearance is the consumer's `renderItem`.
 * Nothing to align — it carries no colours/dimensions of its own.
 *
 * Windowed vertical list on top of `@tanstack/react-virtual`. Covers both the fixed-size and the
 * variable-size case (`itemSize` as number or per-index function), and content-driven row heights
 * via `measureRows` — no imperative reset calls needed when a row changes height. The component
 * owns its scroll container, so no explicit pixel width/AutoSizer wrapper is required.
 */
export const VirtualList = <TItem,>({
    items,
    itemSize,
    height,
    width = '100%',
    measureRows = false,
    overscan = 5,
    getItemKey,
    className,
    contentClassName,
    contentStyle,
    dataTest,
    renderItem,
}: TVirtualListProps<TItem>): JSX.Element => {
    const scrollRef = useRef<HTMLDivElement | null>(null)

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: typeof itemSize === 'function' ? itemSize : () => itemSize,
        getItemKey,
        overscan,
    })

    return (
        <div
            ref={scrollRef}
            // Keyboard-reachable when content overflows and scrolls (axe `scrollable-region-focusable`)
            // — a generic, standalone primitive with no built-in alternative keyboard-scroll mechanism.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see comment above
            tabIndex={0}
            className={clsx('overflow-auto', className)}
            style={{ height, width }}
            data-testid={dataTest}
        >
            <div
                className={clsx('relative w-full', contentClassName)}
                style={{ height: virtualizer.getTotalSize(), ...contentStyle }}
            >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                    const item = items[virtualRow.index]

                    if (item === undefined) return null

                    return (
                        <div
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={measureRows ? virtualizer.measureElement : undefined}
                            className='absolute left-0 top-0 w-full'
                            style={{
                                transform: `translateY(${virtualRow.start}px)`,
                                height: measureRows ? undefined : virtualRow.size,
                            }}
                        >
                            {renderItem(item, virtualRow.index)}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
