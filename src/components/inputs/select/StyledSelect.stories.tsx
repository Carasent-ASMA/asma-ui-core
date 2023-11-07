import type { StoryObj, Meta } from '@storybook/react'
import { StyledSelect } from './StyledSelect'
import { StyledSelectItem } from './StyledSelectItem'
import { useState } from 'react'
import { StyledFormControl } from '../../miscellaneous/StyledFormControl'
import { StyledStack } from '../../miscellaneous/StyledStack'
import type { SelectProps } from '@mui/material'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledInputLabel } from 'src/components/miscellaneous/StyledInputLabel'

const selectOptions = [
    { title: 'Van Henry', id: '1' },
    { title: 'April Tucker', id: '2' },
    { title: 'Ralph Hubbard', id: '3' },
    { title: 'Andrei Grini', id: '4' },
    { title: 'Roberto Cavalli', id: '5' },
]

const meta = {
    title: 'Inputs/Styled Select',
    component: StyledSelect,
    tags: ['autodocs'],
    argTypes: { children: { description: 'The option elements to populate the select with' } },
    args: {
        children: selectOptions.map((option) => {
            return (
                <StyledSelectItem key={option.id} value={option.id}>
                    {option.title}
                </StyledSelectItem>
            )
        }),
    },
} satisfies Meta<typeof StyledSelect>

export default meta
type Story = StoryObj<typeof StyledSelect>

export const Select: Story = {
    render: () => <StyledSelectExample args={meta.args} />,
}

const StyledSelectExample: React.FC<{ args: Partial<SelectProps<unknown>> }> = ({ args }) => {
    const [value, setValue] = useState(selectOptions[0]?.id)
    return (
        <StyledStack direction='column' spacing={2}>
            <StyledTypography variant='h6'>Select size medium</StyledTypography>
            <StyledFormControl fullWidth>
                <StyledSelect
                    {...args}
                    dataTest='Test_z'
                    size='medium'
                    value={value}
                    onChange={(e) => {
                        const target: string = e.target.value as string
                        setValue(target)
                    }}
                />
            </StyledFormControl>
            <StyledTypography variant='h6'>Select size small</StyledTypography>
            <StyledFormControl fullWidth>
                <StyledSelect
                    {...args}
                    dataTest='Test_y'
                    size='small'
                    value={value}
                    onChange={(e) => {
                        const target: string = e.target.value as string
                        setValue(target)
                    }}
                />
            </StyledFormControl>
            <StyledTypography variant='h6'>Select with label and placeholder</StyledTypography>
            <StyledFormControl size='small' className='w-52'>
                <StyledInputLabel>Find me...</StyledInputLabel>
                <StyledSelect
                    {...args}
                    dataTest='Test_x'
                    allowClear
                    value={value}
                    onChange={(e) => {
                        const target: string = e.target.value as string
                        setValue(target)
                    }}
                />
            </StyledFormControl>
        </StyledStack>
    )
}
