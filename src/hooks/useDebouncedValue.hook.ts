import { useEffect, useState } from 'react'

/** `value`, but only once it has stopped changing for `delayMs`. The first value is returned at once. */
export const useDebouncedValue = <T,>(value: T, delayMs: number): T => {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebounced(value)
        }, delayMs)
        return () => {
            window.clearTimeout(timer)
        }
    }, [value, delayMs])

    return debounced
}
