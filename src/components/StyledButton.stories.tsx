import React from 'react'
import type { ComponentStory, ComponentMeta } from '@storybook/react'
// import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import { StyledButton } from './StyledButton'
import { CircularProgress, Stack } from '@mui/material'

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Atoms/Button',
    component: StyledButton,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof StyledButton>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof StyledButton> = (args) => (
    <Stack direction='row' spacing={2}>
        <StyledButton {...args}>{args.variant}styledButton</StyledButton>
        <StyledButton {...args} startIcon={<CircularProgress size={24} style={{ color: 'inherit' }} />}>
            {args.variant} circularprogress
        </StyledButton>
        <StyledButton {...args} disabled>
            {args.variant}
        </StyledButton>
    </Stack>
)

export const Contained = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Contained.args = {
    variant: 'contained',
}

export const Outlined = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Outlined.args = {
    variant: 'outlined',
}
