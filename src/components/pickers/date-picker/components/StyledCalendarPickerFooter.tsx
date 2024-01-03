import { useNavigation, type Matcher } from 'react-day-picker'
import { ChevronLeftIcon, ChevronRightIcon, StyledButton } from 'asma-core-ui'
import { Icon } from '@iconify/react'
import { isDate, isSameMonth } from 'date-fns'
import type { Dispatch, SetStateAction } from 'react'
import { compact, isArray, isObject } from 'lodash-es'

export const StyledCalendarPickerFooter: React.FC<{
    onClose: ((event: object, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined
    isNb: boolean
    selected: Matcher | Matcher[] | undefined
    removeSelection: (e: React.MouseEvent) => void
    month: Date | undefined
    setMonth: Dispatch<SetStateAction<Date | undefined>>
}> = ({ onClose, isNb, selected, removeSelection, setMonth, month }) => {
    const { goToMonth, nextMonth, previousMonth } = useNavigation()
    const eraserDisabled = isArray(selected)
        ? !selected.length
        : isDate(selected)
        ? !selected
        : isObject(selected)
        ? !compact(Object.values(selected)).length
        : true

    return (
        <div className='mt-2 flex justify-between mr-3'>
            <StyledButton
                variant='text'
                onClick={(e) => {
                    removeSelection(e)
                }}
                size='small'
                disabled={eraserDisabled}
                dataTest='select-today'
                className='!min-w-[60px]'
                startIcon={<Icon icon='ph:eraser-duotone' width={24} height={24} />}
            />
            <div className='rdp-custom-caption-navigation flex gap-1'>
                <StyledButton
                    variant='outlined'
                    size='small'
                    dataTest='previous-month'
                    disabled={!previousMonth}
                    onClick={() => previousMonth && goToMonth(previousMonth)}
                    startIcon={<ChevronLeftIcon />}
                />
                <StyledButton
                    size='small'
                    disabled={month && isSameMonth(new Date(Date.now()), month)}
                    onClick={() => {
                        setMonth(new Date(Date.now()))
                    }}
                    variant='outlined'
                    dataTest='select-today'
                    className='!disabled:cursor-default'
                >
                    {isNb ? 'I dag' : 'Today'}
                </StyledButton>
                <StyledButton
                    variant='outlined'
                    size='small'
                    dataTest='next-month'
                    disabled={!nextMonth}
                    onClick={() => nextMonth && goToMonth(nextMonth)}
                    startIcon={<ChevronRightIcon />}
                ></StyledButton>
            </div>
            <StyledButton
                size='small'
                onClick={(e) => {
                    onClose?.(e, 'backdropClick')
                }}
                dataTest='select-today'
                className='!min-w-[60px]'
            >
                {isNb ? 'Velg' : 'Select'}
            </StyledButton>
        </div>
    )
}
