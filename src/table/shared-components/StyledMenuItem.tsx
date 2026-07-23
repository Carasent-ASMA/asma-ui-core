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
            // Figma "Menus item / Only Label" (wXrXt5uKNNzV2DnQCgyYZH 16045-31269): resting text is
            // text-icon/body #49525f (delta-700), NOT the inherited near-black; hover fill is delta-50.
            'flex items-center px-3 py-2.5 text-delta-700 outline-none',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-delta-50',
            selected && 'bg-gama-50',
            classes?.root,
            className,
            // Disabled = text-icon/disabled #bdc4cf (delta-300). `cn` here is plain clsx (no
            // tailwind-merge), so `!` forces the grey to win over a custom action colour (e.g. a
            // disabled destructive `text-error-500` item) regardless of stylesheet order.
            disabled && '!text-delta-300',
        )}
    >
        {children}
    </li>
)
