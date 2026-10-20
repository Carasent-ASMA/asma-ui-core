import type { CSSProperties } from 'react'
import { fieldWidthStyle } from 'src/components/inputs/field-styles'
import type { StyledTimePickerProps } from '../types'

/** The step box of the picker root; a legacy numeric `width` is applied on the input instead. */
export const timePickerWidthProps = (
    width: StyledTimePickerProps['width'],
): { 'data-field-width'?: string; style?: CSSProperties } => {
    if (typeof width === 'number') return {}
    const step = width ?? 'xs'
    return { 'data-field-width': step, style: fieldWidthStyle(step) }
}
