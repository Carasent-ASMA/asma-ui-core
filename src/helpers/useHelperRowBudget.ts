import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

import { measureHelperRowMaxWidth } from './helperTextRoom'

export interface HelperRowBudget {
    /** Goes on the field root — the element the row's room is measured from. */
    fieldRef: RefObject<HTMLDivElement>
    /** Goes on the helper row itself. */
    rowRef: RefObject<HTMLDivElement>
    /** Width style for the helper row, or `undefined` to leave it at the field's own box. */
    rowStyle: CSSProperties | undefined
}

/**
 * REQ-013 — lets a hint/error wider than its field run into the free space beside it.
 *
 * Shared by every field component that owns a helper row, so the design system answers a long
 * message the same way everywhere instead of per-component. The geometry lives in
 * [[helperTextRoom]]; this only decides *when* to re-measure.
 *
 * @see asma-modules/_docs/frontend/plans/2026-08-06-20-45-plan-form-validation-unification-rhf.md:77 — REQ-013
 */
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

    // No dep array: every render can swap the message, and the budget depends on where the row sits
    // rather than on its text. Measuring before paint keeps the un-capped `max-content` width off screen.
    useLayoutEffect(remeasure)

    // Covers the layout changing without this field re-rendering: a resized dialog, a neighbour
    // appearing, a column collapsing.
    useEffect(() => {
        const parent = fieldRef.current?.parentElement
        if (!enabled || !parent || typeof ResizeObserver === 'undefined') return

        const observer = new ResizeObserver(remeasure)
        observer.observe(parent)
        return () => observer.disconnect()
    }, [enabled, remeasure])

    return {
        fieldRef,
        rowRef,
        rowStyle: budget != null ? { width: 'max-content', maxWidth: budget } : undefined,
    }
}
