import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'

export interface StyledMenuItemProps {
    children?: ReactNode
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
    disabled?: boolean
    selected?: boolean
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
    disabled,
    selected,
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
            onKeyDown={handleKeyDown}
            className={cn(
                'flex items-center px-3 py-2.5 outline-none',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-delta-50',
                selected && cn('bg-gama-50', classes?.selected),
                classes?.root,
                className,
            )}
            style={resolveSx(sx)}
        >
            {children}
        </li>
    )
}
