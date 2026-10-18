import type { AriaAttributes, ReactNode } from 'react'
import type { FieldWidth } from 'src/components/inputs/field-styles'

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
    /**
     * Field width pattern step; defaults to XS. A number is a fixed `px` width.
     * @deprecated number — use a step.
     */
    width?: FieldWidth | number
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
    /**
     * Extra ARIA attributes for the text input (e.g. `aria-label`, `aria-required`) — for a visible
     * label rendered outside the picker. Without them the input is named by `title` or `label`.
     */
    inputAriaProps?: AriaAttributes
}

export type IPopupStateType = JSX.Element
