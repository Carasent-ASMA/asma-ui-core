import * as React from 'react'
import { Accordion } from '@base-ui/react/accordion'
import clsx from 'clsx'
import styles from './StyledAccordion.module.scss'
import { ChevronDownIcon } from 'src/components/icons'

export type StyledAccordionSummarySize = 'small' | 'large'

export interface StyledAccordionSummaryProps extends React.ComponentProps<typeof Accordion.Trigger> {
    headerClassName?: string | ((state: Accordion.Item.State) => string)
    size?: StyledAccordionSummarySize
    sx?: React.CSSProperties
}

export const StyledAccordionSummary = ({
    size = 'large',
    className,
    headerClassName,
    sx,
    children,
    ...rest
}: StyledAccordionSummaryProps): JSX.Element => {
    const isSmall = size === 'small'

    const styleVars: React.CSSProperties = {
        '--trigger-height': isSmall ? '48px' : '72px',
        '--trigger-padding-x': isSmall ? '8px' : '16px',
        '--trigger-font-size': isSmall ? '14px' : '18px',
        '--chevron-size': isSmall ? '20px' : '24px',
        ...sx,
    } as React.CSSProperties

    return (
        <Accordion.Header className={clsx(styles['Header'], headerClassName)}>
            <Accordion.Trigger {...rest} className={clsx(styles['Trigger'], className)} style={styleVars}>
                <ChevronDownIcon className={styles['TriggerIcon']} data-state-icon />
                {children}
            </Accordion.Trigger>
        </Accordion.Header>
    )
}
