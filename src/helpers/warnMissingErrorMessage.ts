import type { ReactNode } from 'react'

/**
 * Transient ASMA-7729 guard: callers that set `error` without a message silently lose copy after
 * the `'Required'` fallback is removed. Drop once fix-forward clears those call sites.
 */
export function warnMissingErrorMessage(
    component: string,
    error: boolean | undefined,
    message: ReactNode,
): void {
    if ((typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') || !error) return
    if (message != null && message !== '') return
    console.warn(`[asma-ui-core/${component}] error without a message — pass helperText/errorText`)
}
