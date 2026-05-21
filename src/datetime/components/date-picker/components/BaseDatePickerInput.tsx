import { StyledInputField } from 'src/datetime/shared-components/StyledInputField'
import { DatePickerButton } from './DatePickerButton'
import { useDatePickerMask } from '../hooks/useDatePickerMask'
import { useEffect, useState } from 'react'
import { getValue } from '../helpers'
import { useDatePickerValidation } from '../hooks/useDatePickerValidation'
import { parse, isValid as isValidDateFns } from 'date-fns'
import type { DayPickerProps as ReactDayPickerProps, Matcher } from 'react-day-picker'
import { cn } from 'src/datetime/helpers/cn'
import { HelperTextWithTooltip } from './HelperTextWithTooltip'

export interface IBaseDatePickerInput {
    dataTest: string
    inputClassName?: string
    disabled: boolean
    readOnly?: boolean
    onClick: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void
    selected: Date | undefined
    dateFormat?: string
    hideCalendar?: boolean
    locale?: ReactDayPickerProps['locale']
    disabledDays?: Matcher | Matcher[]
    validateOnCalendarClose?: boolean
    onValidatedOnce?: () => void
    // Field config
    label?: string
    title?: string
    helperText?: React.ReactNode
    errorText?: React.ReactNode
    error?: boolean
    onInputChange?: (date?: Date) => void
    disallowPast?: boolean
    disallowFuture?: boolean
    hideDefaultHelperText?: boolean
    required?: boolean
    minDate?: Date
}

export const BaseDatePickerInput: React.FC<IBaseDatePickerInput> = (props) => {
    const {
        onClick,
        inputClassName,
        dateFormat,
        selected,
        error,
        helperText,
        errorText,
        onInputChange,
        hideCalendar,
        locale,
        disabledDays,
        label,
        title,
        readOnly,
        disallowPast,
        disallowFuture,
        validateOnCalendarClose,
        onValidatedOnce,
        hideDefaultHelperText,
        required,
        minDate,
        ...rest
    } = props

    const { validationError, handleValidation, errHelperText, clearValidation } = useDatePickerValidation()
    const { maskRef } = useDatePickerMask()
    const selectedValue = selected ? getValue(selected, dateFormat) : ''
    const [value, setValue] = useState(selectedValue)
    const [isDirty, setIsDirty] = useState(false)

    const defaultHelper = locale?.code?.startsWith('nb') ? 'DD/MM/ÅÅÅÅ' : 'DD/MM/YYYY'
    const effectiveDefaultHelper = hideDefaultHelperText ? undefined : defaultHelper

    const hasError = !!(validationError || error)
    const rawText = hasError ? (errorText ?? errHelperText) : helperText ?? effectiveDefaultHelper
    const inputValue = isDirty ? value : selectedValue

    useEffect(() => {
        if (!selected) {
            clearValidation()
            return
        }

        handleValidation({
            value: getValue(selected, dateFormat),
            disabledDays,
            localeCode: locale?.code,
            disallowPast,
            disallowFuture,
            required,
            minDate,
        })
    }, [
        selected,
        dateFormat,
        disabledDays,
        locale?.code,
        disallowPast,
        disallowFuture,
        required,
        minDate,
        handleValidation,
        clearValidation,
    ])

    const digits = inputValue.replace(/\D/g, '')
    const hasDigits = digits.length > 0

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        const onlyDigits = raw.replace(/\D/g, '')
        setIsDirty(true)
        setValue(onlyDigits.length ? raw : '')
    }

    useEffect(() => {
        if (!validateOnCalendarClose) return
        handleValidation({
            value,
            disabledDays,
            localeCode: locale?.code,
            disallowPast,
            disallowFuture,
            required,
            minDate,
        })
        onValidatedOnce?.()
    }, [
        validateOnCalendarClose,
        value,
        disabledDays,
        locale?.code,
        disallowPast,
        disallowFuture,
        required,
        minDate,
        onValidatedOnce,
        handleValidation,
    ])

    const handleBlur = () => {
        const nextValue = isDirty ? value : selectedValue
        const isErrorNow = handleValidation({
            value: nextValue,
            disabledDays,
            localeCode: locale?.code,
            disallowPast,
            disallowFuture,
            required,
            minDate,
        })
        if (isErrorNow) return

        const onlyDigits = nextValue.replace(/\D/g, '')
        if (!onlyDigits.length) {
            setIsDirty(false)
            setValue('')
            onInputChange?.(undefined)
            return
        }

        const parsed = parse(nextValue, 'dd/MM/yyyy', new Date())
        setIsDirty(false)
        onInputChange?.(isValidDateFns(parsed) ? parsed : undefined)
    }

    const width = readOnly ? 120 : 160
    const bottomSpace = 34
    const height = readOnly ? 40 : 75

    return (
        <div className='cursor-default'>
            {title && <div className='pb-1 font-roboto font-semibold text-delta-800'>{title}</div>}

            <div className='flex gap-1' style={{ height }}>
                <div style={{ width }}>
                    <div className='relative'>
                        <StyledInputField
                            {...rest}
                            label={label}
                            readOnly={readOnly}
                            data-testid={rest.dataTest}
                            autoComplete='off'
                            inputRef={!readOnly ? maskRef : undefined}
                            placeholder={!readOnly && !hasDigits ? '  /  /    ' : undefined}
                            size='small'
                            value={readOnly ? inputValue.replaceAll('/', '.') : inputValue}
                            className={inputClassName}
                            style={{ width }}
                            error={hasError}
                            onBlur={!readOnly ? handleBlur : undefined}
                            helperText={null}
                            FormHelperTextProps={{ sx: { m: 0 } }}
                            inputProps={{
                                ...(readOnly
                                    ? {}
                                    : {
                                          inputMode: 'numeric',
                                          style: { fontFamily: 'monospace' },
                                      }),
                            }}
                            onChange={onChange}
                        />
                    </div>
                    {!readOnly && (
                        <div
                            className={cn('pt-1 text-[14px]', hasError ? 'text-error-500' : 'text-delta-600')}
                            style={{
                                maxWidth: width,
                                maxHeight: bottomSpace,
                                lineHeight: '16px',
                            }}
                        >
                            <HelperTextWithTooltip text={rawText} hasError={hasError} />
                        </div>
                    )}
                </div>

                {!hideCalendar && !readOnly && <DatePickerButton onClick={onClick} disabled={!!rest.disabled} />}
            </div>
        </div>
    )
}
