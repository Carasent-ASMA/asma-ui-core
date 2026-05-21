import { useMask } from '@react-input/mask'

export const useDatePickerMask = () => {
    const maskRef = useMask({
        mask: '  /  /    ',
        replacement: {
            ' ': /[0-9]/,
        },
        showMask: true,
    })

    return { maskRef }
}
