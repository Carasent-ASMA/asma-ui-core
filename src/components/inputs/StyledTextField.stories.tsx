import React from 'react'
import type { ComponentStory, ComponentMeta } from '@storybook/react'
// import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { IconButton, InputAdornment, Stack } from '@mui/material'
import { StyledTextField } from './StyledTextField'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Inputs/TextField',
    component: StyledTextField,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof StyledTextField>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof StyledTextField> = (args) => (
    <>
        <Stack direction='row' spacing={2}>
            <StyledTextField {...args} label='Default' />
            <StyledTextField
                {...args}
                label='Start InputAdornment'
                InputProps={{
                    startAdornment: <InputAdornment position='start'>kg</InputAdornment>,
                }}
            />
            <StyledTextField
                {...args}
                label='End InputAdornment'
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <IconButton aria-label='toggle password visibility' edge='end'>
                                <VisibilityOff />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                placeholder='Password'
            />
        </Stack>
        <Stack direction='row' mt={4}>
            <StyledTextField {...args} label='Full width' FormControlProps={{ fullWidth: true }} />
        </Stack>
    </>
)

export const Default = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
    label: 'Label',
}
