import type { Meta, StoryObj } from '@storybook/react'
import { StyledAccordion } from './StyledAccordion'
import { StyledAccordionSummary } from './StyledAccordionSummary'
import { StyledAccordionDetails } from './StyledAccordionDetails'
import { Typography } from '@mui/material'
import { StyledButton } from 'src/components/inputs/button'
import { StyledWidgetTitle } from 'src/components/custom/widget/widget-title/StyledWidgetTitle'

const meta: Meta<typeof StyledAccordion> = {
    title: 'Utils/Accordion/BaseUi',
    component: StyledAccordion,
    tags: [],
    args: {
        title: 'Widget header example',
    },
}

export default meta

type Story = StoryObj<typeof StyledAccordion>

export const Accordion: Story = {
    render: () => (
        <div className='max-w-[600px] flex flex-col gap-4'>
            <StyledAccordion defaultExpanded={true}>
                <div className='relative flex items-center justify-between pr-4'>
                    <StyledAccordionSummary size='large'>
                        <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                    </StyledAccordionSummary>
                </div>

                <StyledAccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </Typography>
                </StyledAccordionDetails>
            </StyledAccordion>
            <StyledAccordion defaultExpanded={true}>
                <div className='relative flex items-center justify-between pr-4'>
                    <StyledAccordionSummary size='small'>
                        <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                    </StyledAccordionSummary>
                </div>

                <StyledAccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </Typography>
                </StyledAccordionDetails>
            </StyledAccordion>
        </div>
    ),
}
