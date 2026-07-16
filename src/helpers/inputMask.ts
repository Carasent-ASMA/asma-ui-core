import { useCallback, useRef } from 'react'

/**
 * Dependency-free input masking — replaces `@react-input/mask` for the two masks this library
 * actually uses: the date scaffold `'  /  /    '` (showMask) and the progressive time mask
 * `'xx:xx'`. Slots (positions equal to `maskChar`) accept digits; every other mask character is a
 * literal.
 */
// ponytail: digit-only slots; add an `accept` pattern when a non-numeric mask appears

export interface InputMaskSpec {
    /** Mask template, e.g. `'  /  /    '` or `'xx:xx'`. */
    mask: string
    /** The character in `mask` marking a fillable slot, e.g. `' '` or `'x'`. */
    maskChar: string
    /** true → render the full scaffold once any digit is present; false → grow as the user types. */
    showMask: boolean
}

export interface MaskedResult {
    value: string
    caret: number
}

/** Date picker mask — shared by `useDatePickerMask` and display formatting. */
export const DATE_INPUT_MASK: InputMaskSpec = { mask: '  /  /    ', maskChar: ' ', showMask: true }

/**
 * Pure formatter: distributes the digits of `raw` over the mask slots and computes the caret
 * position that follows the last digit typed before `caretInRaw`. Zero digits yield an empty value
 * so the date field can show its scaffold as a placeholder only while focused.
 */
export const formatMaskedValue = (raw: string, caretInRaw: number, spec: InputMaskSpec): MaskedResult => {
    const { mask, maskChar, showMask } = spec
    const slotCount = [...mask].filter((char) => char === maskChar).length

    const digits = raw.replace(/\D/g, '').slice(0, slotCount)
    if (digits.length === 0) return { value: '', caret: 0 }

    const digitsBeforeCaret = Math.min(raw.slice(0, caretInRaw).replace(/\D/g, '').length, digits.length)

    let value = ''
    let caret = 0
    let digitIndex = 0
    let pendingLiterals = ''

    for (const maskCharAt of mask) {
        if (maskCharAt !== maskChar) {
            if (showMask) value += maskCharAt
            else pendingLiterals += maskCharAt
            continue
        }
        if (digitIndex < digits.length) {
            if (!showMask) {
                value += pendingLiterals
                pendingLiterals = ''
            }
            value += digits[digitIndex]
            digitIndex += 1
            if (digitIndex === digitsBeforeCaret) caret = value.length
        } else if (showMask) {
            value += maskChar
        } else {
            break
        }
    }

    return { value, caret }
}

/**
 * Ref-callback hook applying `formatMaskedValue` on every native `input` event, before React's
 * delegated onChange reads the value — a drop-in for `useMask` from `@react-input/mask`.
 */
export const useInputMask = ({ mask, maskChar, showMask }: InputMaskSpec): ((element: HTMLInputElement | null) => void) => {
    const cleanupRef = useRef<(() => void) | null>(null)

    return useCallback((element: HTMLInputElement | null) => {
        cleanupRef.current?.()
        cleanupRef.current = null
        if (!element) return

        const spec = { mask, maskChar, showMask }
        const sync = (): void => {
            const { value, caret } = formatMaskedValue(element.value, element.selectionStart ?? element.value.length, spec)
            if (element.value !== value) element.value = value
            element.setSelectionRange(caret, caret)
        }
        sync()

        const onInput = (event: Event) => {
            const input = event.target as HTMLInputElement
            const { value, caret } = formatMaskedValue(input.value, input.selectionStart ?? input.value.length, spec)
            if (input.value !== value) input.value = value
            input.setSelectionRange(caret, caret)
        }

        element.addEventListener('input', onInput)
        cleanupRef.current = () => element.removeEventListener('input', onInput)
    }, [mask, maskChar, showMask])
}
