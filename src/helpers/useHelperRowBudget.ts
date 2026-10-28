import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

import { findHelperRoom, measureHelperRowMaxWidth } from './helperTextRoom'

export interface HelperRowBudget {
    fieldRef: RefObject<HTMLDivElement>
    rowRef: RefObject<HTMLDivElement>
    rowStyle: CSSProperties | undefined
}

export function useHelperRowBudget(enabled: boolean): HelperRowBudget {
    const fieldRef = useRef<HTMLDivElement>(null)
    const rowRef = useRef<HTMLDivElement>(null)
    const [budget, setBudget] = useState<number>()

    const remeasure = useCallback(() => {
        const field = fieldRef.current
        const row = rowRef.current
        const next = enabled && field && row ? measureHelperRowMaxWidth(field, row) : undefined
        setBudget((previous) => (previous === next ? previous : next))
    }, [enabled])

    useLayoutEffect(remeasure)

    useEffect(() => {
        const field = fieldRef.current
        const container = field ? findHelperRoom(field)?.container : undefined
        if (!enabled || !container || typeof ResizeObserver === 'undefined') return

        const observer = new ResizeObserver(remeasure)
        observer.observe(container)
        return () => observer.disconnect()
    }, [enabled, remeasure])

    return {
        fieldRef,
        rowRef,
        rowStyle: budget != null ? { width: 'max-content', maxWidth: budget } : undefined,
    }
}
