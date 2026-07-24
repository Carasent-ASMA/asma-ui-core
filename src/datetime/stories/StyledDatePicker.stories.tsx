import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { RangePickerExample } from './components/RangePickerCompactExample'
import { SinglePickerExample } from './components/SinglePickerExample'
import { NestedRangePickerExample } from './components/NestedRangePickerExample.1'
import { DatePickerContainer } from './components/DatePickerContainer'
import { StyledDatePicker } from 'src/datetime/components/date-picker'

const meta = {
    title: 'Datetime/DatePicker',
    component: StyledDatePicker,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledDatePicker>

export default meta

export const DatePicker = () => {
    return (
        <div className='flex flex-col gap-5'>
            <DatePickerContainer title={'Default Picker'} node={<SinglePickerExample />} />
            <DatePickerContainer title={'Range Picker Compact'} node={<RangePickerExample />} />
            <DatePickerContainer title={'Nested Range Picker'} node={<NestedRangePickerExample />} />
        </div>
    )
}

const KeyboardEntryExample = (): JSX.Element => {
    const [date, setDate] = useState<Date>()
    return (
        <StyledDatePicker
            dataTest='kbd-date'
            mode='single'
            selected={date}
            onSelect={setDate}
            onInputChange={setDate}
            label='Date'
            dateFormat='dd.MM.yyyy'
        />
    )
}

/**
 * Regression guard: typing a full date by keyboard must commit and survive re-render/blur. The mask
 * writes the input imperatively; if it desyncs React's value tracker, `onChange` never fires and the
 * typed date is lost on the next re-render (was cleared to '' on blur). See helpers/inputMask.ts.
 */
export const KeyboardEntry: StoryObj<typeof StyledDatePicker> = {
    render: () => <KeyboardEntryExample />,
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByTestId('kbd-date')
        await userEvent.click(input)
        await userEvent.type(input, '15062024')
        await expect(input).toHaveValue('15/06/2024')
        // Blur — the typed date must persist (not clear).
        await userEvent.tab()
        await expect(input).toHaveValue('15/06/2024')
    },
}
