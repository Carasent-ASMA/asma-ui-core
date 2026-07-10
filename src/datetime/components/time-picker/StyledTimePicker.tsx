import { format, isBefore, isValid } from 'date-fns'
import { PopupState as PopupStateProvider } from 'src/hooks/usePopupState'
import { useState, type ChangeEvent } from 'react'
import { ClickAwayListener } from 'src/components/mui-compat'
import { TimePickerPopper } from './TimePickerPopper'
import { getTimeFromValue } from './helpers/getTimeFromValue'
import { TimePickerInput } from './TimePickerInput'
import type { PopupState } from 'src/hooks/usePopupState'
import type { StyledTimePickerProps } from './types'

export const StyledTimePicker: React.FC<StyledTimePickerProps> = (props) => {
    const { value, onSelect, notBeforeTime } = props
    const externalValue = value ? format(value, 'HH:mm') : ''
    const [localValue, setLocalValue] = useState(externalValue)
    const [isDirty, setIsDirty] = useState(false)
    const [isValidTime, setIsValidTime] = useState(true)
    const resolvedLocalValue = isDirty ? localValue : externalValue

    const checkValidEndTime = (next?: Date) => {
        return !next || !notBeforeTime || !isValid(notBeforeTime) || !isBefore(next, notBeforeTime)
    }

    const parsedLocalTime = resolvedLocalValue.length === 5 ? getTimeFromValue(resolvedLocalValue, value) : null
    const isValidEndTime = parsedLocalTime ? checkValidEndTime(parsedLocalTime) : true

    const closePopup = (popupState: PopupState): void => {
        const close = (popupState as { close?: (() => void) }).close
        close?.()
    }

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, popupState: PopupState) => {
        const nextValue = e.target.value

        setIsDirty(true)
        setLocalValue(nextValue)

        if (nextValue.length !== 5) {
            setIsValidTime(false)
            return
        }

        const validTime = getTimeFromValue(nextValue, value)

        if (!validTime) {
            onSelect(undefined)
            setIsValidTime(false)
            return
        }

        setIsValidTime(true)
        const isNotBeforeStartTime = checkValidEndTime(validTime)

        if (isNotBeforeStartTime) {
            onSelect(validTime)
            setIsDirty(false)
            closePopup(popupState)
        } else {
            onSelect(undefined)
        }
    }

    const handleSelect = (selectedTime: Date | undefined /* , popupState?: IPopupStateType */) => {
        setIsValidTime(true)

        if (checkValidEndTime(selectedTime)) {
            onSelect(selectedTime)
            setLocalValue(selectedTime ? format(selectedTime, 'HH:mm') : '')
            setIsDirty(false)
            return
        }

        onSelect(undefined)
        setLocalValue(selectedTime ? format(selectedTime, 'HH:mm') : '')
        setIsDirty(true)
    }

    const handleClear = () => {
        onSelect(undefined)
        setLocalValue('')
        setIsDirty(false)
        setIsValidTime(true)
    }

    return (
        <PopupStateProvider variant='popper' popupId='time-picker-popper'>
            {(popupState) => {
                if (props.disabled || props.readOnly)
                    return (
                        <TimePickerInput
                            {...props}
                            popupState={popupState}
                            localValue={resolvedLocalValue}
                            isValidTime={isValidTime}
                            isValidEndTime={isValidEndTime}
                            handleChange={(e) => handleChange(e, popupState)}
                        />
                    )

                return (
                    <ClickAwayListener mouseEvent='onMouseDown' onClickAway={() => closePopup(popupState)}>
                        <div className='relative h-auto w-auto'>
                            <div className='m-0 flex h-fit items-center justify-center p-0'>
                                <TimePickerInput
                                    {...props}
                                    popupState={popupState}
                                    localValue={resolvedLocalValue}
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
        </PopupStateProvider>
    )
}
