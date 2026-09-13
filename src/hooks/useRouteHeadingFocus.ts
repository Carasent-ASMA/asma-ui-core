import { useCallback, useEffect, useRef } from 'react'

/**
 * Focuses the page heading on route change. Mount once at a level that survives
 * navigation (e.g. `useRouteHeadingFocus(useLocation().pathname)`) and pass the
 * returned ref to `PageHeader`'s `titleRef`. The pending flag also catches
 * headings that mount after navigation; first render and StrictMode replays are no-ops.
 */
export function useRouteHeadingFocus(routeKey: string | number): (element: HTMLElement | null) => void {
    const seenKeyRef = useRef(routeKey)
    const pendingRef = useRef(false)
    const elementRef = useRef<HTMLElement | null>(null)

    const setRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element
        if (element && pendingRef.current) {
            pendingRef.current = false
            element.focus()
        }
    }, [])

    useEffect(() => {
        if (seenKeyRef.current === routeKey) {
            return
        }
        seenKeyRef.current = routeKey
        pendingRef.current = true

        if (elementRef.current) {
            pendingRef.current = false
            elementRef.current.focus()
        }
    }, [routeKey])

    return setRef
}
