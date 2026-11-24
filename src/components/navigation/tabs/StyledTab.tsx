import { useCallback, type FC, type ReactNode } from 'react'
import { StyledTooltip } from 'src/components/data-display/tooltip/StyledTooltip'
import { cn } from 'src/helpers/cn'
import { pressedStateHandlers } from 'src/helpers/pressedState'
import { resolveSx } from 'src/helpers/sx'
import { useTabsContext, type TabValue } from './TabsContext'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15981-35855
 * Figma "Tab" / `_BASE_Tab`. Figma **Active** (on/off) ← whether this tab is the selected one in the
 * surrounding `StyledTabs`; **State** (Enabled/Hovered/Focused/Disabled) ← native hover/focus +
 * `disabled`. **Size** (Medium/Small) comes from `StyledTabs.size`. Active label + 3px underline =
 * `gama-500` #168181 (text-icon/primary).
 */
export interface StyledTabProps {
    /** @figmaProp none — selection value */
    value?: TabValue
    /** @figmaProp Label (tab content; may include a leading icon) */
    label?: ReactNode
    /**
     * @figmaProp State = true→"Disabled". Rendered as `aria-disabled`, not native `disabled`: the tab
     * stays in the arrow-key order so keyboard users can find it (disabled-states DIS-3); a click or
     * Enter does not select it.
     */
    disabled?: boolean
    /**
     * @figmaProp none — behavioral. Why the tab is unavailable. With `disabled` the tab stays in
     * arrow-key navigation and shows the reason on hover, focus and tap (disabled-states DIS-1…DIS-3).
     */
    disabledReason?: ReactNode
    /**
     * @figmaProp none — a11y
     * Tooltip on the tab, opened by hover and keyboard focus and read as the tab's description —
     * typically why a `disabled` tab is unavailable (disabled-states DIS-1, DIS-2). Falsy renders none.
     * A `disabledReason` takes its place while the tab is disabled.
     */
    tooltip?: ReactNode
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
export const StyledTab: FC<StyledTabProps> = ({
    value,
    label,
    disabled,
    disabledReason,
    tooltip,
    className,
    sx,
    index,
}) => {
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

    const reason = disabled && disabledReason ? disabledReason : tooltip
    const reasoned = Boolean(disabled) && Boolean(reason)

    const tab = (
        <button
            ref={ref}
            type='button'
            role='tab'
            aria-selected={selected}
            aria-disabled={disabled ? true : undefined}
            tabIndex={selected ? 0 : -1}
            data-tab-value={
                typeof effectiveValue === 'string' || typeof effectiveValue === 'number'
                    ? String(effectiveValue)
                    : undefined
            }
            onClick={(e) => !disabled && ctx?.onSelect(e, effectiveValue)}
            {...pressedStateHandlers({ enabled: !disabled, keyboard: true })}
            className={cn(
                // Figma Tab set 15981:32783: Medium h48 (28px line centred: py10) px16 18px, Small h40 py8 px12
                // 16px, gap 8; the label is SemiBold in every state and size.
                'inline-flex min-w-[90px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-t-lg border-0 bg-transparent tracking-normal outline-none transition-colors',
                ctx?.size === 'small' ? 'min-h-10 px-3 py-2' : 'min-h-12 px-4 py-2.5',
                !hasTextSize && (ctx?.size === 'small' ? 'text-base' : 'text-lg'),
                !hasFontWeight && 'font-semibold',
                !hasTextTransform && 'normal-case',
                // No `asma-touch-target`: that min-height override would change the Figma 40/48px heights.
                'asma-touch-ready',
                // Label colour — single source so precedence is exact: disabled → selected → inactive.
                // Disabled = text-icon/disabled #bdc4cf (delta-300); active = gama-500; inactive = delta-600.
                disabled ? 'text-delta-300' : selected ? 'text-gama-500' : 'text-delta-600',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                // Figma Focused = 3px focus-ring border on ALL sides. Inset box-shadow ring hugs the box
                // (follows the rounded top) with no layout shift.
                'focus-visible:shadow-[inset_0_0_0_3px_var(--colors-focus-ring)]',
                // Figma Hover (not selected) = 3px delta-300 bottom underline.
                !disabled && !selected && '[&:not([data-pressed])]:hover:shadow-[inset_0_-3px_0_0_var(--colors-delta-300)]',
                // ASMA-9003 Figma Tab State=Pressed: the 1px separator line, not the hover underline, under the fill.
                // @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
                !disabled &&
                    'data-[pressed]:bg-gama-200 data-[pressed]:bg-[linear-gradient(to_top,var(--colors-delta-200)_1px,transparent_1px)] data-[pressed]:text-gama-700 data-[pressed]:transition-none data-[press-released]:duration-150 data-[press-released]:ease-[ease-out] forced-colors:data-[pressed]:![outline-offset:-2px] forced-colors:data-[pressed]:![outline:2px_solid_Highlight]',
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx) }}
        >
            {label}
        </button>
    )

    // The tab carries its own description, kept in the DOM so it is read the moment focus lands: under
    // roving tabindex an unselected tab is `tabIndex=-1`, which the tooltip still finds as a focusable
    // roving item. Always rendered, so a tab that turns disabled is not remounted.
    return (
        <StyledTooltip
            title={reason}
            open={reason ? undefined : false}
            arrow
            openOnTap={reasoned}
            persistentDescription={Boolean(reason)}
        >
            {tab}
        </StyledTooltip>
    )
}
