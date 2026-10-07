import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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
export const useDialogBusyBoundary = (busyReason?: ReactNode): { busy: boolean; contextValue: DialogBusyContextValue } => {
    const [count, setCount] = useState(0)

    const registerBusy = useCallback(() => {
        setCount((current) => current + 1)
        return () => setCount((current) => current - 1)
    }, [])

    const busy = count > 0
    const contextValue = useMemo(() => ({ registerBusy, busy, busyReason }), [registerBusy, busy, busyReason])

    return { busy, contextValue }
}

/** Reports `busy` to the closest dialog, if any. Safe outside a dialog. */
export const useReportDialogBusy = (busy: boolean): void => {
    const registerBusy = useContext(DialogBusyContext)?.registerBusy

    useEffect(() => {
        if (!busy || !registerBusy) return
        return registerBusy()
    }, [busy, registerBusy])
}
