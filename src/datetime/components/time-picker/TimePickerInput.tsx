import type { StyledTimePickerProps } from './types'
import { type PopupState } from 'src/hooks/usePopupState'
import { HelperText, defaultTimePickerHelperMessages } from './components/HelperText'
import { useRef, type ChangeEvent, useEffect, useId, type MouseEvent as ReactMouseEvent } from 'react'
import { StyledInputField } from 'src/datetime/shared-components/StyledInputField'
import { ClockOutlineIcon } from 'src/datetime/shared-components/ClockOutlineIcon'
import { useInputMask } from 'src/helpers/inputMask'
import { getTitleLabelling } from 'src/datetime/helpers/getTitleLabelling'
import { fieldLabelAboveClass } from 'src/components/inputs/field-styles'
import { timePickerWidthProps } from './helpers/timePickerWidth'

export const TimePickerInput: React.FC<
    StyledTimePickerProps & {
        popupState: PopupState
        handleChange: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
        handleBlur?: () => void
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
        handleBlur,
        isValidTime,
        isValidEndTime,
        localValue,
        title,
        readOnly: readOnlyProp,
        lockedReason,
        inputAriaProps,
    } = props
    const readOnly = Boolean(readOnlyProp) || Boolean(lockedReason)

    const inputRef = useInputMask({
        mask: 'xx:xx',
        maskChar: 'x',
        showMask: false,
    })

    const hasError = !isValidTime || !isValidEndTime || !!error
    const inputRootRef = useRef<HTMLDivElement | null>(null)
    const titleId = useId()

    useEffect(() => {
        if (inputRootRef.current) {
            popupState.setAnchorEl(inputRootRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div {...timePickerWidthProps(width)}>
            {title && (
                <div id={titleId} className={fieldLabelAboveClass({ disabled })}>
                    {title}
                </div>
            )}
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
                        messages={defaultTimePickerHelperMessages}
                    />
                }
                onChange={handleChange}
                onBlur={handleBlur}
                slotProps={{
                    htmlInput: getTitleLabelling({ title, titleId, label, inputAriaProps }),
                    input: {
                        ref: inputRootRef,
                        onClick: (e: ReactMouseEvent<HTMLElement>) => {
                            if (!disabled && !readOnly) popupState.open(e)
                        },
                        endAdornment: !lockedReason && (
                            <ClockOutlineIcon
                                width={24}
                                height={24}
                                // DS field trailing icon = delta-700 (matches select/autocomplete chevrons
                                // + search-field icons); delta-800 read as near-black. Muted when disabled.
                                className={disabled ? 'text-delta-300' : 'text-delta-700'}
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
                sx={typeof width === 'number' ? { maxWidth: width, width, minWidth: width } : undefined}
                disabled={disabled}
                readOnly={readOnly}
                lockedReason={lockedReason}
                className={inputClassName}
                label={label}
            />
        </div>
    )
}
