import * as React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './StyledAccordion.module.scss'
import { clsx } from 'clsx'
import { useAccordionContext } from './AccordionContext'

type StyledAccordionDetailsProps = React.HTMLAttributes<HTMLDivElement> & {
    contentClassName?: string
}

/**
 * Native accordion panel (replaces `@base-ui/react`): a `role="region"` whose height animates
 * between 0 and its measured content height via the SCSS `--accordion-panel-height` var (was
 * base-ui-provided). Collapsed, it is `inert`: the content is still rendered (so it can be measured
 * and animated) but is out of the tab order and the accessibility tree. TASK-201.
 */
export const StyledAccordionDetails = ({
    children,
    className,
    contentClassName,
    ...props
}: StyledAccordionDetailsProps): JSX.Element => {
    const { open, panelId, triggerId } = useAccordionContext()
    const panelRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const wasOpenRef = useRef(open)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (!contentRef.current) return
        const measure = () => setHeight(contentRef.current?.scrollHeight ?? 0)
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(contentRef.current)
        return () => observer.disconnect()
    }, [children])

    useLayoutEffect(() => {
        const panel = panelRef.current
        const closingAroundFocus = wasOpenRef.current && !open && panel?.contains(document.activeElement)
        panel?.toggleAttribute('inert', !open)
        if (closingAroundFocus) document.getElementById(triggerId)?.focus({ preventScroll: true })
        wasOpenRef.current = open
    }, [open, triggerId])

    return (
        <div
            ref={panelRef}
            {...props}
            id={panelId}
            role='region'
            aria-labelledby={triggerId}
            className={clsx(styles['Panel'], className)}
            style={{ '--accordion-panel-height': open ? `${height}px` : '0px' } as React.CSSProperties}
        >
            <div ref={contentRef} className={clsx(styles['Content'], contentClassName)}>
                {children}
            </div>
        </div>
    )
}
