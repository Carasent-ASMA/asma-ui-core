import * as React from 'react'
import { Accordion } from '@base-ui-components/react/accordion'
import { cn } from 'src/helpers/cn'
import styles from './StyledAccordion.module.scss'

interface StyledAccordionProps
    extends Omit<React.ComponentProps<typeof Accordion.Root>, 'value' | 'onValueChange' | 'defaultValue' | 'onChange'> {
    className?: string
    children: React.ReactNode
    expanded?: boolean // Controlled mode
    defaultExpanded?: boolean // Uncontrolled mode
    onChange?: (expanded: boolean) => void
}

export const StyledAccordion = ({
    className,
    children,
    expanded,
    defaultExpanded,
    onChange,
    ...props
}: StyledAccordionProps): JSX.Element => {
    const value = 'item'

    const accordionProps = {
        ...props,
        type: 'single' as const,
        className: cn(styles['AccordionRoot'], className),
        onValueChange: (newValue: string[]) => {
            onChange?.(newValue.includes(value))
        },
        ...(expanded !== undefined
            ? { value: expanded ? [value] : [] }
            : { defaultValue: defaultExpanded ? [value] : [] }),
    }

    return (
        <Accordion.Root {...accordionProps}>
            <Accordion.Item value={value}>
                {children}
            </Accordion.Item>
        </Accordion.Root>
    )
}
