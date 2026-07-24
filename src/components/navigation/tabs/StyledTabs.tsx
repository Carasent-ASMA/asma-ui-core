import {
    Children,
    cloneElement,
    isValidElement,
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type FC,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    type SyntheticEvent,
} from 'react'
import type { StyledTabProps } from './StyledTab'
import { cn } from 'src/helpers/cn'
import { consumerOverrides } from 'src/helpers/classOverride'
import { resolveSx } from 'src/helpers/sx'
import { ChevronLeftIcon, ChevronRightIcon } from 'src/components/icons'
import { TabsContext, type TabValue } from './TabsContext'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15981-35855
 * The tablist. `value` marks which child `StyledTab` is Figma **Active**; `size` maps to Figma
 * **Size** (`default`→Medium 48px, `small`→40px). The animated 2px underline is `gama-500`.
 */
export interface StyledTabsProps {
    /** @figmaProp Active — selects the matching child tab */
    value?: TabValue
    // Method syntax (not `(event, value) => void`) is deliberate: it restores MUI `Tabs.onChange`'s
    // bivariant `value` parameter (DEC-003), so consumers can type the handler's value as `string`,
    // an enum, etc. despite `TabValue` being `unknown` — without resorting to `any`.
    onChange?(event: SyntheticEvent, value: TabValue): void
    variant?: 'standard' | 'scrollable' | 'fullWidth'
    scrollButtons?: 'auto' | boolean
    centered?: boolean
    size?: 'default' | 'small'
    className?: string
    sx?: unknown
    children?: ReactNode
}

const SCROLL_STEP = 120

/**
 * Native tablist (replaces MUI `Tabs`). Provides selection/size via context to `StyledTab`
 * children, animates an underline indicator measured from the active tab, and — in the
 * `scrollable` variant — shows overflow scroll buttons. Roving-tabindex arrow-key nav. Public
 * props (`value`/`onChange`/`variant`/`scrollButtons`/`centered`/`size`) preserved (DEC-003). TASK-202.
 */
export const StyledTabs: FC<StyledTabsProps> = ({
    value,
    onChange,
    variant = 'standard',
    scrollButtons = 'auto',
    centered,
    size = 'default',
    className,
    sx,
    children,
}) => {
    const scrollerRef = useRef<HTMLDivElement>(null)
    const nodesRef = useRef<Map<TabValue, HTMLButtonElement>>(new Map())
    const [indicator, setIndicator] = useState<{ left: number; width: number; disabled: boolean }>({
        left: 0,
        width: 0,
        disabled: false,
    })
    const [overflow, setOverflow] = useState({ left: false, right: false })

    const isScrollable = variant === 'scrollable'

    const register = useCallback((tabValue: TabValue, node: HTMLButtonElement | null) => {
        if (node) nodesRef.current.set(tabValue, node)
        else nodesRef.current.delete(tabValue)
    }, [])

    const onSelect = useCallback(
        (event: SyntheticEvent, tabValue: TabValue) => onChange?.(event, tabValue),
        [onChange],
    )

    const measure = useCallback(() => {
        const node = nodesRef.current.get(value)
        const scroller = scrollerRef.current
        if (node)
            setIndicator({
                left: node.offsetLeft,
                width: node.offsetWidth,
                // Figma: a disabled active tab's underline is delta-300, not the gama-500 indicator.
                disabled: node.disabled || node.getAttribute('aria-disabled') === 'true',
            })
        if (scroller) {
            const { scrollLeft, scrollWidth, clientWidth } = scroller
            setOverflow({ left: scrollLeft > 1, right: scrollLeft + clientWidth < scrollWidth - 1 })
        }
    }, [value])

    useLayoutEffect(() => {
        measure()
        const scroller = scrollerRef.current
        if (!scroller) return
        const observer = new ResizeObserver(measure)
        observer.observe(scroller)
        return () => observer.disconnect()
    }, [measure, children])

    const scrollBy = (delta: number): void => {
        scrollerRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
        const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
        if (!keys.includes(event.key)) return
        event.preventDefault()
        const tabs = Array.from(nodesRef.current.values()).filter((n) => !n.disabled)
        if (tabs.length === 0) return
        const activeIndex = tabs.findIndex((n) => n === document.activeElement)
        let nextIndex = activeIndex
        if (event.key === 'ArrowRight') nextIndex = (activeIndex + 1) % tabs.length
        else if (event.key === 'ArrowLeft') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length
        else if (event.key === 'Home') nextIndex = 0
        else if (event.key === 'End') nextIndex = tabs.length - 1
        tabs[nextIndex]?.focus()
    }

    const showButtons = isScrollable && scrollButtons !== false && (scrollButtons === true || overflow.left || overflow.right)

    // The tablist card carries a Figma 16px inset (`px-4`) by default. But `cn` is plain clsx (no
    // tailwind-merge), so a consumer `className='px-0'` would NOT win — both land and Tailwind's fixed
    // ordering keeps `px-4`. Drop the default when the consumer supplies any horizontal padding so the
    // override is reliable (same pattern as StyledMenuList). See ui-core-mui-free-migration SKILL.
    const consumerSetsPadding = consumerOverrides(className, 'padding-x')

    const contextValue = useMemo(
        () => ({ value, size, onSelect, register }),
        [value, size, onSelect, register],
    )

    const scrollButtonClass =
        'flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-[10%] border border-solid border-delta-500 text-delta-700 transition-colors hover:bg-gama-50 disabled:invisible'

    return (
        <TabsContext.Provider value={contextValue}>
            <div
                className={cn('relative flex items-center rounded-t-lg bg-white', !consumerSetsPadding && 'px-4', className)}
                style={resolveSx(sx)}
            >
                {showButtons && (
                    <button
                        type='button'
                        aria-label='scroll tabs left'
                        className={cn(scrollButtonClass, 'mr-2')}
                        disabled={!overflow.left}
                        onClick={() => scrollBy(-SCROLL_STEP)}
                    >
                        <ChevronLeftIcon width={24} height={24} />
                    </button>
                )}
                {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- false positive: per the
                    WAI-ARIA Tabs pattern the tablist CONTAINER is never itself a tab stop; only the active
                    tab is, via roving tabindex (StyledTab sets tabIndex={selected ? 0 : -1}). */}
                <div
                    ref={scrollerRef}
                    role='tablist'
                    aria-orientation='horizontal'
                    onKeyDown={handleKeyDown}
                    onScroll={measure}
                    className={cn(
                        'relative flex border-x-0 border-b border-t-0 border-solid border-delta-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                        isScrollable ? 'flex-1 overflow-x-auto' : 'w-full',
                        variant === 'fullWidth' && '[&>*]:flex-1',
                        centered && 'justify-center',
                        size === 'small' && 'min-h-9',
                    )}
                >
                    {Children.map(children, (child, index) =>
                        isValidElement(child)
                            ? cloneElement(child as ReactElement<StyledTabProps>, { index })
                            : child,
                    )}
                    <span
                        aria-hidden
                        className={cn(
                            'absolute bottom-0 h-0.5 transition-all duration-300',
                            indicator.disabled ? 'bg-delta-300' : 'bg-gama-500',
                        )}
                        style={{ left: indicator.left, width: indicator.width }}
                    />
                </div>
                {showButtons && (
                    <button
                        type='button'
                        aria-label='scroll tabs right'
                        className={cn(scrollButtonClass, 'ml-2')}
                        disabled={!overflow.right}
                        onClick={() => scrollBy(SCROLL_STEP)}
                    >
                        <ChevronRightIcon width={24} height={24} />
                    </button>
                )}
            </div>
        </TabsContext.Provider>
    )
}
