import { StyledInputField } from 'src/components/inputs/input-field'
import type { StyledTimePickerProps } from './types'
import { ClockOutlineIcon } from 'src/components/icons/clock-outline-icon'
import { type PopupState } from 'material-ui-popup-state/hooks'
import { HelperText } from './components/HelperText'
import type { ChangeEvent } from 'react'

export const TimePickerInput: React.FC<
    StyledTimePickerProps & {
        popupState: PopupState
        handleChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
        isValidTime: boolean
        localValue: string
    }
> = (props) => {
    const {
        placeholder,
        disabled,
        inputClassName,
        dataTest,
        width,
        error,
        helperText,
        label,
        locale = 'en',
        popupState,
        handleChange,
        isValidTime,
        localValue,
    } = props

    return (
        <StyledInputField
            // disable autofill
            name='password'
            autoComplete='off'
            type='text'
            //
            dataTest={dataTest}
            placeholder={placeholder}
            size='small'
            error={!isValidTime || error}
            helperText={
                <HelperText isValidTime={isValidTime} error={error} localization={locale} helperText={helperText} />
            }
            onChange={handleChange}
            InputProps={{
                endAdornment: (
                    <ClockOutlineIcon width={24} height={24} onClick={() => !disabled && popupState.open()} />
                ),
            }}
            value={localValue}
            sx={{
                maxWidth: width || 130,
                width,
                minWidth: width,
            }}
            disabled={disabled}
            className={inputClassName}
            label={label}
        />
    )
}
