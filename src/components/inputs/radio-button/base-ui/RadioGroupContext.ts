import { createContext, useContext } from 'react'

export type RadioValue = string | number | boolean | null

export interface RadioGroupContextValue {
    name: string
    value?: RadioValue
    disabled?: boolean
    onSelect: (value: RadioValue) => void
}

/** Shared state for the native radio group (replaces `@base-ui/react`'s RadioGroup context). */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export const useRadioGroupContext = (): RadioGroupContextValue | null => useContext(RadioGroupContext)
