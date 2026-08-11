import { useState } from 'react'

/**
 * REQ-005: error *appearance* is announced via `role="alert"`; a field that stays invalid across
 * later renders (e.g. reward-early revalidation swapping which validation message applies) must
 * fall back to the passive `role="status"` so it does not re-fire the live region on every
 * content swap — the ALT-002 "role=alert chatter" defect UX rejected at GATE-001.
 */
export function resolveHelperAlertRole(isError: boolean, wasError: boolean): 'alert' | 'status' {
    return isError && !wasError ? 'alert' : 'status'
}

export function useHelperAlertRole(isError: boolean | undefined): 'alert' | 'status' {
    const error = !!isError
    // React's sanctioned "adjust state during render" bailout (not an effect, not a ref read
    // during render — both were tried and rejected: an effect-driven downgrade self-triggers a
    // follow-up render within the same `act()` flush an interaction test's `await` collapses
    // before ever observing "alert"; reading a ref during render trips `react-hooks/refs`).
    // `role` only recomputes when `error`'s boolean identity actually flips, so the commit that
    // introduces the error keeps announcing "alert" for as long as nothing else re-renders it —
    // which is exactly the render an assistive tech AX-tree flush or a test assertion observes.
    const [prevError, setPrevError] = useState(error)
    const [role, setRole] = useState<'alert' | 'status'>(resolveHelperAlertRole(error, false))

    if (error !== prevError) {
        setPrevError(error)
        setRole(resolveHelperAlertRole(error, prevError))
    }

    return role
}
