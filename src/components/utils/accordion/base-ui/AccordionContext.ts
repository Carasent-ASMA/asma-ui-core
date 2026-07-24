import { createContext, useContext } from 'react'

export interface AccordionContextValue {
    open: boolean
    toggle: () => void
    disabled?: boolean
    triggerId: string
    panelId: string
}

/** Shared open-state + ARIA ids for the accordion compound (replaces `@base-ui/react`). */
export const AccordionContext = createContext<AccordionContextValue | null>(null)

export const useAccordionContext = (): AccordionContextValue => {
    const ctx = useContext(AccordionContext)
    if (!ctx) throw new Error('StyledAccordionSummary/Details must be rendered inside StyledAccordion')
    return ctx
}
