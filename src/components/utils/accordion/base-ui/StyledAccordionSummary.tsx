import * as React from 'react'
import clsx from 'clsx'
import styles from './StyledAccordion.module.scss'
import { ChevronDownIcon } from 'src/components/icons'
import { useAccordionContext } from './AccordionContext'

export type StyledAccordionSummarySize = 'small' | 'large'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#21228-37809
 * The accordion header. Figma: rounded-8 white container (border/outline delta-300), 16px padding,
 * title = Section title 18px SemiBold delta-800 with a 24px chevron. Figma places the chevron to the
 * **left** of the title; `expandChevronRight` opts into the right-hand (MUI-style) placement.
 */
export interface StyledAccordionSummaryProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    headerClassName?: string
    /** @figmaProp size = large→"Default" (72px, 18px title) | small→48px, 14px */
    size?: StyledAccordionSummarySize
    /** @figmaProp Chevron placement — Figma default is left; true = right (MUI parity) */
    expandChevronRight?: boolean
    sx?: React.CSSProperties
}

/**
 * Native accordion trigger (replaces `@base-ui/react`): a `<button aria-expanded aria-controls>`
 * inside a header, toggling the shared context. `data-panel-open` drives the chevron rotation in
 * SCSS. TASK-201.
 */
export const StyledAccordionSummary = ({
    size = 'large',
    expandChevronRight,
    className,
    headerClassName,
    sx,
    children,
    onClick,
    ...rest
}: StyledAccordionSummaryProps): JSX.Element => {
    const { open, toggle, disabled, triggerId, panelId } = useAccordionContext()
    const isSmall = size === 'small'

    const styleVars: React.CSSProperties = {
        '--trigger-height': isSmall ? '48px' : '72px',
        '--trigger-padding-x': isSmall ? '8px' : '16px',
        '--trigger-font-size': isSmall ? '14px' : '18px',
        '--chevron-size': isSmall ? '20px' : '24px',
        ...sx,
    } as React.CSSProperties

    const chevron = (
        <ChevronDownIcon
            className={clsx(styles['TriggerIcon'], expandChevronRight && styles['TriggerIconRight'])}
            data-state-icon
        />
    )

    return (
        <h3 className={clsx(styles['Header'], headerClassName)}>
            <button
                {...rest}
                type='button'
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                disabled={disabled}
                onClick={(e) => {
                    onClick?.(e)
                    toggle()
                }}
                className={clsx(styles['Trigger'], className)}
                style={styleVars}
                data-panel-open={open ? '' : undefined}
            >
                {/* Figma places the chevron LEFT of the title (default); `expandChevronRight` opts into right. */}
                {expandChevronRight ? (
                    <>
                        {children}
                        {chevron}
                    </>
                ) : (
                    <>
                        {chevron}
                        {children}
                    </>
                )}
            </button>
        </h3>
    )
}
