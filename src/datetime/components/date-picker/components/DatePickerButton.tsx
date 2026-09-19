import React from 'react'
import { cn } from 'src/datetime/helpers/cn'
import { StyledButton } from 'src/datetime/shared-components/button'
import { OutlineCalendarMonth } from 'src/datetime/shared-components/OutlineCalendarMonth'

interface DatePickerButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    disabled?: boolean
    /** Locale code (e.g. `nb`) for the icon-only button's accessible name. */
    localeCode?: string
}

export const DatePickerButton: React.FC<DatePickerButtonProps> = ({ onClick, disabled, localeCode }) => {
    return (
        <StyledButton
            type='button'
            size='large'
            dataTest='DatePickerButton'
            aria-label={localeCode?.startsWith('nb') ? 'Åpne kalender' : 'Open calendar'}
            startIcon={<OutlineCalendarMonth width={24} height={24} />}
            variant='outlined'
            // Forward `disabled` to the native <button> so it's actually non-focusable/non-clickable
            // with the disabled styling — not just a click guard — when the date picker is disabled.
            disabled={disabled}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => !disabled && onClick(event)}
            // Figma gives this button a flat 40x40. `large` only sets a height, so its 8px padding
            // plus the 1px border grew it to 42 — `box-border` is required because the package
            // disables Tailwind preflight, leaving box-sizing at content-box.
            className={cn('box-border w-[40px] px-0', disabled && 'cursor-not-allowed')}
        />
    )
}
