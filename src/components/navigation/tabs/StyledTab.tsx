import { useCallback, type FC, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { useTabsContext, type TabValue } from './TabsContext'

export interface StyledTabProps {
    value?: TabValue
    label?: ReactNode
    disabled?: boolean
    className?: string
    sx?: unknown
    /** @internal Injected by `StyledTabs` so a value-less tab selects by position (MUI parity). */
    index?: number
}

/**
 * Native tab button (replaces MUI `Tab`). Reads selection/size from the surrounding
 * `StyledTabs` context and reports its node so the parent can position the active indicator.
 * Public props (`value`/`label`/`disabled`/`className`) preserved (DEC-003). TASK-202.
 */
export const StyledTab: FC<StyledTabProps> = ({ value, label, disabled, className, sx, index }) => {
    const ctx = useTabsContext()
    const effectiveValue = value !== undefined ? value : index
    const selected = ctx ? ctx.value === effectiveValue : false

    const ref = useCallback(
        (node: HTMLButtonElement | null) => {
            ctx?.register(effectiveValue, node)
        },
        [ctx, effectiveValue],
    )

    return (
        <button
            ref={ref}
            type='button'
            role='tab'
            aria-selected={selected}
            aria-disabled={disabled ? true : undefined}
            disabled={disabled}
            tabIndex={selected ? 0 : -1}
            data-tab-value={
                typeof effectiveValue === 'string' || typeof effectiveValue === 'number'
                    ? String(effectiveValue)
                    : undefined
            }
            onClick={(e) => !disabled && ctx?.onSelect(e, effectiveValue)}
            className={cn(
                'inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-medium normal-case tracking-normal transition-colors',
                ctx?.size === 'small' && 'min-h-9 px-3 py-2',
                selected ? 'text-gama-500' : 'text-gray-600',
                disabled && 'text-gray-300',
                !disabled && 'cursor-pointer hover:text-gama-500',
                className,
            )}
            style={resolveSx(sx)}
        >
            {label}
        </button>
    )
}
