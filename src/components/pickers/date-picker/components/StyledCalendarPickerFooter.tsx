import { useNavigation, type Matcher } from 'react-day-picker'
import { ChevronLeftIcon, ChevronRightIcon, StyledButton } from 'asma-core-ui'
import { Icon } from '@iconify/react'
import { isDate, isSameMonth } from 'date-fns'
import type { Dispatch, SetStateAction } from 'react'
import { compact, isArray, isObject } from 'lodash-es'
//import style from './StyledCalendarPicker.module.scss'

export const StyledCalendarPickerFooter: React.FC<{
    onClose: ((event: object, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined
    isNb: boolean
    selected: Matcher | Matcher[] | undefined
    removeSelection: (e: React.MouseEvent) => void
    onClear: (() => void) | undefined
    month: Date | undefined
    setMonth: Dispatch<SetStateAction<Date | undefined>>
}> = ({ onClose, isNb, selected, removeSelection, setMonth, month, onClear }) => {
    const { goToMonth, nextMonth, previousMonth } = useNavigation()
    const eraserDisabled = isArray(selected)
        ? !selected.length
        : isDate(selected)
        ? !selected
        : isObject(selected)
        ? !compact(Object.values(selected)).length
        : true

    return (
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', marginRight: '12px' }}>
            <StyledButton
                variant='text'
                onClick={(e) => {
                    onClear ? onClear() : removeSelection(e)
                    //
                    // to reset picker navigation
                    setMonth(new Date(Date.now()))
                }}
                size='small'
                disabled={eraserDisabled}
                dataTest='select-today'
                style={{ minWidth: '60px' }}
                startIcon={<Icon icon='ph:eraser-duotone' width={24} height={24} />}
            />
            {/* #TODO: `rdp-custom-caption-navigation` is not found nowhere in this project investigate why he is here and remove it if it is added by mistake */}
            <div className={'rdp-custom-caption-navigation'} style={{ display: 'flex', gap: '4px' }}>
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
                style={{ minWidth: '60px' }}
            >
                {isNb ? 'Velg' : 'Select'}
            </StyledButton>
        </div>
    )
}
