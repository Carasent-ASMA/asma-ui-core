import { type Matcher } from 'react-day-picker'
import { StyledButton } from 'asma-core-ui'
import { Icon } from '@iconify/react'

export const StyledCalendarPickerFooter: React.FC<{
    onClose: ((event: object, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined
    isNb: boolean
    selected: Matcher | Matcher[] | undefined
    removeSelection: (e: React.MouseEvent) => void
}> = ({ onClose, isNb, selected, removeSelection }) => {
    return (
        <div className='mt-2 flex justify-between'>
            <StyledButton
                variant='text'
                onClick={(e) => {
                    removeSelection(e)
                }}
                disabled={!selected}
                dataTest='select-today'
                className='!min-w-[60px]'
                startIcon={<Icon icon='ph:eraser-duotone' width={24} height={24} />}
            />
            <StyledButton
                onClick={(e) => {
                    onClose?.(e, 'backdropClick')
                }}
                dataTest='select-today'
                className='!min-w-[60px]'
            >
                {isNb ? 'velg' : 'select'}
            </StyledButton>
        </div>
    )
}
