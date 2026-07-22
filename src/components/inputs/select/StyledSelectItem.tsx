import type { MouseEvent, ReactNode } from 'react'
import { CheckIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'

export interface StyledSelectItemProps {
    value?: unknown
    children?: ReactNode
    selected?: boolean
    disabled?: boolean
    className?: string
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
}

/**
 * Option row for `StyledSelect` (replaces MUI `MenuItem` in the select context). `role="option"`
 * with a leading check column for the selected state. Public props preserved (DEC-003). TASK-402.
 */
export const StyledSelectItem = ({
    children,
    selected,
    disabled,
    className,
    onClick,
}: StyledSelectItemProps): JSX.Element => (
    <li
        role='option'
        aria-selected={selected ? true : undefined}
        aria-disabled={disabled ? true : undefined}
        tabIndex={-1}
        onClick={disabled ? undefined : onClick}
        className={cn(
            // Figma Menus item (node 16073-19226) label = Body Base 16/lh24 (`text-base`), not 14px.
            'flex items-center gap-1 px-2 py-2.5 text-base outline-none',
            disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-pointer hover:bg-delta-50',
            selected && 'bg-gama-50',
            className,
        )}
    >
        <span className='flex w-6 justify-center'>
            {selected && <CheckIcon width={22} height={22} className='text-gama-500' />}
        </span>
        <span className='min-w-0 flex-1 truncate'>{children}</span>
    </li>
)
