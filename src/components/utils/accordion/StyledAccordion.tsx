import { Accordion, type AccordionProps } from '@mui/material'
import clsx from 'clsx'

export const StyledAccordion = ({ className, ...props }: AccordionProps) => (
    <Accordion
        {...props}
        disableGutters={true}
        elevation={0}
        className={clsx('rounded-lg border border-gray-300 border-solid', className)}
    />
)
