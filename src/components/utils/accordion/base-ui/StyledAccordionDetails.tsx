import * as React from 'react'
import { Accordion } from '@base-ui-components/react/accordion'
import styles from './StyledAccordion.module.scss'

export const StyledAccordionDetails = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <Accordion.Panel {...props} className={styles['Panel']}>
        <div className={styles['Content']}>{children}</div>
    </Accordion.Panel>
)
