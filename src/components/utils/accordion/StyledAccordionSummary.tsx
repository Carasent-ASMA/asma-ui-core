import { AccordionSummary, type AccordionSummaryProps } from '@mui/material'
import clsx from 'clsx'
import { ChevronDownIcon } from 'src/components/icons'

export const StyledAccordionSummary = (props: AccordionSummaryProps) => (
    <AccordionSummary
        {...props}
        className={clsx('flex-row-reverse gap-2.5', props.className)}
        expandIcon={<ChevronDownIcon width={24} height={24} />}
        sx={{
            ...props.sx,
            backgroundColor: 'transparent !important',
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                transform: 'rotate(180deg)',
            },
            '& .MuiAccordionSummary-expandIconWrapper:not(.Mui-expanded)': {
                transform: 'rotate(0deg)',
            },
        }}
    />
)
