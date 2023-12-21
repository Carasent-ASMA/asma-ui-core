import type { Meta } from '@storybook/react'
import { RangePickerExample } from './components/RangePickerExample'
import { DefaultPickerExample } from './components/DefaultPickerExample'
import { StyledDatePicker } from '../StyledDatePicker'
import { NestedRangePickerExample } from './components/NestedRangePickerExample'
import { DatePickerContainer } from './components/DatePickerContainer'

const meta = {
    title: 'Inputs/Date Picker',
    component: StyledDatePicker,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledDatePicker>

export default meta

export const DatePicker = () => {
    return (
        <div className={'flex flex-col gap-5'}>
            <DatePickerContainer title={'Default Picker'} node={<DefaultPickerExample />} />
            <DatePickerContainer title={'Range Picker'} node={<RangePickerExample />} />
            <DatePickerContainer title={'Nested Range Picker'} node={<NestedRangePickerExample />} />
        </div>
    )
}
