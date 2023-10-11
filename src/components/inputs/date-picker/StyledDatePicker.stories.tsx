import type { StoryObj, Meta } from '@storybook/react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { nb } from 'date-fns/locale'

import { StyledDatePicker } from './StyledDatePicker'

const meta = {
    title: 'Inputs/Styled Date Picker',
    component: StyledDatePicker,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledDatePicker>

export default meta
type Story = StoryObj<typeof StyledDatePicker>

export const DatePicker: Story = {
    render: () => <StyledDatePickerExample />,
}

export const StyledDatePickerExample = () => {
    const [date, setDate] = useState<Date>()
    const [range, setRange] = useState<DateRange>()
    const [rangeCompact, setRangeCompact] = useState<DateRange>()

    return (
        <div className={'flex flex-col gap-5'}>
            <StyledDatePicker placeholder='Pick a date' mode='single' selected={date} onSelect={setDate} />
            <StyledDatePicker placeholder='Disabled' mode='single' disabled />
            <StyledDatePicker
                placeholder='Pick a range date'
                numberOfMonths={2}
                mode='range'
                selected={range}
                onSelect={setRange}
                locale={nb}
                dateFormat={'dd.MM.y'}
            />
            <StyledDatePicker
                placeholderFrom='Fra'
                placeholderTo='Til'
                numberOfMonths={2}
                compact={true}
                mode='range'
                selected={rangeCompact}
                onSelect={setRangeCompact}
                dateFormat={'dd.MM.yy'}
            />
            <StyledDatePicker
                placeholderFrom='Fra'
                placeholderTo='Til'
                numberOfMonths={2}
                compact={true}
                mode='range'
                disabled
            />
        </div>
    )
}
