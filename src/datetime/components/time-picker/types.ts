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
    /**
     * @figmaProp none — behavioral. Why the time can't be changed here, and where it can. With
     * `readOnly` the field is shown borderless and text-like without the clock icon, stays focusable
     * and shows the reason on hover, focus and tap (disabled-states DIS-6). Without `readOnly` it has no effect.
     */
    readOnlyReason?: ReactNode
    inputClassName?: string
    dataTest: string
    width?: number
    error?: boolean
    helperText?: ReactNode
    label?: string
    locale?: 'no' | 'en'
    title?: string
    notBeforeTime?: Date
    /**
     * @figmaProp none — behavioral; drives the Time item `State=Disabled` cells (node 15086-19871).
     * Earliest selectable clock time; its calendar day is ignored. Earlier hour/minute cells are disabled
     * and a typed earlier time is not committed — the field reverts to the last valid value on blur.
     * Unlike `notBeforeTime`, it never shows an error.
     */
    minTime?: Date
}

export type IPopupStateType = JSX.Element
