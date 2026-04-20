import { Typography } from '@mui/material'
import type { Meta } from '@storybook/react-vite'
import { useState } from 'react'
import { StyledWidgetTitle } from 'src/components/custom/widget/widget-title/StyledWidgetTitle'
import { StyledAccordion } from './StyledAccordion'
import { StyledAccordionDetails } from './StyledAccordionDetails'
import { StyledAccordionSummary } from './StyledAccordionSummary'

const meta: Meta<typeof StyledAccordion> = {
    title: 'Utils/Accordion/BaseUi',
    component: StyledAccordion,
    tags: [],
    args: {
        title: 'Widget header example',
    },
}

export default meta

export const Accordion = {
    render: (): JSX.Element => {
        const [, setIsExpanded] = useState(true)

        return (
            <div className='flex max-w-[600px] flex-col gap-4'>
                <StyledAccordion onChange={setIsExpanded}>
                    <div className='flex items-center justify-between pr-4'>
                        <StyledAccordionSummary className='' size='large' expandChevronRight>
                            <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                        </StyledAccordionSummary>

                        {/* {isExpanded && <StyledButton size='small' dataTest='test' {...meta.args} variant='contained'>
                            <div>Button label</div>
                        </StyledButton>} */}
                    </div>

                    <StyledAccordionDetails>
                        <Typography>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                    </StyledAccordionDetails>
                </StyledAccordion>
            </div>
        )
    },
}
