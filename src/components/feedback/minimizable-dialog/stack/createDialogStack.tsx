import React, { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react'

export type DialogConfigMap = Record<string, { dependencies?: readonly string[] }>

type DialogId<Config extends DialogConfigMap> = Extract<keyof Config, string>

interface DialogState<Id extends string> {
    id: Id
    open: boolean
    width: number
    position: { right: number }
    dependencies?: readonly Id[]
}

interface DialogStackContextType<Config extends DialogConfigMap> {
    dialogs: DialogState<DialogId<Config>>[]
    openDialog(id: DialogId<Config>): void
    closeDialog(id: DialogId<Config>): void
    getDialogState(id: DialogId<Config>): DialogState<DialogId<Config>> | undefined
}

function useWindowWidth() {
    const [width, setWidth] = useState(() => window.innerWidth)

    useEffect(() => {
        const handler = () => setWidth(window.innerWidth)
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    return width
}

const GAP = 16

export function createDialogStack<Config extends DialogConfigMap>({
    config,
    MAX_DIALOG_WIDTH = 600,
}: {
    config: Config
    MAX_DIALOG_WIDTH?: number
}) {
    const DialogStackContext = createContext<DialogStackContextType<Config> | undefined>(undefined)

    const DialogStackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
        const [dialogs, setDialogs] = useState<DialogState<DialogId<Config>>[]>([])
        const windowWidth = useWindowWidth()

        const recalculate = useCallback(
            (items: DialogState<DialogId<Config>>[]) => {
                const count = items.length || 1
                const dialogWidth = Math.min(MAX_DIALOG_WIDTH, (windowWidth - (count + 1) * GAP) / count)

                return items.map((d, i) => ({
                    ...d,
                    width: dialogWidth,
                    position: { right: GAP + i * (dialogWidth + GAP) },
                }))
            },
            [windowWidth],
        )

        const openDialog = useCallback(
            (id: DialogId<Config>) => {
                const deps = config[id]?.dependencies as readonly DialogId<Config>[] | undefined

                setDialogs((prev) => {
                    const exists = prev.find((d) => d.id === id)

                    const base: DialogState<DialogId<Config>> = {
                        id,
                        open: true,
                        width: 0,
                        position: { right: 0 },
                        dependencies: deps,
                    }

                    const merged = exists
                        ? prev.map((d) => (d.id === id ? { ...d, open: true, dependencies: deps } : d))
                        : [...prev, base]

                    return recalculate(merged.filter((d) => d.open))
                })
            },
            [recalculate],
        )

        const closeDialog = useCallback(
            (id: DialogId<Config>) => {
                setDialogs((prev) => {
                    const toRemove = new Set<string>([id])
                    let changed: boolean
                    do {
                        changed = false
                        for (const d of prev) {
                            if (d.dependencies?.some((dep) => toRemove.has(dep)) && !toRemove.has(d.id)) {
                                toRemove.add(d.id)
                                changed = true
                            }
                        }
                    } while (changed)

                    return recalculate(prev.filter((d) => !toRemove.has(d.id)))
                })
            },
            [recalculate],
        )

        const getDialogState = useCallback(
            (id: DialogId<Config>) => dialogs.find((d) => d.id === id) as DialogState<DialogId<Config>> | undefined,
            [dialogs],
        )

        return (
            <DialogStackContext.Provider value={{ dialogs, openDialog, closeDialog, getDialogState }}>
                {children}
            </DialogStackContext.Provider>
        )
    }

    function useDialogStack() {
        const ctx = useContext(DialogStackContext)
        if (!ctx) throw new Error('useDialogStack must be used within DialogStackProvider')
        return ctx
    }

    return { DialogStackProvider, useDialogStack }
}
