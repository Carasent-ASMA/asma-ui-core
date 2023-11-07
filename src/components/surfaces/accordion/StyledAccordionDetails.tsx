import { AccordionDetails, type AccordionDetailsProps } from '@mui/material'

export const StyledAccordionDetails = ({dataTest, ...props}: AccordionDetailsProps & { dataTest?: string }) => <AccordionDetails data-test={dataTest} {...props} />
