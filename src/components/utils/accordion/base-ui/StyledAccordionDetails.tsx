import * as React from 'react'
import { Accordion } from '@base-ui-components/react/accordion'
import styles from './StyledAccordion.module.scss'
import { clsx } from 'clsx'

type StyledAccordionDetailsProps = React.HTMLAttributes<HTMLDivElement> & {
    contentClassName?: string
}

export const StyledAccordionDetails = ({
    children,
    className,
    contentClassName,
    ...props
}: StyledAccordionDetailsProps) => (
    <Accordion.Panel {...props} className={clsx(styles['Panel'], className)}>
        <div className={clsx(styles['Content'], contentClassName)}>{children}</div>
    </Accordion.Panel>
)
