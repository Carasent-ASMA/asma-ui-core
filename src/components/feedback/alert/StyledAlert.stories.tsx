import type { Meta, StoryObj } from '@storybook/react'
import { StyledAlert } from './StyledAlert'
import { Stack, Typography } from '@mui/material'
import { StyledAlertTitle } from './StyledAlertTitle'

const meta = {
    title: 'Feedback/Styled Alert',
    component: StyledAlert,
    tags: ['autodocs'],
    argTypes: {},
    args: { severity: 'success', variant: 'standard' },
} satisfies Meta<typeof StyledAlert>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
    args: { ...meta.argTypes, children: 'Styled Button', variant: 'outlined' },
    render: () => (
        <Stack direction='column' spacing={2} sx={{ maxWidth: 400 }}>
            <Typography variant='h1'>{meta.args.variant} alert</Typography>
            <StyledAlert {...meta.args} severity='success'>
                <StyledAlertTitle>Success with title</StyledAlertTitle>
                Success body
            </StyledAlert>
            <StyledAlert {...meta.args} severity='success'>
                Success only body text
            </StyledAlert>
            <StyledAlert {...meta.args} severity='warning'>
                Warning only body text
            </StyledAlert>
            <StyledAlert {...meta.args} severity='error'>
                Error only body text
            </StyledAlert>
            <StyledAlert {...meta.args} severity='info'>
                Info only body text
            </StyledAlert>
        </Stack>
    ),
}

// Standard.args = {
//     severity: 'success',
//     variant: 'standard',
// }

// export const Filled = Template.bind({})
// Filled.args = {
//     severity: 'success',
//     variant: 'filled',
// }

// export const Outlined = Template.bind({})
// Outlined.args = {
//     severity: 'success',
//     variant: 'outlined',
// }
