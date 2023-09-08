import { AccordionSummary, type AccordionSummaryProps } from '@mui/material'
import { ChevronDownIcon } from 'asma-core-ui'
import clsx from 'clsx'

export const StyledAccordionSummary = (props: AccordionSummaryProps) => (
    <AccordionSummary
        {...props}
        className={clsx('flex-row-reverse gap-2.5', props.className)}
        expandIcon={<ChevronDownIcon width={24} height={24} />}
        sx={{
            ...props.sx,
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                transform: 'rotate(0deg)',
            },
            '& .MuiAccordionSummary-expandIconWrapper:not(.Mui-expanded)': {
                transform: 'rotate(-90deg)',
            },
        }}
    />
)
