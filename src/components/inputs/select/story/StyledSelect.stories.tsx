import { StyledSelect } from '../StyledSelect'
import { useState } from 'react'
import { StyledTypography } from 'src/components/data-display/typography'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { StyledSelectExample } from './components/StyledSelectExample'
import { StyledInputLabel } from 'src/components/miscellaneous/StyledInputLabel'
import { StyledSelectItem } from '../StyledSelectItem'
import type { Meta } from '@storybook/react'
import { Stack } from '@mui/material'

const selectOptions = [
    { title: 'Van Henry', id: '1' },
    { title: 'April Tucker', id: '2' },
    { title: 'Ralph Hubbard', id: '3' },
    { title: 'Andrei Grini', id: '4' },
    { title: 'Andrei Armani', id: '5' },
]

const meta: Meta<typeof StyledSelect> = {
    title: 'Inputs/Select',
    component: StyledSelect,
    tags: [],
    argTypes: { children: { description: 'The option elements to populate the select with' } },
    args: {
        children: selectOptions.map((option) => (
            <StyledSelectItem key={option.id} value={option.id}>
                {option.title}
            </StyledSelectItem>
        )),
    },
}

export default meta

export const Select = (args: { children: React.ReactNode }) => {
    const [value, setValue] = useState(selectOptions[0]?.id)
    return (
        <Stack direction='column' spacing={2}>
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

            <StyledSelectExample />

            <StyledTypography variant='h6'>Select with label and placeholder</StyledTypography>
            <StyledFormControl size='small' className='w-52' error={!value}>
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
        </Stack>
    )
}
