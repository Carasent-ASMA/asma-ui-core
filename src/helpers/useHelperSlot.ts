import type { ReactNode } from 'react'
import { useHelperAlertRole } from './useHelperAlertRole'
import { warnMissingErrorMessage } from './warnMissingErrorMessage'

export interface UseHelperSlotResult {
    show: boolean
    role: 'alert' | 'status'
}

/**
 * Shared logic for the helper-text row beneath input components.
 * Returns `show` (whether the slot should render) and `role` (ARIA live-region role).
 * Emits a dev-mode warning when `error` is set but `message` is empty.
 */
export function useHelperSlot(
    component: string,
    error: boolean | undefined,
    message: ReactNode,
    reserveHelperText?: boolean,
    readOnly?: boolean,
): UseHelperSlotResult {
    const show = readOnly !== true && (reserveHelperText === true || message != null || Boolean(error))
    warnMissingErrorMessage(component, error, message)
    const role = useHelperAlertRole(error)
    return { show, role }
}
