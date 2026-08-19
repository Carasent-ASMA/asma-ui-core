import { useNavigation, type Matcher } from 'react-day-picker'
import { isDate, isValid } from 'date-fns'
import type { Dispatch, SetStateAction } from 'react'

import { ChevronLeftIcon } from 'src/datetime/shared-components/ChevronLeftIcon'
import { ChevronRightIcon } from 'src/datetime/shared-components/ChevronRightIcon'
import { StyledButton } from 'src/datetime/shared-components/button'

export const StyledCalendarPickerFooter: React.FC<{
    onClose: ((event: object, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined
    isNb: boolean
    selected: Matcher | Matcher[] | undefined
    removeSelection: (e: React.MouseEvent) => void
    onClear: (() => void) | undefined
    required?: boolean
    month: Date | undefined
    setMonth: Dispatch<SetStateAction<Date | undefined>>
}> = ({ onClose, isNb, selected, removeSelection, setMonth, onClear, required }) => {
    const { nextMonth, previousMonth } = useNavigation()
    const hasSelection = (() => {
        if (selected == null) return false
        if (Array.isArray(selected)) return selected.length > 0
        if (isDate(selected)) return isValid(selected)
        if (typeof selected === 'object') return Object.values(selected).some(Boolean)
        return true
    })()

    const eraserDisabled = !!required || !hasSelection

    return (
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <StyledButton
                dataTest=''
                variant='text'
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    if (onClear) {
                        onClear()
                    } else {
                        removeSelection(event)
                    }
                    // to reset picker navigation
                    setMonth(new Date(Date.now()))
                }}
                size='small'
                disabled={eraserDisabled}
                style={{ minWidth: '60px' }}
            >
                {isNb ? 'Nullstill' : 'Clear'}
            </StyledButton>
            <div style={{ display: 'flex', gap: 8 }}>
                <StyledButton
                    dataTest=''
                    variant='outlined'
                    size='small'
                    disabled={!previousMonth}
                    onClick={() => {
                        if (previousMonth) {
                            setMonth(previousMonth)
                        }
                    }}
                    style={{ minWidth: '25px' }}
                >
                    <ChevronLeftIcon width={20} height={20} />
                </StyledButton>
                <StyledButton
                    dataTest=''
                    size='small'
                    // disabled={month && isSameMonth(new Date(Date.now()), month)}
                    onClick={() => {
                        setMonth(new Date(Date.now()))
                    }}
                    variant='outlined'
                >
                    {isNb ? 'I dag' : 'Today'}
                </StyledButton>
                <StyledButton
                    dataTest=''
                    variant='outlined'
                    size='small'
                    disabled={!nextMonth}
                    onClick={() => {
                        if (nextMonth) {
                            setMonth(nextMonth)
                        }
                    }}
                    style={{ minWidth: '25px' }}
                >
                    <ChevronRightIcon width={20} height={20} />
                </StyledButton>
            </div>
            <StyledButton
                dataTest=''
                variant='contained'
                size='small'
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    onClose?.(event, 'backdropClick')
                }}
                style={{ minWidth: '60px' }}
            >
                {isNb ? 'Velg' : 'Select'}
            </StyledButton>
        </div>
    )
}
