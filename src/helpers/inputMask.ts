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
 * Font family the editable date input MUST render in. `DATE_INPUT_MASK` is a *space scaffold*
 * (its `maskChar` is `' '`), so the field relies on a fixed-width font: with a proportional font
 * (e.g. Roboto) the empty day/year space slots collapse to hairlines and the mask visibly loses
 * its spaces (a real regression once shipped). A monospace font keeps every slot the same width so
 * the `dd / mm / yyyy` columns stay aligned. This is coupled to the space `maskChar` — the two are
 * asserted together in `inputMask.test.ts`; do not switch this to a proportional font.
 */
export const DATE_INPUT_FONT_FAMILY = 'monospace'

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
 * Set an input's value via the **native prototype setter**, bypassing React's per-instance patched
 * setter. React patches the instance `value` setter to update its internal value-tracker; if the mask
 * assigns `input.value = …` directly, the tracker is updated too, so React's change-detection sees
 * "no change" and never fires `onChange` — leaving a controlled `value` state empty while the DOM
 * shows the masked text (typed dates were then lost on the next re-render/blur). Using the native
 * setter leaves the tracker stale, so React detects the diff and fires `onChange`. Do NOT replace
 * this with `input.value = …`.
 */
const nativeInputValueSetter =
    typeof HTMLInputElement !== 'undefined'
        ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
        : undefined

const setMaskedValue = (input: HTMLInputElement, value: string): void => {
    if (nativeInputValueSetter) nativeInputValueSetter.call(input, value)
    else input.value = value
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
            if (element.value !== value) setMaskedValue(element, value)
            element.setSelectionRange(caret, caret)
        }
        sync()

        const onInput = (event: Event) => {
            const input = event.target as HTMLInputElement
            const { value, caret } = formatMaskedValue(input.value, input.selectionStart ?? input.value.length, spec)
            if (input.value !== value) setMaskedValue(input, value)
            input.setSelectionRange(caret, caret)
        }

        element.addEventListener('input', onInput)
        cleanupRef.current = () => element.removeEventListener('input', onInput)
    }, [mask, maskChar, showMask])
}
