import React from 'react'
import { cn } from 'src/datetime/helpers/cn'
import { StyledButton } from 'src/datetime/shared-components/button'
import { OutlineCalendarMonth } from 'src/datetime/shared-components/OutlineCalendarMonth'

interface DatePickerButtonProps {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
    disabled?: boolean
}

export const DatePickerButton: React.FC<DatePickerButtonProps> = ({ onClick, disabled }) => {
    return (
        <StyledButton
            type='button'
            size='large'
            dataTest='DatePickerButton'
            startIcon={<OutlineCalendarMonth width={24} height={24} />}
            variant='outlined'
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => !disabled && onClick(event)}
            className={cn(disabled && 'cursor-not-allowed')}
        />
    )
}
