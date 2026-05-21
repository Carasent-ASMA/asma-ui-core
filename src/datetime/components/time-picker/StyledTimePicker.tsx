import { format, isBefore, isValid } from 'date-fns'
import PopupState from 'material-ui-popup-state'
import { useEffect, useState, type ChangeEvent } from 'react'
import { ClickAwayListener } from '@mui/material'
import { TimePickerPopper } from './TimePickerPopper'
import { getTimeFromValue } from './helpers/getTimeFromValue'
import { TimePickerInput } from './TimePickerInput'
import type { IPopupStateType, StyledTimePickerProps } from './types'

export const StyledTimePicker: React.FC<StyledTimePickerProps> = (props) => {
    const { value, onSelect, notBeforeTime } = props
    const [localValue, setLocalValue] = useState(value ? format(value, 'HH:mm') : '')
    const [isValidTime, setIsValidTime] = useState(true)

    const [isValidEndTime, setIsValidEndTime] = useState(true)

    useEffect(() => {
        setLocalValue(value ? format(value, 'HH:mm') : '')
    }, [value])

    const checkValidEndTime = (next?: Date) => {
        const ok = !next || !notBeforeTime || !isValid(notBeforeTime) || !isBefore(next, notBeforeTime)
        setIsValidEndTime(ok)
        return ok
    }

    useEffect(() => {
        checkValidEndTime(value)
    }, [value, notBeforeTime])

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, popupState: IPopupStateType) => {
        const nextValue = e.target.value

        setLocalValue(nextValue)

        if (nextValue.length !== 5) {
            setIsValidTime(false)
            return
        }

        const validTime = getTimeFromValue(nextValue, value)

        if (!validTime) {
            onSelect(undefined)
            setIsValidTime(false)
            setIsValidEndTime(true)
            return
        }

        setIsValidTime(true)
        const isNotBeforeStartTime = checkValidEndTime(validTime)

        if (isNotBeforeStartTime) {
            onSelect(validTime)
            popupState.close()
        } else {
            onSelect(undefined)
        }
    }

    const handleSelect = (selectedTime: Date | undefined /* , popupState?: IPopupStateType */) => {
        setIsValidTime(true)

        if (checkValidEndTime(selectedTime)) onSelect(selectedTime)
        setLocalValue(selectedTime ? format(selectedTime, 'HH:mm') : '')
    }

    const handleClear = () => {
        onSelect(undefined)
        setLocalValue('')
        setIsValidTime(true)
    }

    return (
        <PopupState variant='popper' popupId='time-picker-popper'>
            {(popupState) => {
                if (props.disabled || props.readOnly)
                    return (
                        <TimePickerInput
                            {...props}
                            popupState={popupState}
                            localValue={localValue}
                            isValidTime={isValidTime}
                            isValidEndTime={isValidEndTime}
                            handleChange={(e) => handleChange(e, popupState)}
                        />
                    )

                return (
                    <ClickAwayListener mouseEvent='onMouseDown' onClickAway={() => popupState.close()}>
                        <div className='w-auto h-auto relative'>
                            <div className='flex items-center justify-center h-fit m-0 p-0'>
                                <TimePickerInput
                                    {...props}
                                    popupState={popupState}
                                    localValue={localValue}
                                    isValidTime={isValidTime}
                                    isValidEndTime={isValidEndTime}
                                    handleChange={(e) => handleChange(e, popupState)}
                                />
                            </div>
                            {popupState.isOpen && (
                                <TimePickerPopper
                                    {...props}
                                    popupState={popupState}
                                    handleClear={handleClear}
                                    onSelect={(time) => handleSelect(time)}
                                />
                            )}
                        </div>
                    </ClickAwayListener>
                )
            }}
        </PopupState>
    )
}
