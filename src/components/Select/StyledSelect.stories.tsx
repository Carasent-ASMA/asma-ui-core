import { Stack, FormControl, InputLabel } from '@mui/material'

import type { ComponentStory, ComponentMeta } from '@storybook/react'

import { StyledSelect } from './StyledSelect'
import React from 'react'
import { StyledSelectItem } from './StyledSelectItem'

export default {
    title: 'Select',
    component: StyledSelect,
} as ComponentMeta<typeof StyledSelect>

const Template: ComponentStory<typeof StyledSelect> = (args) => {
    return (
        <Stack direction='row' spacing={2}>
            <FormControl fullWidth size={args.size}>
                <InputLabel>{args.label}</InputLabel>
                <StyledSelect {...args} />
            </FormControl>
        </Stack>
    )
}

export const Options = [
    { title: 'Van Henry', content: 'Van Henry12' },
    { title: 'April Tucker', content: 'April Tucker12' },
    { title: 'Ralph Hubbard', content: 'Ralph Hubbard21' },
]

export const Default = Template.bind({})
Default.args = {
    label: 'Select name',
    size: 'small',
    onChange: () => {},
    children: (
        <>
            {Options.map((option, index) => {
                return (
                    <StyledSelectItem key={index} value={option.content}>
                        {option.title}
                    </StyledSelectItem>
                )
            })}
        </>
    ),
}
