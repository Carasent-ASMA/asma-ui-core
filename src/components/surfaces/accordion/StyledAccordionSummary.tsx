import { AccordionSummary, type AccordionSummaryProps } from '@mui/material'
import { ChevronDownIcon } from 'asma-core-ui'
import clsx from 'clsx'

export const StyledAccordionSummary = ({dataTest, ...props}: AccordionSummaryProps & { dataTest?: string }) => (
    <AccordionSummary
        {...props}
        data-test={dataTest}
        className={clsx('flex-row-reverse gap-2.5', props.className)}
        expandIcon={<ChevronDownIcon width={24} height={24} />}
        sx={{
            ...props.sx,
            backgroundColor: 'transparent !important',
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                transform: 'rotate(0deg)',
            },
            '& .MuiAccordionSummary-expandIconWrapper:not(.Mui-expanded)': {
                transform: 'rotate(-90deg)',
            },
        }}
    />
)
