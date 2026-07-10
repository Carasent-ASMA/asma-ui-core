import { createContext, useContext } from 'react'
import type { FieldSize } from '../inputs/field-styles'

export interface FormControlContextValue {
    focused: boolean
    filled: boolean
    error: boolean
    disabled: boolean
    required: boolean
    size: FieldSize
    labelId?: string
    setFocused: (value: boolean) => void
    setFilled: (value: boolean) => void
}

export const FormControlContext = createContext<FormControlContextValue | null>(null)

export const useFormControlContext = (): FormControlContextValue | null => useContext(FormControlContext)
