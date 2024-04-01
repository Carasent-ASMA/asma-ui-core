import type { Meta, StoryObj } from '@storybook/react'
import { StyledAlert } from './StyledAlert'
import { Stack, Typography } from '@mui/material'
import { StyledAlertTitle } from './StyledAlertTitle'
import { useState } from 'react'

const meta = {
    title: 'Feedback/Alert',
    component: StyledAlert,
    tags: [],
    argTypes: {},
    args: { severity: 'success', variant: 'filled' },
} satisfies Meta<typeof StyledAlert>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Alert: Story = {
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
                    <StyledAlert {...meta.args} severity='success' variant='filled' onClose={handleClose}>
                        <StyledAlertTitle>Success with title</StyledAlertTitle>
                        Success body lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent
                        libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis
                        sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
                    </StyledAlert>
                    <StyledAlert {...meta.args} severity='success' variant='filled' title='test title'>
                        Success only body text
                    </StyledAlert>
                    <StyledAlert
                        {...meta.args}
                        severity='success'
                        variant='filled'
                        title='test title'
                        onClose={handleClose}
                    >
                        Success only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} severity='warning' variant='filled'>
                        <StyledAlertTitle>Warning with title</StyledAlertTitle>
                        Warning only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} severity='warning' variant='filled'>
                        Warning only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} severity='error' variant='filled'>
                        <StyledAlertTitle>Error with title</StyledAlertTitle>
                        Error only body text
                    </StyledAlert>
                    <StyledAlert {...meta.args} severity='info' variant='filled'>
                        <StyledAlertTitle>Info with title</StyledAlertTitle>
                        Info only body text
                    </StyledAlert>
                </Stack>

                <Stack direction='column' spacing={2} mt={4} sx={{ maxWidth: 400 }}>
                    <Typography variant='h6'>outlined alert</Typography>

                    <StyledAlert {...meta.args} severity='success' variant='outlined'>
                        <StyledAlertTitle>Success with title</StyledAlertTitle>
                        Success body
                    </StyledAlert>

                    <StyledAlert {...meta.args} severity='error' variant='outlined'>
                        <StyledAlertTitle>Error with title</StyledAlertTitle>
                        Error body
                    </StyledAlert>

                    <StyledAlert {...meta.args} severity='warning' variant='outlined'>
                        <StyledAlertTitle>Warning with title</StyledAlertTitle>
                        Warning body
                    </StyledAlert>

                    <StyledAlert {...meta.args} severity='info' variant='outlined'>
                        <StyledAlertTitle>Info with title</StyledAlertTitle>
                        Info body
                    </StyledAlert>
                </Stack>
            </>
        )
    },
}
