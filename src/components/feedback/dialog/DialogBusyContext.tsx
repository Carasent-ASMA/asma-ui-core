import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'

export const WAIT_UNTIL_SAVED = { en: 'Wait until saved', no: 'Vent til lagringen er ferdig' } as const

interface DialogBusyContextValue {
    busy: boolean
    busyReason?: ReactNode
    /** Marks the dialog busy; the returned function ends that mark. */
    registerBusy: () => () => void
}

export const DialogBusyContext = createContext<DialogBusyContextValue | null>(null)

/**
 * A dialog (or popover) is busy while one of its buttons runs an action (`StyledButton loading`).
 * Closing it then would hide a request that is still running, so every dismissal (Esc, backdrop click,
 * the X button) is ignored until the action ends (submit-buttons SUB-4/SUB-8: Cancel waits for the result).
 * Provide `contextValue` with `DialogBusyContext.Provider` around the dialog content.
 */
export const useDialogBusyBoundary = (
    busyReason?: ReactNode,
    locale: UiCoreLocale = 'en',
): { busy: boolean; busyReason: ReactNode; contextValue: DialogBusyContextValue } => {
    const [count, setCount] = useState(0)

    const registerBusy = useCallback(() => {
        setCount((current) => current + 1)
        return () => setCount((current) => current - 1)
    }, [])

    const busy = count > 0
    // Without an app text the dialog still says why it can't be closed (DIS-1).
    const reason = busyReason ?? WAIT_UNTIL_SAVED[locale]
    // Share the app override; a footer chooses its own localized fallback.
    const contextValue = useMemo(() => ({ registerBusy, busy, busyReason }), [registerBusy, busy, busyReason])

    return { busy, busyReason: reason, contextValue }
}

/** Reports `busy` to the closest dialog, if any. Safe outside a dialog. */
export const useReportDialogBusy = (busy: boolean): void => {
    const registerBusy = useContext(DialogBusyContext)?.registerBusy

    useEffect(() => {
        if (!busy || !registerBusy) return
        return registerBusy()
    }, [busy, registerBusy])
}
