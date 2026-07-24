import { createContext, useContext, type SyntheticEvent } from 'react'

export type TabValue = unknown

export interface TabsContextValue {
    value: TabValue
    size: 'default' | 'small'
    onSelect: (event: SyntheticEvent, value: TabValue) => void
    /** Registers a tab button so the parent can measure the active indicator and drive arrow-key focus. */
    register: (value: TabValue, node: HTMLButtonElement | null) => void
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export const useTabsContext = (): TabsContextValue | null => useContext(TabsContext)
