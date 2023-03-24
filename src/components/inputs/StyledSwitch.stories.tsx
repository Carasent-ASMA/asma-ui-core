import React from 'react'
import type { ComponentStory, ComponentMeta } from '@storybook/react'
// import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import { StyledSwitch } from './StyledSwitch'
import { StyledFormControlLabel } from './StyledFormControlLabel'
import { Stack } from '@mui/material'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Inputs/Switch',
    component: StyledSwitch,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof StyledSwitch>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof StyledSwitch> = (args) => (
    <Stack direction='row' spacing={2}>
        <StyledFormControlLabel label='Unchecked' control={<StyledSwitch {...args} />} />
        <StyledFormControlLabel label='Checked' control={<StyledSwitch {...args} defaultChecked />} />
        <StyledFormControlLabel label='Disabled' control={<StyledSwitch {...args} disabled />} />
    </Stack>
)

export const Default = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {}
