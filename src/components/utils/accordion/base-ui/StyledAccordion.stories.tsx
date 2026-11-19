import type { Meta } from '@storybook/react-vite'
import { useState } from 'react'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { StyledWidgetTitle } from 'src/components/custom/widget/widget-title/StyledWidgetTitle'
import { DynamicToolbar } from 'src/components/custom/module/header-layout/DynamicToolbar'
import { StyledSearchField } from 'src/components/inputs/search-field'
import { StyledFilterButton } from 'src/components/utils/filter-menu/StyledFilterButton'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import type { ColumnDef } from '@tanstack/react-table'
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

export const Outlined = {
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
                        {/* A real control in the panel, to check by hand what the interaction suite
                            asserts: collapsed, the panel is `inert`, so Tab goes straight from the
                            header past this button; expanded, it is an ordinary tab stop. */}
                        <StyledButton dataTest='accordion-panel-action' size='small' variant='contained'>
                            Button inside the panel
                        </StyledButton>
                    </StyledAccordionDetails>
                </StyledAccordion>
            </div>
        )
    },
}

export const Text = {
    render: (): JSX.Element => {
        const [, setIsExpanded] = useState(true)

        return (
            <div className='flex max-w-[600px] flex-col gap-4'>
                <StyledAccordion variant='text' onChange={setIsExpanded}>
                    <StyledAccordionSummary
                        expandChevronRight
                        sx={{ '--trigger-height': '40px' } as React.CSSProperties}
                    >
                        Header lorem ipsum
                    </StyledAccordionSummary>

                    <StyledAccordionDetails>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <StyledButton dataTest='accordion-panel-action' size='small' variant='contained'>
                            Button inside the panel
                        </StyledButton>
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
    chevronAlign?: 'edge' | 'title'
    defaultExpanded?: boolean
    disabled?: boolean
}

const ACCORDION_VARIANTS: AccordionVariant[] = [
    { title: 'Default (large) · collapsed · chevron left', size: 'large' },
    { title: 'Default (large) · expanded · chevron left', size: 'large', defaultExpanded: true },
    {
        title: 'Default (large) · expanded · chevron right',
        size: 'large',
        defaultExpanded: true,
        expandChevronRight: true,
    },
    {
        title: 'Default (large) · collapsed · chevron after title',
        size: 'large',
        expandChevronRight: true,
        chevronAlign: 'title',
    },
    { title: 'Default (large) · disabled', size: 'large', disabled: true },
    { title: 'Small · collapsed · chevron left', size: 'small' },
    { title: 'Small · expanded · chevron left', size: 'small', defaultExpanded: true },
]

export const Gallery = {
    // axe: landmark-unique (duplicate landmark without a unique label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
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
                        <StyledAccordionSummary
                            size={v.size}
                            expandChevronRight={v.expandChevronRight}
                            chevronAlign={v.chevronAlign}
                        >
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

// ─── Toolbar header (ASMA-8600) ─────────────────────────────────────────────
// An accordion whose header is a DynamicToolbar (filter + search) directly above a table. Figma wants
// 16px from the controls to the table header. `toolbarHeader` on StyledAccordionDetails makes the
// content's padding-top follow the toolbar's layout: inline (container >= 744px) 0, because the 72px
// summary row already leaves 16px under the 40px controls; compact/stacked 16, because the controls
// are the toolbar's last row. Without the prop the content keeps its default padding (8px top).
// VRT: skipped like every DynamicToolbar story (ResizeObserver width planning oscillates), see
// visual-tests/stories.spec.ts; the gap is asserted in StyledAccordion.toolbarHeader.interaction.test.tsx.

interface ToolbarRow {
    id: string
    name: string
    status: string
}

const TOOLBAR_ROWS: ToolbarRow[] = [
    { id: '1', name: 'Participant consent', status: 'Accepted' },
    { id: '2', name: 'Data processing', status: 'Pending' },
    { id: '3', name: 'Marketing', status: 'Rejected' },
]

const TOOLBAR_COLUMNS: ColumnDef<ToolbarRow>[] = [
    { accessorKey: 'name', header: 'Name', size: 200 },
    { accessorKey: 'status', header: 'Status', size: 160 },
]

const ToolbarHeaderDemo = ({ width }: { width: number }): JSX.Element => {
    const [search, setSearch] = useState('')

    return (
        <div style={{ width }}>
            <StyledAccordion defaultExpanded className='rounded-lg border border-solid border-delta-300'>
                <DynamicToolbar
                    title={
                        <StyledAccordionSummary sx={{ '--trigger-padding-x': '0px' } as React.CSSProperties}>
                            Consents
                        </StyledAccordionSummary>
                    }
                    className='px-4'
                    filter={
                        <StyledFilterButton dataTest='filter' filterIsActive={false} size='medium' label='Filter' />
                    }
                    search={
                        <StyledSearchField
                            dataTest='search'
                            label='Search'
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onClear={() => setSearch('')}
                        />
                    }
                />
                <StyledAccordionDetails toolbarHeader className='flex flex-col'>
                    <StyledTable<ToolbarRow> columns={TOOLBAR_COLUMNS} data={TOOLBAR_ROWS} hideFooter locale='en' />
                </StyledAccordionDetails>
            </StyledAccordion>
        </div>
    )
}

/** Inline toolbar (container >= 744px): content padding-top 0, 16px from the controls to the table. */
export const ToolbarHeaderWide = {
    render: (): JSX.Element => <ToolbarHeaderDemo width={900} />,
}

/** Compact toolbar (container < 744px): content padding-top 16px, 16px from the controls to the table. */
export const ToolbarHeaderNarrow = {
    render: (): JSX.Element => <ToolbarHeaderDemo width={480} />,
}
