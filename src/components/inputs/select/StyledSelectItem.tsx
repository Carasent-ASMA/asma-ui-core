import type { MouseEvent, ReactNode } from 'react'
import { CheckIcon } from 'src/components/icons'
import { cn } from 'src/helpers/cn'
import { pressedStateHandlers } from 'src/helpers/pressedState'

export interface StyledSelectItemProps {
    value?: unknown
    /** Needed when a parent listbox points `aria-activedescendant` at this row. */
    id?: string
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
        aria-selected={selected ? true : false}
        aria-disabled={disabled ? true : undefined}
        tabIndex={-1}
        onMouseDown={(event) => event.preventDefault()}
        onClick={disabled ? undefined : onClick}
        {...pressedStateHandlers({ enabled: !disabled })}
        className={cn(
            // Figma Menus item Type=Check mark (16073:20261): Body Base 16/lh24 in text-icon/body (delta-700),
            // 8px left / 16px right, a 20px check, gap 4, a 1px border/separator between rows.
            // ASMA-8220 (TB-14) touch fixes; also covers CountryCodeOptions, which renders this component.
            'asma-touch-ready',
            // h40 = py8 + Body Base lh24.
            'relative box-border flex min-h-10 items-center gap-1 py-2 pl-2 pr-4 text-base outline-none [&:not(:last-child)]:shadow-[inset_0_-1px_0_0_var(--colors-delta-200)]',
            disabled
                ? 'cursor-not-allowed text-delta-300'
                : cn(
                      // Figma Menus item: hover bg/hover-default; selected bg/selected, hovered bg/hover-selected.
                      'group/option cursor-pointer text-delta-700',
                      selected ? 'hover:bg-gama-50' : 'hover:bg-delta-50',
                      // ASMA-9003: the menu item's pressed look. @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
                      'data-[pressed]:text-gama-700 data-[pressed]:[--control-pressed-accent:var(--colors-gama-700)] data-[press-released]:transition-colors data-[press-released]:duration-150 data-[press-released]:ease-[ease-out] forced-colors:data-[pressed]:![outline-offset:-2px] forced-colors:data-[pressed]:![outline:2px_solid_Highlight] [&[data-pressed][role]]:bg-gama-200',
                  ),
            selected && 'bg-gama-25',
            className,
        )}
    >
        {active && (
            // Absolutely positioned so the 4px active border cannot change the option's content box.
            <span
                aria-hidden='true'
                data-select-active-indicator
                className='border-l-solid pointer-events-none absolute inset-y-0 left-0 border-l-[3px] border-focus-ring'
            />
        )}
        <span className='flex w-5 justify-center'>
            {selected && (
                <CheckIcon
                    width={20}
                    height={20}
                    className='text-gama-500 group-data-[pressed]/option:text-gama-700 group-data-[press-released]/option:transition-colors group-data-[press-released]/option:duration-150 group-data-[press-released]/option:ease-[ease-out]'
                />
            )}
        </span>
        {/* Two lines, then ellipsis (ASMA-7847) — see StyledSelectAutocomplete's option label. */}
        <span className='line-clamp-2 min-w-0 flex-1 break-words'>{children}</span>
    </li>
)
