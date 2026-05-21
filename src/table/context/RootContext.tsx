import { createContext, useContext, useState, type FunctionComponent, type PropsWithChildren } from 'react'

interface RootContextType {
    enableResizingFlag: () => void
    disableResizingFlag: () => void
    isResizing: boolean
}

const RootContext = createContext<RootContextType | undefined>(undefined)

export const RootContextProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const [isResizing, setIsResizing] = useState(false)

    const enableResizingFlag = () => setIsResizing(true)
    const disableResizingFlag = () => setIsResizing(false)

    const context = {
        enableResizingFlag,
        disableResizingFlag,
        isResizing,
    } satisfies RootContextType

    return <RootContext.Provider value={context}>{children}</RootContext.Provider>
}

export const useRootContext = () => {
    const context = useContext(RootContext)

    if (!context) {
        throw new Error('useRootContext must be used within a RootContextProvider')
    }

    return context
}
