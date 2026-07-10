import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'

import { StyledBadge } from '../../data-display/badge/StyledBadge'
import { StyledLabel } from '../../inputs/label/StyledLabel'
import { StyledTab } from './StyledTab'
import { StyledTabs } from './StyledTabs'

const meta = {
    title: 'Navigation/Styled Tabs',
    component: StyledTabs,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledTabs>

export default meta

type Story = StoryObj<typeof meta>

export const Tabs: Story = {
    render: () => <TabsExample />,
}

export const TabLabelVariants: Story = {
    render: () => <TabLabelVariantsExample />,
}

export const Interactive: Story = {
    render: () => <InteractiveTabs />,
}

export const Scrollable: Story = {
    render: () => <ScrollableTabs />,
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_COLUMN_NAMES = ['Enabled', 'Hovered', 'Focused', 'Disabled'] as const
const TAB_ROW_NAMES = ['Not active', 'Active'] as const
const TAB_BASE_CLASS = 'font-semibold capitalize text-base'

type TabColumnName = (typeof TAB_COLUMN_NAMES)[number]
type AddonType = 'unread-badge' | 'new-label' | 'styled-badge'
type TabsStateTableProps = {
    title: 'Default size' | 'Small size'
    tabSize: 'default' | 'small'
}

const COLUMN_TAB_PROPS: Record<TabColumnName, Partial<ComponentProps<typeof StyledTab>>> = {
    Enabled: {},
    Hovered: {}, // Not implemented yet
    Focused: {}, // Not implemented yet
    Disabled: { disabled: true },
}

const TABS_LABEL_EXAMPLES: Array<{ addon?: AddonType }> = [
    {},
    { addon: 'unread-badge' },
    { addon: 'new-label' },
    { addon: 'styled-badge' },
]

type InteractiveTabConfig = { label: string; disabled?: true }

const INTERACTIVE_TABS: InteractiveTabConfig[] = [
    { label: 'Active' },
    { label: 'Not active' },
    { label: 'Not active' },
    { label: 'Not active' },
    { label: 'Disabled', disabled: true },
]

const SCROLLABLE_TAB_LABELS = [
    'Information',
    'People (8)',
    'Notes (12)',
    'Postjournal (23)',
    'Work records (7)',
    'Vacancies (10)',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTabAddon(addonType: AddonType, dataTestId: string): ReactNode {
    switch (addonType) {
        case 'new-label':
            return (
                <StyledLabel
                    dataTest={`${dataTestId}-label`}
                    className='text-gama-700 bg-gama-50 border border-solid border-gama-100'
                >
                    NEW
                </StyledLabel>
            )
        case 'styled-badge':
            return (
                <StyledBadge dataTest={`${dataTestId}-badge`} badgeContent={3}>
                    <span className='inline-block w-3' />
                </StyledBadge>
            )
        case 'unread-badge':
            return <div className='h-2 w-2 rounded-full bg-gama-400' />
    }
}

function buildTabLabel(addonType: AddonType | undefined, dataTestId: string): ReactNode {
    if (!addonType) return 'Tab label'

    return (
        <span className='inline-flex items-center gap-2'>
            <span>Tab label</span>
            {buildTabAddon(addonType, dataTestId)}
        </span>
    )
}

// ─── Story components ─────────────────────────────────────────────────────────

const TabsStateTable = ({ title, tabSize }: TabsStateTableProps) => {
    return (
        <table className='w-full table-fixed border-collapse text-delta-600 text-lg'>
            <thead className='bg-delta-10 h-[128px]'>
                <tr>
                    <th className='box-border text-delta-800 text-2xl w-[200px] p-6 border border-solid border-delta-200 text-left'>
                        {title}
                    </th>
                    {TAB_COLUMN_NAMES.map((columnName) => (
                        <th key={columnName} className='box-border w-[160px] p-6 border border-solid border-delta-200'>
                            {columnName}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {TAB_ROW_NAMES.map((rowName) => {
                    const isActiveRow = rowName === 'Active'

                    return (
                        <tr key={rowName} className='h-[128px]'>
                            <th scope='row' className='box-border p-6 border border-solid border-delta-200 text-left'>
                                {rowName}
                            </th>
                            {TAB_COLUMN_NAMES.map((columnName) => (
                                <td
                                    key={`${rowName}-${columnName}`}
                                    className='box-border border border-solid border-delta-200'
                                >
                                    <div className='flex items-center justify-center'>
                                        <StyledTabs
                                            className='max-w-fit'
                                            value={isActiveRow ? 0 : false}
                                            size={tabSize}
                                        >
                                            <StyledTab
                                                label='Tab label'
                                                {...COLUMN_TAB_PROPS[columnName]}
                                                className={`font-semibold capitalize ${tabSize === 'small' ? 'text-sm' : 'text-base'}`}
                                            />
                                        </StyledTabs>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

const TabsExample = () => (
    <div className='flex flex-col gap-10'>
        <TabsStateTable title='Default size' tabSize='default' />
        <TabsStateTable title='Small size' tabSize='small' />
    </div>
)

const TabLabelVariantsExample = () => (
    <div className='flex flex-row gap-4 overflow-x-auto flex-nowrap'>
        {TABS_LABEL_EXAMPLES.map(({ addon }, index) => (
            <div key={index} className='flex-shrink-0'>
                <StyledTabs value={1}>
                    <StyledTab label={buildTabLabel(addon, `tabs-example-${index}-first`)} className={TAB_BASE_CLASS} />
                    <StyledTab
                        label={buildTabLabel(addon, `tabs-example-${index}-second`)}
                        className={TAB_BASE_CLASS}
                    />
                </StyledTabs>
            </div>
        ))}
    </div>
)

const InteractiveTabs = () => {
    const [value, setValue] = useState<number | false>(0)

    return (
        <StyledTabs value={value} onChange={(_, newValue) => setValue(newValue as number)} className='max-w-fit'>
            {INTERACTIVE_TABS.map(({ label, disabled }, index) => (
                <StyledTab key={index} label={label} disabled={disabled} className={TAB_BASE_CLASS} />
            ))}
        </StyledTabs>
    )
}

const ScrollableTabs = () => {
    const [value, setValue] = useState<number | false>(0)

    return (
        <StyledTabs
            value={value}
            onChange={(_, newValue) => setValue(newValue as number)}
            variant='scrollable'
            scrollButtons='auto'
            className='max-w-[600px]'
        >
            {SCROLLABLE_TAB_LABELS.map((label, index) => (
                <StyledTab key={index} label={label} className={TAB_BASE_CLASS} />
            ))}
        </StyledTabs>
    )
}
