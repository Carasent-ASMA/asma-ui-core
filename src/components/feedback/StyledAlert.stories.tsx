import type { ComponentMeta, ComponentStory } from '@storybook/react'
import { StyledAlert } from './StyledAlert'
import { Stack, Typography } from '@mui/material'
import { StyledAlertTitle } from './StyledAlertTitle'

export default {
    title: 'Feedback/Alert',
    component: StyledAlert,
} as ComponentMeta<typeof StyledAlert>

const Template: ComponentStory<typeof StyledAlert> = (args) => (
    <Stack direction='column' spacing={2} sx={{ maxWidth: 400 }}>
        <Typography variant='h1'>{args.variant} alert</Typography>
        <StyledAlert {...args} severity='success'>
            <StyledAlertTitle>Success with title</StyledAlertTitle>
            Success body
        </StyledAlert>
        <StyledAlert {...args} severity='success'>
            Success only body text
        </StyledAlert>
        <StyledAlert {...args} severity='warning'>
            Warning only body text
        </StyledAlert>
        <StyledAlert {...args} severity='error'>
            Error only body text
        </StyledAlert>
        <StyledAlert {...args} severity='info'>
            Info only body text
        </StyledAlert>
    </Stack>
)

export const Standard = Template.bind({})
Standard.args = {
    severity: 'success',
    variant: 'standard',
}

export const Filled = Template.bind({})
Filled.args = {
    severity: 'success',
    variant: 'filled',
}

export const Outlined = Template.bind({})
Outlined.args = {
    severity: 'success',
    variant: 'outlined',
}
