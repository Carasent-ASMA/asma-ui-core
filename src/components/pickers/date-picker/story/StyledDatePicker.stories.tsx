import React from 'react'
import type { Meta } from '@storybook/react'
import { RangePickerCompactExample } from './components/RangePickerCompactExample'
import { SinglePickerExample } from './components/SinglePickerExample'
import { StyledDatePicker } from '../StyledDatePicker'
import { NestedRangePickerExample } from './components/NestedRangePickerExample'
import { DatePickerContainer } from './components/DatePickerContainer'
import { RangePickerExample } from './components/RangePickerExample'

const meta = {
    title: 'Pickers/Date Picker',
    component: StyledDatePicker,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledDatePicker>

export default meta

export const DatePicker = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}
        >
            <DatePickerContainer title={'Default Picker'} node={<SinglePickerExample />} />
            <DatePickerContainer title={'Range Picker'} node={<RangePickerExample />} />
            <DatePickerContainer title={'Range Picker Compact'} node={<RangePickerCompactExample />} />
            <DatePickerContainer title={'Nested Range Picker'} node={<NestedRangePickerExample />} />
        </div>
    )
}
