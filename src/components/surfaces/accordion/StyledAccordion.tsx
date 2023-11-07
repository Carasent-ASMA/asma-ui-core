import { Accordion, type AccordionProps } from '@mui/material'

export interface StyledAccordionProps extends AccordionProps {
    dataTest?: string
}

export const StyledAccordion = ({dataTest, ...props}: StyledAccordionProps & { dataTest?: string }) => <Accordion data-test={dataTest} {...props} />
