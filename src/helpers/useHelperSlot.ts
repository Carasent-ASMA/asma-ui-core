import type { ReactNode } from 'react'
import { useHelperAlertRole } from './useHelperAlertRole'
import { warnMissingErrorMessage } from './warnMissingErrorMessage'

export interface UseHelperSlotResult {
    show: boolean
    role: 'alert' | 'status'
}

const hasHelperContent = (message: ReactNode): boolean =>
    typeof message === 'string' ? message.trim() !== '' : message != null && message !== false

/**
 * Shared logic for the helper-text row beneath input components.
 * Returns `show` (whether the slot should render) and `role` (ARIA live-region role).
 * Emits a dev-mode warning when `error` is set but `message` is empty.
 * Under a character counter a blank slot is never reserved: the counter takes that line instead.
 */
export function useHelperSlot(
    component: string,
    error: boolean | undefined,
    message: ReactNode,
    reserveHelperText?: boolean,
    readOnly?: boolean,
    hasCounter?: boolean,
): UseHelperSlotResult {
    const reserve = hasCounter ? hasHelperContent(message) : reserveHelperText === true || message != null
    const show = readOnly !== true && (reserve || Boolean(error))
    warnMissingErrorMessage(component, error, message)
    const role = useHelperAlertRole(error)
    return { show, role }
}
