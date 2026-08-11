import { useEffect, useState } from 'react'

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
    const [wasError, setWasError] = useState(false)
    const role = resolveHelperAlertRole(error, wasError)

    useEffect(() => {
        // Deliberate one-tick cascade, not simple derived state: the DOM must actually commit
        // with role="alert" once so assistive tech picks up the transition, then flip to "status"
        // for as long as the field stays invalid — otherwise every reward-early re-render
        // re-fires the live region.
        // eslint-disable-next-line react-hooks/set-state-in-effect, react-you-might-not-need-an-effect/no-derived-state
        setWasError(error)
    }, [error])

    return role
}
