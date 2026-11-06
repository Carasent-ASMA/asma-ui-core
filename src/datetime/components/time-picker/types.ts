import type { AriaAttributes, ReactNode } from 'react'
import type { FieldWidth } from 'src/components/inputs/field-styles'
import type { TimePredicate } from './helpers/disabledTime'

/** 
    * @param notBeforeTime - Start time of the range. Selected time must be after this value.
*/

export interface StyledTimePickerProps {
    value?: Date
    onSelect: (date: Date | undefined) => void
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    /** A locked field (disabled-states DIS-9): read-only with a lock icon; the reason opens on hover, focus and tap. */
    lockedReason?: ReactNode
    inputClassName?: string
    dataTest: string
    /** Field width pattern step; defaults to XS. A number (a fixed `px` width) is deprecated: use a step. */
    width?: FieldWidth | number
    error?: boolean
    /** Shown under the field; with `error`, it replaces the picker's own message (form errors win). */
    helperText?: ReactNode
    /** An empty field shows "Required" after blur or the eraser, and the input is `aria-required`. */
    required?: boolean
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
     * @figmaProp none — behavioral; drives the Time item `State=Disabled` cells (node 15086-19871).
     * Marks arbitrary clock times unavailable, including a band that wraps midnight, which no pair
     * of bounds can express. An hour cell greys only when every minute cell inside it is rejected,
     * matching `minTime`'s rule.
     *
     * Unlike `minTime`, a rejected time typed by hand **raises the error state** rather than
     * silently reverting: the consumer asked for these times to be refused, so swallowing the entry
     * would leave the author believing it was accepted.
     *
     * Pair it with {@link disabledTimeReason}; a disabled cell with no reason is a dead end.
     */
    isTimeDisabled?: TimePredicate
    /**
     * Why {@link isTimeDisabled} rejects what it rejects. Serves twice, so one string cannot drift
     * from the other: the tooltip on a rejected cell, and the field error when a rejected time is
     * typed. Copy stays with the consumer — this picker knows nothing about anyone's domain.
     */
    disabledTimeReason?: ReactNode
    /**
     * Extra ARIA attributes for the text input (e.g. `aria-label`, `aria-required`) — for a visible
     * label rendered outside the picker. Without them the input is named by `title` or `label`.
     */
    inputAriaProps?: AriaAttributes
}

export type IPopupStateType = JSX.Element
