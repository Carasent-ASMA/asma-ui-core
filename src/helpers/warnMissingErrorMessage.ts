import type { ReactNode } from 'react'

export function warnMissingErrorMessage(
    component: string,
    error: boolean | undefined,
    message: ReactNode,
): void {
    if ((typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') || !error) return
    if (message != null && message !== '') return
    console.warn(`[asma-ui-core/${component}] error without a message — pass helperText/errorText`)
}
