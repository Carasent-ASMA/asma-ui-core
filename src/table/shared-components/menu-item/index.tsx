import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { cn } from 'src/table/helpers/cn'
import { pressedStateHandlers } from 'src/helpers/pressedState'
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
export const StyledMenuItem = ({ children, selected, disabled, className, onClick }: MenuItemProps): JSX.Element => {
    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>): void => {
        if (disabled) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            // Once per press: a held key's auto-repeat activates nothing.
            if (event.repeat) return
            onClick?.(event as unknown as MouseEvent<HTMLLIElement>)
        }
    }

    return (
        <li
            role='menuitem'
            aria-disabled={disabled ? true : undefined}
            tabIndex={-1}
            onClick={disabled ? undefined : onClick}
            onKeyDown={handleKeyDown}
            {...pressedStateHandlers({ enabled: !disabled })}
            className={cn(
                // Figma Menus item, Type=Check mark (16048:31636): 40px row, 8px padding, 4px gap, 20px check.
                'flex items-center gap-x-1 p-2 text-base text-delta-700 outline-none',
                'asma-touch-ready',
                // Figma Disabled: text-icon/disabled. Pressed state (47847-229830): at once in, 150ms ease-out back only after a
                // press; hover and selection keep master's timing (none). @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
                disabled
                    ? 'cursor-not-allowed aria-disabled:text-delta-300'
                    : 'group/item cursor-pointer data-[pressed]:text-gama-700 data-[pressed]:[--control-pressed-accent:var(--colors-gama-700)] data-[press-released]:transition-colors data-[press-released]:duration-150 data-[press-released]:ease-[ease-out] hover:bg-delta-50 forced-colors:data-[pressed]:![outline-offset:-2px] forced-colors:data-[pressed]:![outline:2px_solid_Highlight] [&[role][data-pressed]]:bg-gama-200',
                // Figma Selected=on: bg/selected (gama-25), hover bg/hover-selected (gama-50).
                selected && 'bg-gama-25 hover:bg-gama-50',
                className,
            )}
        >
            <CheckIcon
                width={20}
                height={20}
                color={selected ? 'var(--colors-gama-500)' : 'transparent'}
                // Master's `color 0.2s ease`. A selected row's check follows the pressed label (any CSS rule beats the `color`
                // attribute): at once in, 150ms ease-out back.
                className={cn(
                    '[transition:color_0.2s_ease]',
                    selected &&
                        !disabled &&
                        'group-data-[pressed]/item:text-gama-700 group-data-[pressed]/item:transition-none group-data-[press-released]/item:[transition:color_150ms_ease-out]',
                )}
            />
            <span className='pr-2'>{children}</span>
        </li>
    )
}
