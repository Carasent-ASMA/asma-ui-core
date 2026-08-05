import React, {
    type ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react'
import { ChevronDownIcon, ChevronUpIcon } from 'src/components/icons'
import { cn } from 'src/helpers'

export interface PathfinderCardItem {
    id: string
    order: number
    /** Optional width hint in pixels, used only before first measurement. */
    estimatedWidth?: number
    render: (ctx: { compact: boolean }) => ReactNode
}

export interface PathfinderCardProps {
    items: PathfinderCardItem[]
    expanded: boolean
    onToggleExpanded: () => void
    leadSlot?: ReactNode
    actionSlot?: ReactNode
    className?: string
    /** Minimum space reserved for the lead slot while collapsed. */
    leadReservePx?: number
    /** Minimum space reserved for the action slot while collapsed. */
    actionReservePx?: number
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function useElementWidth<T extends HTMLElement>() {
    const [node, setNode] = useState<T | null>(null)

    const ref = useCallback((el: T | null) => {
        setNode(el)
    }, [])

    const getSnapshot = useCallback(() => {
        if (!node) return 0
        return Math.floor(node.getBoundingClientRect().width)
    }, [node])

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            if (!node || typeof ResizeObserver === 'undefined')
                return () => {
                    console.log('Node is missing or ResizeObserver is undefined')
                }

            let raf = 0
            const ro = new ResizeObserver(() => {
                cancelAnimationFrame(raf)
                raf = requestAnimationFrame(onStoreChange)
            })

            ro.observe(node)

            return () => {
                cancelAnimationFrame(raf)
                ro.disconnect()
            }
        },
        [node],
    )

    const width = useSyncExternalStore(subscribe, getSnapshot, () => 0)

    return { ref, width }
}

function sortItems(items: PathfinderCardItem[]) {
    return [...items].sort((a, b) => {
        const orderA = a.order ?? 0
        const orderB = b.order ?? 0
        if (orderA !== orderB) return orderA - orderB
        return a.id.localeCompare(b.id)
    })
}

interface Measurements {
    itemWidths: Record<string, number>
    leadWidth: number
    actionWidth: number
}

function useCollapsedMeasurements(params: {
    items: PathfinderCardItem[]
    leadSlot?: ReactNode
    actionSlot?: ReactNode
}) {
    const { items, leadSlot, actionSlot } = params

    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const leadRef = useRef<HTMLDivElement | null>(null)
    const actionRef = useRef<HTMLDivElement | null>(null)

    const [measurements, setMeasurements] = useState<Measurements>({
        itemWidths: {},
        leadWidth: 0,
        actionWidth: 0,
    })
    const measurementsRef = useRef(measurements)

    useEffect(() => {
        measurementsRef.current = measurements
    }, [measurements])

    const registerItemRef = useCallback((id: string) => {
        return (node: HTMLDivElement | null) => {
            itemRefs.current[id] = node
        }
    }, [])

    useIsomorphicLayoutEffect(() => {
        const nextItemWidths: Record<string, number> = {}

        for (const item of items) {
            const node = itemRefs.current[item.id]
            const width = Math.ceil(node?.getBoundingClientRect().width ?? item.estimatedWidth ?? 0)
            nextItemWidths[item.id] = width
        }

        const nextLeadWidth = leadSlot ? Math.ceil(leadRef.current?.getBoundingClientRect().width ?? 0) : 0
        const nextActionWidth = actionSlot ? Math.ceil(actionRef.current?.getBoundingClientRect().width ?? 0) : 0

        const prev = measurementsRef.current
        const sameItems =
            Object.keys(prev.itemWidths).length === Object.keys(nextItemWidths).length &&
            items.every((item) => prev.itemWidths[item.id] === nextItemWidths[item.id])

        if (!sameItems || prev.leadWidth !== nextLeadWidth || prev.actionWidth !== nextActionWidth) {
            setMeasurements({
                itemWidths: nextItemWidths,
                leadWidth: nextLeadWidth,
                actionWidth: nextActionWidth,
            })
        }
    }, [items, leadSlot, actionSlot])

    return {
        measurements,
        registerItemRef,
        leadRef,
        actionRef,
    }
}

function packCollapsedItems(params: {
    items: PathfinderCardItem[]
    availableWidth: number
    gapPx: number
    itemWidths: Record<string, number>
}) {
    const { items, availableWidth, gapPx, itemWidths } = params

    const visible: PathfinderCardItem[] = []
    let used = 0

    for (const item of sortItems(items)) {
        const itemWidth = Math.max(0, itemWidths[item.id] ?? item.estimatedWidth ?? 0)
        const nextWidth = visible.length === 0 ? itemWidth : used + gapPx + itemWidth

        // Never show a partially cut item in collapsed mode.
        if (nextWidth > availableWidth) break

        visible.push(item)
        used = nextWidth
    }

    return visible
}

function ItemRenderer({ item, compact }: { item: PathfinderCardItem; compact: boolean }) {
    return <>{item.render({ compact })}</>
}

export function PathfinderCard({
    items,
    expanded,
    onToggleExpanded,
    leadSlot,
    actionSlot,
    className,
    leadReservePx = 140,
    actionReservePx = 44,
}: PathfinderCardProps): React.JSX.Element {
    const { ref, width } = useElementWidth<HTMLDivElement>()
    const compact = !expanded

    const sortedItems = useMemo(() => sortItems(items), [items])

    const { measurements, registerItemRef, leadRef, actionRef } = useCollapsedMeasurements({
        items: sortedItems,
        leadSlot,
        actionSlot,
    })

    const collapsedVisibleItems = useMemo(() => {
        if (expanded) return sortedItems

        const shellPaddingLeft = 24
        const shellPaddingRight = 40
        const reservedLead = leadSlot ? Math.max(leadReservePx, measurements.leadWidth + 12) : 0
        const reservedAction = actionSlot ? Math.max(actionReservePx, measurements.actionWidth) : 0
        const chevronReservePx = 24

        const availableWidth = Math.max(
            0,
            width - shellPaddingLeft - shellPaddingRight - reservedLead - reservedAction - chevronReservePx,
        )

        return packCollapsedItems({
            items: sortedItems,
            availableWidth,
            gapPx: 12,
            itemWidths: measurements.itemWidths,
        })
    }, [expanded, sortedItems, width, leadSlot, actionSlot, leadReservePx, actionReservePx, measurements])

    return (
        <div
            ref={ref}
            className={cn(
                'relative border-2 border-solid border-gama-300 bg-gama-25 transition-all duration-300 ease-in-out',
                'rounded-[8px] min-[744px]:rounded-[100px]',
                compact ? 'overflow-hidden' : 'overflow-visible',
                className,
            )}
            aria-expanded={expanded}
            role='button'
            tabIndex={0}
            onClick={onToggleExpanded}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggleExpanded()
                }
            }}
        >
            <div className={cn('flex min-w-0 items-center p-2', compact ? 'gap-y-0' : 'gap-y-2')}>
                {leadSlot ? <div className='shrink-0'>{leadSlot}</div> : null}

                <div className='min-w-0 flex-1 px-4'>
                    {compact ? (
                        <div className='flex min-w-0 flex-nowrap items-center gap-x-4 overflow-hidden whitespace-nowrap'>
                            {collapsedVisibleItems.map((item) => (
                                <div key={item.id} className='shrink-0 whitespace-nowrap'>
                                    <ItemRenderer item={item} compact={compact} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 overflow-visible'>
                            {sortedItems.map((item) => (
                                <div key={item.id} className='shrink-0 whitespace-nowrap'>
                                    <ItemRenderer item={item} compact={compact} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className='absolute right-4 top-1/2 z-20 flex-shrink-0 -translate-y-1/2 text-delta-700'>
                {expanded ? <ChevronUpIcon className='size-6' /> : <ChevronDownIcon className='size-6' />}
            </div>

            <div aria-hidden className='pointer-events-none absolute left-0 top-0 -z-10 opacity-0'>
                <div className='flex min-w-0 flex-nowrap items-center gap-x-3 whitespace-nowrap'>
                    {leadSlot ? (
                        <div className='mr-3 shrink-0 pt-0.5'>
                            <div ref={leadRef}>{leadSlot}</div>
                        </div>
                    ) : null}

                    {sortedItems.map((item) => (
                        <div key={item.id} ref={registerItemRef(item.id)} className='shrink-0 whitespace-nowrap'>
                            <ItemRenderer item={item} compact />
                        </div>
                    ))}

                    {actionSlot ? (
                        <div className='shrink-0'>
                            <div ref={actionRef}>{actionSlot}</div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
