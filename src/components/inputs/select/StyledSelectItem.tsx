import type { MouseEvent, ReactNode } from 'react'
import { CheckIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'

export interface StyledSelectItemProps {
    id?: string
    value?: unknown
    children?: ReactNode
    selected?: boolean
    active?: boolean
    disabled?: boolean
    className?: string
    onClick?: (event: MouseEvent<HTMLLIElement>) => void
}

/**
 * Option row for `StyledSelect` (replaces MUI `MenuItem` in the select context). `role="option"`
 * with a leading check column for the selected state. Public props preserved (DEC-003). TASK-402.
 */
export const StyledSelectItem = ({
    id,
    children,
    selected,
    active,
    disabled,
    className,
    onClick,
}: StyledSelectItemProps): JSX.Element => (
    // The combobox trigger keeps DOM focus and controls this option through aria-activedescendant;
    // this row only renders that active state and receives mouse selection.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
        id={id}
        role='option'
        aria-selected={selected ? true : undefined}
        aria-disabled={disabled ? true : undefined}
        tabIndex={-1}
        onMouseDown={(event) => event.preventDefault()}
        onClick={disabled ? undefined : onClick}
        className={cn(
            // Figma Menus item (node 16073-19226) label = Body Base 16/lh24 (`text-base`), not 14px,
            // in text/delta-800 — same as the DynamicSelect option row (don't inherit page black).
            'relative flex items-center gap-1 px-2 py-2.5 text-base outline-none',
            disabled ? 'cursor-not-allowed text-delta-300' : 'cursor-pointer text-delta-800 hover:bg-delta-50',
            selected && 'bg-gama-50',
            className,
        )}
    >
        {active && (
            // Absolutely positioned so the 4px active border cannot change the option's content box.
            <span
                aria-hidden='true'
                data-select-active-indicator
                className='pointer-events-none absolute inset-y-0 left-0 border-l border-solid border-focus-ring'
            />
        )}
        <span className='flex w-6 justify-center'>
            {selected && <CheckIcon width={22} height={22} className='text-gama-500' />}
        </span>
        {/* Two lines, then ellipsis (ASMA-7847) — see StyledSelectAutocomplete's option label. */}
        <span className='line-clamp-2 min-w-0 flex-1 break-words'>{children}</span>
    </li>
)
