import { Accordion, type AccordionProps } from '@mui/material'
import clsx from 'clsx'

export const StyledAccordion = ({ className, ...props }: AccordionProps): JSX.Element => (
    <Accordion
        {...props}
        disableGutters={true}
        elevation={0}
        className={clsx('rounded-lg border border-solid border-gray-300', className)}
    />
)
