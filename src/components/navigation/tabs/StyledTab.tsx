import { useCallback, type FC, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { useTabsContext, type TabValue } from './TabsContext'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15981-35855
 * Figma "Tab" / `_BASE_Tab`. Figma **Active** (on/off) ← whether this tab is the selected one in the
 * surrounding `StyledTabs`; **State** (Enabled/Hovered/Focused/Disabled) ← native hover/focus +
 * `disabled`. **Size** (Medium/Small) comes from `StyledTabs.size`. Active label + 2px underline =
 * `gama-500` #168181 (text-icon/primary).
 */
export interface StyledTabProps {
    /** @figmaProp none — selection value */
    value?: TabValue
    /** @figmaProp Label (tab content; may include a leading icon) */
    label?: ReactNode
    /** @figmaProp State = true→"Disabled" */
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
    const hasTextSize = /\btext-(?:xs|sm|base|lg|xl|\[)/.test(className ?? '')
    const hasFontWeight = /\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/.test(
        className ?? '',
    )
    const hasTextTransform = /\b(?:uppercase|lowercase|capitalize|normal-case)\b/.test(className ?? '')

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
                // Figma Tab (node 15981-35855): Medium h48/px16/py12, Small h40/px12/py8, gap 8,
                // label Medium 18px/lh28 (Section title) or Small 16px/lh24 (Body Base Semibold).
                'inline-flex min-h-12 min-w-[90px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-t-lg border-0 bg-transparent px-4 py-3 tracking-normal outline-none transition-colors',
                !hasTextSize && (ctx?.size === 'small' ? 'text-base' : 'text-lg'),
                // Weight (Figma): Small tabs use "Body Base Semibold" in every state, so they are
                // always SemiBold. Medium/default tabs use "Section title" — SemiBold when
                // active/disabled, but a resting inactive tab is Medium and thickens to SemiBold on
                // hover/focus.
                !hasFontWeight &&
                    (ctx?.size === 'small' || selected || disabled
                        ? 'font-semibold'
                        : 'font-medium hover:font-semibold focus-visible:font-semibold'),
                !hasTextTransform && 'normal-case',
                ctx?.size === 'small' && 'min-h-10 px-3 py-2',
                // Label colour — single source so precedence is exact: disabled → selected → inactive.
                // Disabled = text-icon/disabled #bdc4cf (delta-300); active = gama-500; inactive = delta-600.
                disabled ? 'text-delta-300' : selected ? 'text-gama-500' : 'text-delta-600',
                !disabled && 'cursor-pointer',
                // Figma Focused = 2px gama-400 border on ALL sides. Inset box-shadow ring hugs the box
                // (follows the rounded top) with no layout shift.
                'focus-visible:shadow-[inset_0_0_0_2px_var(--colors-gama-400)]',
                // Figma Hover (not selected) = 2px delta-300 bottom underline (thicker than the resting line).
                !disabled && !selected && 'hover:shadow-[inset_0_-2px_0_0_var(--colors-delta-300)]',
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx) }}
        >
            {label}
        </button>
    )
}
