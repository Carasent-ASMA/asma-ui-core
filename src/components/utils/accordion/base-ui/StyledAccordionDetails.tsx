import * as React from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './StyledAccordion.module.scss'
import { clsx } from 'clsx'
import { useAccordionContext } from './AccordionContext'

type StyledAccordionDetailsProps = React.HTMLAttributes<HTMLDivElement> & {
    contentClassName?: string
    /**
     * Opt in when the accordion header holds a `DynamicToolbar` (filter + search) directly above a
     * table in this panel, so the gap between the toolbar controls and the table header is the
     * Figma 16 px instead of 24 px. Sets `data-toolbar-header` on the content element; the
     * padding-top then follows the toolbar's layout (`data-layout`, see `StyledAccordion.module.scss`):
     *
     * - `inline` toolbar: `0`. The 72 px summary row already leaves 16 px under the 40 px controls.
     * - any other layout (`compact`, `stacked`, `selection-split`): `1rem`. The controls are the last
     *   row of the toolbar, so the whole 16 px has to come from the content.
     *
     * Default `false`: the content keeps its `padding: 0.5rem 1rem 1rem 1rem`, unchanged. A consumer
     * `contentClassName` with an important padding utility (e.g. `pt-0!`) still wins. Use it only for
     * a toolbar that is a direct child of the accordion root (the panel's sibling).
     */
    toolbarHeader?: boolean
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
    toolbarHeader = false,
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
            <div
                ref={contentRef}
                className={clsx(styles['Content'], contentClassName)}
                data-toolbar-header={toolbarHeader ? '' : undefined}
            >
                {children}
            </div>
        </div>
    )
}
