import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { resolveSx } from 'src/helpers/sx'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#16073-21583
 * Figma "Menus item" (h40, label 16px text-icon/body). Hover gray `#f0f2f4`, separator `#d3d8df`.
 */
export interface StyledMenuItemProps {
    /** @figmaProp content — Type (Only Label / Icon / Checkbox / Check mark) via composition */
    children?: ReactNode
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
    /** Forwarded to the `<li>` — e.g. `stopPropagation` so a menu-item mousedown doesn't dismiss the menu. */
    onMouseDown?: (event: MouseEvent<HTMLLIElement>) => void
    onMouseUp?: (event: MouseEvent<HTMLLIElement>) => void
    /** @figmaProp State = true→"Disabled" */
    disabled?: boolean
    /** @figmaProp State = true→"Selected" */
    selected?: boolean
    /** Compact vertical padding (MUI `MenuItem` `dense` parity, DEC-003). */
    dense?: boolean
    /**
     * Hover/focus hint for the row — e.g. the reason an already-selected multiple-choice option
     * cannot be picked again. The caller owns the wording: this package ships no translations.
     */
    tooltip?: ReactNode
    value?: unknown
    className?: string
    classes?: { root?: string; selected?: string }
    sx?: unknown
    'data-test'?: string
    'data-testid'?: string
}

/**
 * Native `role="menuitem"` (replaces MUI `MenuItem`). Enter/Space activate; a disabled item stays
 * focusable but non-interactive (MUI parity). Public props preserved (DEC-003). TASK-303.
 */
export const StyledMenuItem = ({
    children,
    onClick,
    onMouseDown,
    onMouseUp,
    disabled,
    selected,
    dense,
    tooltip,
    className,
    classes,
    sx,
    'data-test': dataTest,
    'data-testid': dataTestId,
    // Accepted for parity (consumed by Select, not needed for menu rendering).
    value: _value,
}: StyledMenuItemProps): JSX.Element => {
    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>): void => {
        if (disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick?.(event as unknown as MouseEvent<HTMLLIElement>)
        }
    }

    const row = (
        <li
            role='menuitem'
            aria-disabled={disabled ? true : undefined}
            tabIndex={-1}
            data-test={dataTest}
            data-testid={dataTestId}
            onClick={disabled ? undefined : onClick}
            onMouseDown={disabled ? undefined : onMouseDown}
            onMouseUp={disabled ? undefined : onMouseUp}
            onKeyDown={handleKeyDown}
            className={cn(
                // Figma Menus item (node 16073-21583): h40, py8, label Body Base 16px.
                'box-border flex items-center px-4 text-base outline-none focus-visible:shadow-[inset_3px_0_var(--colors-focus-ring)]',
                dense ? 'min-h-8 py-1' : 'min-h-10 py-2',
                // ASMA-8210: the item had no pressed state at all, and at 40px (32px dense) both
                // variants sit under the 44px touch height — safe for the touch-target override,
                // which only ever raises them (it sets min-height only; the item declares no
                // min-width). Menu rows sit flush against each other, so an overlaid hit area
                // would steal the neighbour's presses — grow instead, and only on a phone, which
                // leaves tablet and desktop byte-identical.
                'asma-pressable asma-touch-target',
                // Figma Disabled menu item = muted text-icon/disabled (delta-300); enabled = text-icon/body (delta-700).
                // The `aria-disabled:` variant (specificity 0,2,0) keeps the grey winning over any
                // text-* colour a consumer passes via `className` (all utilities are `!important`,
                // so plain classes resolve by stylesheet order, not by the `!` prefix).
                // Figma bg/hover-default #f0f2f4 = delta-50 in every theme. A selected row keeps its
                // fill on hover (the node's bg/hover-selected equals the resting selected colour),
                // so the hover utility is simply absent there rather than out-ranked.
                disabled
                    ? 'cursor-not-allowed text-delta-300 aria-disabled:text-delta-300'
                    : cn('cursor-pointer text-delta-700', !selected && 'hover:bg-delta-50'),
                selected && cn('bg-gama-50', classes?.selected),
                classes?.root,
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx) }}
        >
            {children}
        </li>
    )

    // StyledTooltip clones its child, so the `<li>` stays a direct `<ul>` child — no wrapper, no
    // broken list semantics. An absent title renders the row alone.
    return tooltip ? (
        <StyledTooltip title={tooltip} arrow placement='top'>
            {row}
        </StyledTooltip>
    ) : (
        row
    )
}
