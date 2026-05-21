import type { Meta, StoryObj } from '@storybook/react-vite'
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
        <div className='flex flex-col gap-8'>
            <div>
                <StyledTabs value={value} onChange={handleChange} centered>
                    <StyledTab label='Item One' />
                    <StyledTab label='Item Two' />
                    <StyledTab label='Item Three' />
                    <StyledTab label='Item Four' />
                    <StyledTab label='Item Five' />
                    <StyledTab label='Item Six' />
                    <StyledTab label='Item Seven' />
                    <StyledTab className='capitalize' label='Item nine' disabled />
                </StyledTabs>
            </div>

            <div>
                <StyledTabs
                    value={value}
                    onChange={handleChange}
                    centered
                    variant='scrollable'
                    scrollButtons='auto'
                    className='max-w-[500px]'
                >
                    <StyledTab label='Item One' />
                    <StyledTab label='Item Two' />
                    <StyledTab label='Item Three' />
                    <StyledTab label='Item Four' />
                    <StyledTab label='Item Five' />
                    <StyledTab label='Item Six' />
                    <StyledTab label='Item Seven' />
                    <StyledTab label='Item Nine' disabled />
                </StyledTabs>
            </div>
        </div>
    )
}
