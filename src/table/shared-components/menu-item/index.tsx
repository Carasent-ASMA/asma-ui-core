import type { MouseEvent, ReactNode } from 'react'
import { cn } from 'src/table/helpers/cn'
import { CheckIcon } from '../CheckIcon'

export interface MenuItemProps {
    children?: ReactNode
    selected?: boolean
    disabled?: boolean
    className?: string
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
}

/**
 * Table menu item with a leading check column (replaces MUI `MenuItem`). Native `role="menuitem"`.
 * TASK-404.
 */
export const StyledMenuItem = ({ children, selected, disabled, className, onClick }: MenuItemProps): JSX.Element => (
    <li
        role='menuitem'
        aria-disabled={disabled ? true : undefined}
        tabIndex={-1}
        onClick={disabled ? undefined : onClick}
        className={cn(
            'flex items-center gap-x-1 p-2 text-base text-delta-700 outline-none',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-delta-50',
            selected && 'bg-gama-50 hover:bg-gama-50',
            className,
        )}
    >
        <CheckIcon
            width={24}
            height={24}
            color={selected ? 'var(--colors-gama-500)' : 'transparent'}
            style={{ transition: 'color 0.2s ease' }}
        />
        {children}
    </li>
)
