import type {
    DatePickerProps,
    MobileDatePickerProps,
    PickersActionBarAction,
    TimePickerProps,
} from '@mui/x-date-pickers'

export interface IStyledDatePickerProps extends DatePickerProps<Date> {
    actions?: PickersActionBarAction[]
    placeholder?: string
    size?: 'small' | 'medium'
}

export interface IStyledMobileDatePickerProps extends MobileDatePickerProps<Date> {
    actions?: PickersActionBarAction[]
    placeholder?: string
    size?: 'small' | 'medium'
}

export interface IStyledTimePickerProps extends TimePickerProps<Date> {
    size?: 'small' | 'medium'
}
