import type { StoryObj, Meta } from '@storybook/react'

import { StyledTimePicker } from './StyledTimePicker'
import { useState } from 'react'

const meta = {
    title: 'Inputs/Styled Time Picker',
    component: StyledTimePicker,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledTimePicker>

export default meta
type Story = StoryObj<typeof StyledTimePicker>

export const TimePicker: Story = {
    render: () => <StyledTimePickerExample />,
}

export const StyledTimePickerExample = () => {
    const [value, setValue] = useState<Date | undefined>(new Date())

    return (
        <div className='flex w-full gap-4'>
            <StyledTimePicker value={value} onSelect={setValue} />
            <StyledTimePicker value={value} onSelect={setValue} disabled />
        </div>
    )
}
