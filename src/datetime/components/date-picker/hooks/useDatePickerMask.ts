import { useMask } from '@react-input/mask'
import type { MutableRefObject } from "node_modules/@types/react";

export const useDatePickerMask = (): { maskRef: MutableRefObject<HTMLInputElement | null>; } => {
    const maskRef = useMask({
        mask: '  /  /    ',
        replacement: {
            ' ': /\d/,
        },
        showMask: true,
    })

    return { maskRef }
}
