import type { IDatePickerRange } from '../types'
import clsx from 'clsx'
import styles from './DatePickerInputRangeCompact.module.scss'
import { BaseDatePickerInput } from './BaseDatePickerInput'
import { addDays } from 'date-fns'

export const DatePickerInputRangeCompact: React.FC<{
    datePickerProps: IDatePickerRange
    onClick: (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => void
}> = ({ datePickerProps, onClick }) => {
    const {
        dataTest,
        className,
        inputClassName,
        disabled,
        readOnly,
        dateFormat,
        onInputChange,
        hideCalendar,
        locale,
        selected,
        disabledDays,
        validateOnCalendarClose,
        onValidatedOnce,
        ...rangeFieldProps
    } = datePickerProps

    return (
        <div
            data-testid={dataTest}
            className={clsx(
                className,
                styles['styled-date-picker-input-range-compact'],
                disabled && styles['range-compact-disabled'],
            )}
        >
            {/* start value */}
            <BaseDatePickerInput
                dataTest='styled-date-picker-input-range-from'
                dateFormat={dateFormat}
                selected={selected?.from}
                inputClassName={inputClassName}
                readOnly={readOnly}
                disabled={!!disabled}
                onClick={onClick}
                onInputChange={(date?: Date) => {
                    if (date && selected?.to && date.getTime() > selected?.to.getTime()) {
                        onInputChange?.({ from: date, to: addDays(date, 1) })
                    } else {
                        onInputChange?.({ from: date, to: selected?.to })
                    }
                }}
                hideCalendar={hideCalendar}
                locale={locale}
                disabledDays={disabledDays}
                validateOnCalendarClose={validateOnCalendarClose}
                onValidatedOnce={onValidatedOnce}
                // spread "from" field props
                label={rangeFieldProps.labelFrom}
                error={rangeFieldProps.errorFrom}
                helperText={rangeFieldProps.helperTextFrom}
                errorText={rangeFieldProps.errorTextFrom}
                title={rangeFieldProps.titleFrom}
                hideDefaultHelperText={rangeFieldProps.hideDefaultHelperTextFrom}
            />
            <BaseDatePickerInput
                dataTest='styled-date-picker-input-range-to'
                dateFormat={dateFormat}
                selected={selected?.to}
                inputClassName={inputClassName}
                readOnly={readOnly}
                disabled={!!disabled}
                onClick={onClick}
                onInputChange={(date?: Date) => {
                    if (date && selected?.from && date.getTime() < selected?.from.getTime()) {
                        onInputChange?.({ from: addDays(date, -1), to: date })
                    } else {
                        onInputChange?.({ from: selected?.from, to: date })
                    }
                }}
                hideCalendar={hideCalendar}
                locale={locale}
                disabledDays={disabledDays}
                validateOnCalendarClose={validateOnCalendarClose}
                onValidatedOnce={onValidatedOnce}
                label={rangeFieldProps.labelTo}
                error={rangeFieldProps.errorTo}
                helperText={rangeFieldProps.helperTextTo}
                errorText={rangeFieldProps.errorTextTo}
                title={rangeFieldProps.titleTo}
                hideDefaultHelperText={rangeFieldProps.hideDefaultHelperTextTo}
            />
        </div>
    )
}
