import type { Meta } from '@storybook/react'

import { StyledTimePicker } from '../StyledTimePicker'
import { useState } from 'react'

const meta = {
    title: 'Pickers/Time Picker',
    component: StyledTimePicker,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledTimePicker>

export default meta

export const TimePicker = () => {
    const [value, setValue] = useState<Date | undefined>(new Date())

    return (
        <div className='flex w-full gap-4'>
            <StyledTimePicker placeholder='Select time' dataTest='test' value={value} onSelect={setValue} />
            <StyledTimePicker
                placeholder='Select time'
                dataTest='test'
                value={value}
                onSelect={setValue}
                error
                helperText='Some error'
            />
            <StyledTimePicker placeholder='Select time' dataTest='test' value={value} onSelect={setValue} disabled />
        </div>
    )
}
