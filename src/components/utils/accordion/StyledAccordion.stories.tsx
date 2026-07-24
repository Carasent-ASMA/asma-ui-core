import type { Meta } from '@storybook/react-vite'
import { StyledWidgetTitle } from 'src/components/custom/widget/widget-title/StyledWidgetTitle'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledButton } from 'src/components/inputs/button'
import { StyledAccordion } from './base-ui/StyledAccordion'
import { StyledAccordionDetails } from './base-ui/StyledAccordionDetails'
import { StyledAccordionSummary } from './base-ui/StyledAccordionSummary'

const meta: Meta = {
    title: 'Utils/Accordion',
    component: StyledAccordion,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Accordion](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=21228-37809) — radius 8px, padding 16px.',
            },
        },
    },
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
                <StyledAccordionSummary size='large' sx={{ gap: '10px' }}>
                    <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                </StyledAccordionSummary>

                <StyledButton size='small' dataTest='test' {...meta.args} variant='contained'>
                    <div>Button label</div>
                </StyledButton>
            </div>
            <StyledAccordionDetails>
                <StyledTypography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam
                </StyledTypography>
            </StyledAccordionDetails>
        </StyledAccordion>

        <StyledAccordion className='max-w-[600px]'>
            <div className='relative flex items-center justify-between pr-4'>
                <StyledAccordionSummary size='small' sx={{ gap: '10px' }}>
                    <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                </StyledAccordionSummary>
            </div>
            <StyledAccordionDetails>
                <StyledTypography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam
                </StyledTypography>
            </StyledAccordionDetails>
        </StyledAccordion>
    </>
)
