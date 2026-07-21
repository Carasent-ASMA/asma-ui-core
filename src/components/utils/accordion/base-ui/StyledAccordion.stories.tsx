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
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </StyledAccordionDetails>
                </StyledAccordion>
            </div>
        )
    },
}

// ─── Gallery ────────────────────────────────────────────────────────────────
// Figma Accordion (node 21228-37809) has no hover/focus symbol matrix — the header is a composite
// "Toolbar". Its real variants are Size (Default 72px/18px · Small 48px/14px) × expanded/collapsed ×
// chevron placement (left default / right) × disabled. This gallery lays those out with visible
// borders so every variant is verifiable at a glance.

interface AccordionVariant {
    title: string
    size: 'large' | 'small'
    expandChevronRight?: boolean
    defaultExpanded?: boolean
    disabled?: boolean
}

const ACCORDION_VARIANTS: AccordionVariant[] = [
    { title: 'Default (large) · collapsed · chevron left', size: 'large' },
    { title: 'Default (large) · expanded · chevron left', size: 'large', defaultExpanded: true },
    { title: 'Default (large) · expanded · chevron right', size: 'large', defaultExpanded: true, expandChevronRight: true },
    { title: 'Default (large) · disabled', size: 'large', disabled: true },
    { title: 'Small · collapsed · chevron left', size: 'small' },
    { title: 'Small · expanded · chevron left', size: 'small', defaultExpanded: true },
]

export const Gallery = {
    render: (): JSX.Element => (
        <div className='flex max-w-[640px] flex-col gap-6'>
            {ACCORDION_VARIANTS.map((v) => (
                <label key={v.title} className='flex flex-col gap-2 text-sm font-semibold text-delta-800'>
                    {v.title}
                    <StyledAccordion
                        defaultExpanded={v.defaultExpanded}
                        disabled={v.disabled}
                        className='rounded-lg border border-solid border-delta-300'
                    >
                        <StyledAccordionSummary size={v.size} expandChevronRight={v.expandChevronRight}>
                            <StyledWidgetTitle>Header lorem ipsum</StyledWidgetTitle>
                        </StyledAccordionSummary>
                        <StyledAccordionDetails>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </StyledAccordionDetails>
                    </StyledAccordion>
                </label>
            ))}
        </div>
    ),
}
