import { useState } from 'react'

export function resolveHelperAlertRole(isError: boolean, wasError: boolean): 'alert' | 'status' {
    return isError && !wasError ? 'alert' : 'status'
}

export function useHelperAlertRole(isError: boolean | undefined): 'alert' | 'status' {
    const error = !!isError
    const [prevError, setPrevError] = useState(error)
    const [role, setRole] = useState<'alert' | 'status'>(resolveHelperAlertRole(error, false))

    if (error !== prevError) {
        setPrevError(error)
        setRole(resolveHelperAlertRole(error, prevError))
    }

    return role
}
