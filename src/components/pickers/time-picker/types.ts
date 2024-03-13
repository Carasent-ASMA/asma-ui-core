export type StyledTimePickerProps = {
    placeholder?: string
    disabled?: boolean
    inputClassName?: string
    value?: Date
    onSelect: (date: Date | undefined) => void
    dataTest: string
    width?: number
    error?: boolean
    helperText?: string
    label?: string
    locale?: 'no' | 'en'
}
