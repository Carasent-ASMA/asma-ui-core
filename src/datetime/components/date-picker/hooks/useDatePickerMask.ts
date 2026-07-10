import { useInputMask } from 'src/helpers/inputMask'

export const useDatePickerMask = (): { maskRef: (element: HTMLInputElement | null) => void } => {
    const maskRef = useInputMask({
        mask: '  /  /    ',
        maskChar: ' ',
        showMask: true,
    })

    return { maskRef }
}
