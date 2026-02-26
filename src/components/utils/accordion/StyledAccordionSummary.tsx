import { AccordionSummary } from '@mui/material'
import type { AccordionSummaryProps } from '@mui/material'
import clsx from 'clsx'
import { ChevronDownIcon } from 'src/components/icons'

export type StyledAccordionSummarySize = 'small' | 'large'

export interface StyledAccordionSummaryProps extends AccordionSummaryProps {
    size?: StyledAccordionSummarySize
    expandChevronRight?: boolean
}

export const StyledAccordionSummary = ({
    size = 'large',
    expandChevronRight,
    className,
    sx,
    children,
    ...rest
}: StyledAccordionSummaryProps) => {
    const isSmall = size === 'small'

    const height = isSmall ? 48 : 72
    const paddingX = isSmall ? 8 : 16
    const fontSize = isSmall ? 14 : 18
    const chevronSize = isSmall ? 20 : 24

    return (
        <AccordionSummary
            {...rest}
            className={clsx(
            expandChevronRight ? 'flex-row justify-between items-center w-full' : 'flex-row-reverse gap-2.5', className)}
            expandIcon={<ChevronDownIcon className='text-delta-800' width={chevronSize} height={chevronSize} />}
            sx={{
                minHeight: height,
                '&.Mui-expanded': {
                    minHeight: height,
                },
                ...sx,
                px: `${paddingX}px`,
                backgroundColor: 'transparent !important',
                '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                    transform: 'rotate(180deg)',
                },
                '& .MuiAccordionSummary-expandIconWrapper:not(.Mui-expanded)': {
                    transform: 'rotate(0deg)',
                },
                '& .MuiAccordionSummary-content': {
                    margin: 0,
                    fontSize: `${fontSize}px`,
                },
            }}
        >
            {children}
        </AccordionSummary>
    )
}
