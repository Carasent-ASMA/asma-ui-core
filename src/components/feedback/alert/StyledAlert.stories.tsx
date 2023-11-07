import type { Meta, StoryObj } from '@storybook/react'
import { StyledAlert } from './StyledAlert'
import { Stack, Typography } from '@mui/material'
import { StyledAlertTitle } from './StyledAlertTitle'
import { useState } from 'react'

const meta = {
    title: 'Feedback/Styled Alert',
    component: StyledAlert,
    tags: ['autodocs'],
    argTypes: {},
    args: { severity: 'success', variant: 'filled' },
} satisfies Meta<typeof StyledAlert>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
    args: { ...meta.argTypes, children: 'Styled Button', variant: 'outlined' },
    render: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [, setOpen] = useState(true)

        const handleClose = () => {
            setOpen(false)
        }

        return (
            <>
                <Stack direction='column' spacing={2} sx={{ maxWidth: 400 }}>
                    <Typography variant='h6'>{meta.args.variant} alert</Typography>
                    <StyledAlert {...meta.args} dataTest='success-alert-with-title' severity='success' variant='filled' onClose={handleClose}>
                        <StyledAlertTitle dataTest='success-alert-title'>Success with title</StyledAlertTitle>
                        Success body lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent
                        libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis
                        sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
                    </StyledAlert>
                    <StyledAlert {...meta.args} dataTest='success-alert' severity='success' variant='filled' title='test title'>
                        Success only body text
                    </StyledAlert>
                    <StyledAlert
                        {...meta.args}
                        dataTest='success-alert-with-closing'
                        severity='success'
                        variant='filled'
                        title='test title'
                        onClose={handleClose}
                    >
                        Success only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} dataTest='warning-alert-with-title' severity='warning' variant='filled'>
                        <StyledAlertTitle dataTest='warning-alert-title'>Warning with title</StyledAlertTitle>
                        Warning only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} dataTest='warning-alert' severity='warning' variant='filled'>
                        Warning only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} dataTest='error-alert-with-title' severity='error' variant='filled'>
                        <StyledAlertTitle dataTest='error-alert-title'>Error with title</StyledAlertTitle>
                        Error only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} dataTest='info-alert-with-title' severity='info' variant='filled'>
                        <StyledAlertTitle dataTest='info-alert-title'>Info with title</StyledAlertTitle>
                        Info only body text
                    </StyledAlert>
                </Stack>

                <Stack direction='column' spacing={2} mt={4} sx={{ maxWidth: 400 }}>
                    <Typography variant='h6'>outlined alert</Typography>

                    <StyledAlert {...meta.args} dataTest='outlined-success-alert-with-title' severity='success' variant='outlined'>
                        <StyledAlertTitle dataTest='outlined-success-alert-title'>Success with title</StyledAlertTitle>
                        Success body
                    </StyledAlert>

                    <StyledAlert {...meta.args} dataTest='outlined-error-alert-with-title' severity='error' variant='outlined'>
                        <StyledAlertTitle dataTest='outlined-error-alert-title'>Error with title</StyledAlertTitle>
                        Error body
                    </StyledAlert>

                    <StyledAlert {...meta.args} dataTest='outlined-warning-alert-with-title' severity='warning' variant='outlined'>
                        <StyledAlertTitle dataTest='outlined-warning-alert-title'>Warning with title</StyledAlertTitle>
                        Warning body
                    </StyledAlert>

                    <StyledAlert {...meta.args} dataTest='outlined-info-alert-with-title' severity='info' variant='outlined'>
                        <StyledAlertTitle dataTest='outlined-info-alert-title'>Info with title</StyledAlertTitle>
                        Info body
                    </StyledAlert>
                </Stack>
            </>
        )
    },
}
