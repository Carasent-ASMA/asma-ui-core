import * as React from 'react'

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return (node: T | null) => {
        refs.forEach((r) => {
            if (!r) return
            if (typeof r === 'function') r(node)
            else (r as React.MutableRefObject<T | null>).current = node
        })
    }
}

export function getInitialFilled(value?: string | number, defaultValue?: string | number): boolean {
    if (value !== undefined) return String(value).length > 0
    if (defaultValue !== undefined) return String(defaultValue).length > 0
    return false
}

export function normalizeValue(value?: string | number | null): string | number | undefined {
    return value === null ? '' : value
}

export function createSyntheticChangeEvent(value: string): React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> {
    return {
        currentTarget: { value },
        target: { value },
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
}

// Auto-resizes a textarea based on content and row limits
export function useTextareaAutosize(
    ref: React.RefObject<HTMLTextAreaElement | null>,
    multiline: boolean,
    minRows?: number,
    maxRows?: number,
    value?: string | number,
    startAdornmentRef?: React.RefObject<HTMLDivElement | null>,
) {
    React.useLayoutEffect(() => {
        if (!multiline || !ref.current) return
        const el = ref.current

        const resize = () => {
            el.style.height = 'auto'
            el.style.overflow = 'hidden'

            const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20')

            let newHeight = el.scrollHeight
            newHeight = Math.max(newHeight, (minRows ?? 1) * lineHeight)

            if (maxRows) newHeight = Math.min(newHeight, maxRows * lineHeight)

            el.style.height = `${newHeight}px`
        }

        resize()

        el.addEventListener('input', resize)
        window.addEventListener('resize', resize)

        let observer: ResizeObserver | undefined
        if (startAdornmentRef?.current) {
            observer = new ResizeObserver(resize)
            observer.observe(startAdornmentRef.current)
        }

        return () => {
            el.removeEventListener('input', resize)
            window.removeEventListener('resize', resize)
            observer?.disconnect()
        }
    }, [multiline, minRows, maxRows, value, ref, startAdornmentRef])
}
