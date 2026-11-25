import type { ReactNode } from 'react'

export function warnMissingErrorMessage(
    component: string,
    error: boolean | undefined,
    message: ReactNode,
): void {
    if (!import.meta.env.DEV || !error) return
    if (message != null && message !== '') return
    console.warn(`[asma-ui-core/${component}] error without a message — pass helperText/errorText`)
}
