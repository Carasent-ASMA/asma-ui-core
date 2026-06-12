import { createContext, useContext } from 'react'

export interface DynamicToolbarLayoutContextValue {
    containerWidth: number
    filterIconOnly: boolean
    trailingIconOnly: boolean
}

export const DynamicToolbarLayoutContext = createContext<DynamicToolbarLayoutContextValue>({
    containerWidth: 0,
    filterIconOnly: false,
    trailingIconOnly: false,
})

export function useDynamicToolbarLayout(): DynamicToolbarLayoutContextValue {
    return useContext(DynamicToolbarLayoutContext)
}
