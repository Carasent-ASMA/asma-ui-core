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
    // Not independently focusable (tabIndex=-1) — keyboard selection is handled centrally by the
    // parent listbox's onKeyDown (arrow keys move programmatic focus; Enter/Space calls
    // document.activeElement.click(), see StyledSelect's handleKeyDown). onClick here is mouse-only.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
        role='option'
        aria-selected={selected ? true : undefined}
        aria-disabled={disabled ? true : undefined}
        tabIndex={-1}
        onClick={disabled ? undefined : onClick}
        className={cn(
            // Figma Menus item (node 16073-19226) label = Body Base 16/lh24 (`text-base`), not 14px,
            // in text/delta-800 — same as the DynamicSelect option row (don't inherit page black).
            'flex items-center gap-1 px-2 py-2.5 text-base outline-none',
            // Figma Menus (node 34522-151497): `border/separator` rule between rows, none after the last.
            'border-0 border-b border-solid border-delta-200 last:border-b-0',
            disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-pointer text-delta-800 hover:bg-delta-50',
            selected && 'bg-gama-50',
            className,
        )}
    >
        <span className='flex w-6 justify-center'>
            {selected && <CheckIcon width={22} height={22} className='text-gama-500' />}
        </span>
        {/* Two lines, then ellipsis (ASMA-7847) — see StyledSelectAutocomplete's option label. */}
        <span className='line-clamp-2 min-w-0 flex-1 break-words'>{children}</span>
    </li>
)
