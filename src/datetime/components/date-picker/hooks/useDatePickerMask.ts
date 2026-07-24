import { DATE_INPUT_MASK, useInputMask } from 'src/helpers/inputMask'

export const useDatePickerMask = (): { maskRef: (element: HTMLInputElement | null) => void } => {
    const maskRef = useInputMask(DATE_INPUT_MASK)

    return { maskRef }
}
