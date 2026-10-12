import { Children, isValidElement, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledTooltip } from 'src/components/data-display/tooltip'
import { StyledCheckbox } from 'src/components/inputs/checkbox'
import { resolveSx } from 'src/helpers/sx'

// Same wording as the app catalogs (`already_added`). Norwegian is the product default (`<html lang="no">`);
// the shell language switch writes `lang`, so English follows the page rather than a new prop.
const ALREADY_ADDED = { en: 'Already added', no: 'Allerede lagt til' } as const

const alreadyAddedLabel = (): string =>
    (typeof document === 'undefined' ? '' : document.documentElement.lang).toLowerCase().startsWith('en')
        ? ALREADY_ADDED.en
        : ALREADY_ADDED.no

// Only a checked checkbox that is also disabled is "already selected" and not pickable again.
// A checked enabled checkbox is a normal multi-select (FilterDropdown) and must stay silent.
const takenCheckbox = (node: ReactNode): boolean => {
    let taken = false
    Children.forEach(node, (child) => {
        if (taken || !isValidElement(child)) return
        if (child.type === StyledCheckbox) {
            const props = child.props as { checked?: boolean; disabled?: boolean }
            taken = props.checked === true && props.disabled === true
            return
        }
        const nested = (child.props as { children?: ReactNode }).children
        if (nested !== undefined && takenCheckbox(nested)) taken = true
    })
    return taken
}

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
     * Hover/focus hint. Optional. When omitted, a checked and disabled checkbox (an option that is
     * already selected and cannot be picked again) gets "Allerede lagt til", or "Already added" when
     * `<html lang>` is English. Pass this to use another phrase, such as "Already in use".
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

    const title = tooltip ?? (takenCheckbox(children) ? alreadyAddedLabel() : undefined)

    // StyledTooltip clones its child, so the `<li>` stays a direct `<ul>` child — no wrapper, no
    // broken list semantics. An absent title renders the row alone.
    return title ? (
        <StyledTooltip title={title} arrow placement='top'>
            {row}
        </StyledTooltip>
    ) : (
        row
    )
}
