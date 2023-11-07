import type { Meta } from '@storybook/react'
import type { StoryObj } from '@storybook/react'
import { StyledAccordionSummary } from './StyledAccordionSummary'
import { StyledAccordionDetails } from './StyledAccordionDetails'
import { StyledAccordion } from './StyledAccordion'

const meta = {
    title: 'surfaces/Styled Accordion',
    component: StyledAccordion,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledAccordion>

export default meta
type Story = StoryObj<typeof StyledAccordion>

export const Accordion: Story = {
    args: { ...meta.args },
    render: () => <StyledAccordionExample />,
}

const StyledAccordionExample = () => {
    return (
        <StyledAccordion dataTest='accordion' {...meta.args}>
            <StyledAccordionSummary dataTest='accordion-summary'>
                <span className='text-lg font-semibold'>Accordion</span>
            </StyledAccordionSummary>

            <StyledAccordionDetails dataTest='accordion-details'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vestibulum, ipsum id lacinia tincidunt,
                nisi mi placerat ex, id tempor nunc nisl id urna. Pellentesque habitant morbi tristique senectus et
                netus et malesuada fames ac turpis egestas.
            </StyledAccordionDetails>
        </StyledAccordion>
    )
}
