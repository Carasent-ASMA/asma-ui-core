import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#16073-19226
 * Figma "Menus item" (h40, label 16px text-icon/body). Figma **State** (Enabled/Hover/Selected/
 * Disabled) ← native hover + `selected`/`disabled`; **Type** (Only Label/Icon/Checkbox/Check mark)
 * is expressed via `children`. Selected bg = `gama-50`, hover bg = `delta-50`.
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

    return (
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
                // Figma Menus item (node 16073-19226): h40, py8, label Body Base 16px text-icon/body
                // (delta-700); hover delta-50; selected gama-50.
                'box-border flex items-center px-4 text-base outline-none',
                dense ? 'min-h-8 py-1' : 'min-h-10 py-2',
                // Figma Disabled menu item = muted text-icon/disabled (delta-300); enabled = text-icon/body (delta-700).
                disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-pointer text-delta-700 hover:bg-delta-50',
                selected && cn('bg-gama-50', classes?.selected),
                classes?.root,
                className,
            )}
            style={{ fontFamily: 'Roboto, Helvetica, Arial, sans-serif', ...resolveSx(sx) }}
        >
            {children}
        </li>
    )
}
