import type { ReactNode } from 'react'

/** 
    * @param notBeforeTime - Start time of the range. Selected time must be after this value.
*/

export interface StyledTimePickerProps {
    value?: Date
    onSelect: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    inputClassName?: string
    dataTest: string
    width?: number
    error?: boolean
    helperText?: ReactNode
    label?: string
    locale?: 'no' | 'en'
    title?: string
    notBeforeTime?: Date
}

export type IPopupStateType = JSX.Element
