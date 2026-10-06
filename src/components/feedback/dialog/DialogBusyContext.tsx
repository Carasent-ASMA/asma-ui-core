import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface DialogBusyContextValue {
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
export const useDialogBusyBoundary = (): { busy: boolean; contextValue: DialogBusyContextValue } => {
    const [count, setCount] = useState(0)

    const registerBusy = useCallback(() => {
        setCount((current) => current + 1)
        return () => setCount((current) => current - 1)
    }, [])

    const contextValue = useMemo(() => ({ registerBusy }), [registerBusy])

    return { busy: count > 0, contextValue }
}

/** Reports `busy` to the closest dialog, if any. Safe outside a dialog. */
export const useReportDialogBusy = (busy: boolean): void => {
    const context = useContext(DialogBusyContext)

    useEffect(() => {
        if (!busy || !context) return
        return context.registerBusy()
    }, [busy, context])
}
