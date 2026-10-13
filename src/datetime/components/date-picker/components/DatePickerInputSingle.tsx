import type { IDatePickerSingle } from '../types'
import { BaseDatePickerInput } from './BaseDatePickerInput'

export const DatePickerInputSingle: React.FC<{
    datePickerProps: IDatePickerSingle
    onClick: (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => void
}> = ({ datePickerProps, onClick }) => {
    const {
        inputClassName,
        disabled,
        helperText,
        label,
        error,
        locale,
        hideCalendar,
        dateFormat,
        disabledDays,
        dataTest,
        readOnly,
        errorText,
        disallowFuture,
        disallowPast,
        required,
        minDate,
        validateOnCalendarClose,
        onValidatedOnce,
        onInputChange,
        selected,
        title,
        hideDefaultHelperText,
    } = datePickerProps

    return (
        <BaseDatePickerInput
            dataTest={dataTest}
            inputClassName={inputClassName}
            readOnly={readOnly}
            disabled={!!disabled}
            helperText={helperText}
            onClick={onClick}
            onInputChange={(date?: Date) => onInputChange?.(date)}
            selected={selected}
            error={!!error}
            locale={locale}
            hideCalendar={hideCalendar}
            dateFormat={dateFormat}
            disabledDays={disabledDays}
            label={label}
            errorText={errorText}
            disallowFuture={disallowFuture}
            disallowPast={disallowPast}
            required={required}
            minDate={minDate}
            validateOnCalendarClose={validateOnCalendarClose}
            onValidatedOnce={onValidatedOnce}
            title={title}
            hideDefaultHelperText={hideDefaultHelperText}
        />
    )
}
