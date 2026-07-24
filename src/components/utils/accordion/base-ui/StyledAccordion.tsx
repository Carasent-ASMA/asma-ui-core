import * as React from 'react'
import { useId, useMemo, useState, type HTMLAttributes } from 'react'
import { cn } from 'src/helpers/cn'
import styles from './StyledAccordion.module.scss'
import { AccordionContext } from './AccordionContext'

interface StyledAccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    className?: string
    children: React.ReactNode
    expanded?: boolean
    defaultExpanded?: boolean
    disabled?: boolean
    onChange?: (expanded: boolean) => void
}

/**
 * Native accordion root (replaces `@base-ui/react`): owns the open state (controlled via `expanded`
 * or uncontrolled via `defaultExpanded`) and shares it with `StyledAccordionSummary`/`Details`
 * through context. TASK-201.
 */
export const StyledAccordion = ({
    className,
    children,
    expanded,
    defaultExpanded,
    disabled,
    onChange,
    ...props
}: StyledAccordionProps): JSX.Element => {
    const triggerId = useId()
    const panelId = useId()
    const isControlled = expanded !== undefined
    const [uncontrolledOpen, setUncontrolledOpen] = useState(!!defaultExpanded)
    const open = isControlled ? !!expanded : uncontrolledOpen

    const toggle = () => {
        const next = !open
        if (!isControlled) setUncontrolledOpen(next)
        onChange?.(next)
    }

    const contextValue = useMemo(
        () => ({ open, toggle, disabled, triggerId, panelId }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [open, disabled, triggerId, panelId],
    )

    return (
        <div {...props} className={cn(styles['AccordionRoot'], className)}>
            <AccordionContext.Provider value={contextValue}>{children}</AccordionContext.Provider>
        </div>
    )
}
