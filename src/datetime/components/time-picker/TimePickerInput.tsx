import type { StyledTimePickerProps } from './types'
import { type PopupState } from 'src/hooks/usePopupState'
import { HelperText } from './components/HelperText'
import { useRef, type ChangeEvent, useEffect, type MouseEvent as ReactMouseEvent } from 'react'
import { StyledInputField } from 'src/datetime/shared-components/StyledInputField'
import { ClockOutlineIcon } from 'src/datetime/shared-components/ClockOutlineIcon'
import { useInputMask } from 'src/helpers/inputMask'

export const TimePickerInput: React.FC<
    StyledTimePickerProps & {
        popupState: PopupState
        handleChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
        isValidTime: boolean
        isValidEndTime: boolean
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
        isValidEndTime,
        localValue,
        title,
        readOnly,
    } = props

    const inputRef = useInputMask({
        mask: 'xx:xx',
        maskChar: 'x',
        showMask: false,
    })

    const hasError = !isValidTime || !isValidEndTime || !!error
    const inputRootRef = useRef<HTMLDivElement | null>(null)


    useEffect(() => {
        if (inputRootRef.current) {
            popupState.setAnchorEl(inputRootRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div style={{ height: readOnly ? '40px' : '75px' }}>
            {title && <div className='pb-1 font-roboto font-semibold text-delta-800'>{title}</div>}
            <StyledInputField
                inputRef={inputRef}
                autoComplete='off'
                type='text'
                dataTest={dataTest}
                data-testid={dataTest}
                placeholder={placeholder}
                size='small'
                error={hasError}
                helperText={
                    <HelperText
                        isValidTime={isValidTime}
                        isValidEndTime={isValidEndTime}
                        error={hasError}
                        localization={locale}
                        helperText={helperText}
                    />
                }
                onChange={handleChange}
                slotProps={{
                    input: {
                        ref: inputRootRef,
                        onMouseDown: (e: ReactMouseEvent<HTMLElement>) => {
                            if (!disabled && !readOnly) popupState.open(e)
                        },
                        endAdornment: (
                            <ClockOutlineIcon
                                width={24}
                                height={24}
                                onClick={(event: ReactMouseEvent<SVGSVGElement>) => {
                                    event.stopPropagation()
                                    if (!disabled && !readOnly) popupState.open(event)
                                }}
                            />
                        ),
                    },
                    formHelperText: {
                        className: hasError
                            ? 'ml-0 mr-[14px] mt-1 leading-[23.24px]'
                            : 'mx-[14px] mt-1 leading-[23.24px]',
                        hideErrorIcon: true,
                    },
                }}
                value={localValue}
                sx={{
                    maxWidth: width ?? 130,
                    width,
                    minWidth: width,
                }}
                disabled={disabled}
                readOnly={readOnly}
                className={inputClassName}
                label={label}
            />
        </div>
    )
}
