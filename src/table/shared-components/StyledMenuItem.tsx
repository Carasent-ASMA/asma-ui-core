import type { MouseEvent, ReactNode } from 'react'
import { cn } from 'src/table/helpers/cn'

export interface StyledMenuItemProps {
    children?: ReactNode
    disabled?: boolean
    selected?: boolean
    className?: string
    classes?: { root?: string }
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
    onMouseDown?: (event: MouseEvent<HTMLLIElement>) => void
    onMouseUp?: (event: MouseEvent<HTMLLIElement>) => void
}

/**
 * Table row-action menu item (replaces MUI `MenuItem`). Native `role="menuitem"`; disabled stays
 * focusable but non-interactive. TASK-404.
 */
export const StyledMenuItem = ({
    children,
    disabled,
    selected,
    className,
    classes,
    onClick,
    onMouseDown,
    onMouseUp,
}: StyledMenuItemProps): JSX.Element => (
    <li
        role='menuitem'
        aria-disabled={disabled ? true : undefined}
        tabIndex={-1}
        onClick={disabled ? undefined : onClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        className={cn(
            'flex items-center px-3 py-2.5 outline-none',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-delta-50',
            selected && 'bg-gama-50',
            classes?.root,
            className,
        )}
    >
        {children}
    </li>
)
