import type { Meta, StoryObj } from '@storybook/react'
import { type TabsProps } from '@mui/material'
import { useState, type FC } from 'react'
import { StyledTabs } from './StyledTabs'
import { StyledTab } from './StyledTab'

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
    args: meta.args,
    render: () => <StyledTabsExample args={meta.args} />,
}

const StyledTabsExample: FC<{ args: Partial<TabsProps> }> = () => {
    const [value, setValue] = useState(0)

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue)
    }

    return (
        <StyledTabs value={value} onChange={handleChange} centered>
            <StyledTab label='Item One' />
            <StyledTab label='Item Two' />
            <StyledTab label='Item Three' />
            <StyledTab label='Item Four' disabled />
        </StyledTabs>
    )
}
