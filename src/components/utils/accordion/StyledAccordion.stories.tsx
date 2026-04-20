import { Typography } from '@mui/material'
import type { Meta } from '@storybook/react-vite'
import { StyledWidgetTitle } from 'src/components/custom/widget/widget-title/StyledWidgetTitle'
import { StyledButton } from 'src/components/inputs/button'
import { StyledAccordion } from './StyledAccordion'
import { StyledAccordionDetails } from './StyledAccordionDetails'
import { StyledAccordionSummary } from './StyledAccordionSummary'

const meta: Meta = {
    title: 'Utils/Accordion',
    component: StyledAccordion,
    tags: [],
    args: {
        title: 'Widget header example',
    },
    argTypes: {},
} satisfies Meta<typeof StyledAccordion>

export default meta

export const Accordion = (): JSX.Element => (
    <>
        <StyledAccordion className='mb-4 max-w-[600px]'>
            <div className='relative flex items-center justify-between pr-4'>
                <StyledAccordionSummary size={'large'} sx={{ flexDirection: 'row-reverse', gap: '10px' }}>
                    <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                </StyledAccordionSummary>

                <StyledButton size='small' dataTest='test' {...meta.args} variant='contained'>
                    <div>Button label</div>
                </StyledButton>
            </div>
            <StyledAccordionDetails>
                <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam
                </Typography>
            </StyledAccordionDetails>
        </StyledAccordion>

        <StyledAccordion className='max-w-[600px]'>
            <div className='relative flex items-center justify-between pr-4'>
                <StyledAccordionSummary size={'small'} sx={{ flexDirection: 'row-reverse', gap: '10px' }}>
                    <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                </StyledAccordionSummary>
            </div>
            <StyledAccordionDetails>
                <Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam
                </Typography>
            </StyledAccordionDetails>
        </StyledAccordion>
    </>
)
