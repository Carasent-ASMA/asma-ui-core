import { format } from 'date-fns'
import PopupState from 'material-ui-popup-state'
//import style from './StyledTimePicker.module.scss'
import { useState, type ChangeEvent } from 'react'
import { ClickAwayListener } from '@mui/material'
import { bindTrigger } from 'material-ui-popup-state/hooks'
import { TimePickerPopper } from './TimePickerPopper'
import type { StyledTimePickerProps } from './types'
import { getTimeFromValue } from './helpers/getTimeFromValue'
import { TimePickerInput } from './TimePickerInput'

export const StyledTimePicker: React.FC<StyledTimePickerProps> = (props) => {
    const { value, onSelect } = props

    const [localValue, setLocalValue] = useState(value ? format(value, 'HH:mm') : '')
    const [isValidTime, setIsValidTime] = useState(true)

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const nextValue = e.target.value

        setLocalValue(nextValue)

        const validTime = getTimeFromValue(nextValue)

        if (validTime) {
            onSelect(validTime)
        } else {
            onSelect(undefined)
        }

        setIsValidTime(!!validTime)
    }

    const handleSelect = (value: Date | undefined) => {
        onSelect(value)
        setLocalValue(value ? format(value, 'HH:mm') : '')
        setIsValidTime(true)
    }

    const handleClear = () => {
        onSelect(undefined)
        setLocalValue('')
        setIsValidTime(true)
    }

    return (
        <PopupState variant='popper' popupId='time-picker-popper'>
            {(popupState) => (
                <ClickAwayListener
                    mouseEvent='onMouseDown'
                    onClickAway={() => {
                        popupState.close()
                    }}
                >
                    <div style={{ width: 'auto', height: 'auto', position: 'relative' }}>
                        <div {...bindTrigger(popupState)}>
                            <TimePickerInput
                                {...props}
                                popupState={popupState}
                                localValue={localValue}
                                isValidTime={isValidTime}
                                handleChange={handleChange}
                            />
                        </div>
                        {popupState.isOpen && (
                            <TimePickerPopper
                                {...props}
                                popupState={popupState}
                                handleClear={handleClear}
                                onSelect={handleSelect}
                            />
                        )}
                    </div>
                </ClickAwayListener>
            )}
        </PopupState>
    )
}
