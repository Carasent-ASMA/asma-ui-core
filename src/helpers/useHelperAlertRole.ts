import { useEffect, useRef } from 'react'

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
    // A ref (not state) on purpose: flipping via `setState` in an effect self-triggers an
    // immediate follow-up render that downgrades "alert" to "status" before anything — a test's
    // `await` between interaction and assertion, or a real screen reader's AX-tree flush — can
    // ever observe it. Mutating a ref during the effect leaves "alert" committed in the DOM until
    // the *next externally-caused* render (the actual next content/value change), which is when
    // the downgrade is supposed to happen anyway.
    const wasErrorRef = useRef(false)
    const role = resolveHelperAlertRole(error, wasErrorRef.current)

    useEffect(() => {
        wasErrorRef.current = error
    }, [error])

    return role
}
