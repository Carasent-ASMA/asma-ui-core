import type { Meta, StoryObj } from '@storybook/react'
import { StyledSnackbar } from './StyledSnackbar'
import { IconButton, Stack } from '@mui/material'
import { StyledButton } from '../../inputs/button/StyledButton'
import React from 'react'
import { StyledAlert } from '../alert/StyledAlert'
import { enqueueSnackbar } from 'notistack'
import { Icon } from '@iconify/react'

const meta = {
    title: 'Feedback/Styled Snackbar',
    component: StyledSnackbar,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledSnackbar>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const SnackBar: Story = {
    args: { ...meta.args },
    render: () => <SnackbarExample />,
}

export const SnackbarExample = () => {
    const [openDefault, setOpenDefault] = React.useState(false)
    const [openAlert, setOpenAlert] = React.useState(false)

    const handleOpen = () => {
        setOpenAlert(false)
        setOpenDefault(true)
    }

    const handleClose = () => {
        setOpenDefault(false)
    }

    const handleOpenAlert = () => {
        setOpenDefault(false)
        setOpenAlert(true)
    }

    const handleCloseAlert = () => {
        setOpenAlert(false)
    }

    return (
        <Stack direction='column' spacing={2} sx={{ maxWidth: 400 }}>
            <StyledButton
                onClick={() => {
                    enqueueSnackbar({
                        variant: 'alert',
                        message: 'Nice snack',
                        severity: 'success',
                        alertVariant: 'filled',
                        closeButton: true,
                    })
                }}
            >
                Show snackbar using notistack
            </StyledButton>

            <StyledButton onClick={handleOpen}>Show default snackbar with action</StyledButton>
            <StyledSnackbar
                open={openDefault}
                onClose={handleClose}
                message='Nice default snack'
                action={
                    <>
                        <StyledButton variant='text' onClick={handleClose} color='inherit'>
                            Close
                        </StyledButton>
                        <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
                            <Icon icon={'ic:baseline-close'} className={'text-2xl'} />
                        </IconButton>
                    </>
                }
            />

            <StyledButton onClick={handleOpenAlert}>Show snackbar with alert</StyledButton>
            <StyledSnackbar open={openAlert} onClose={handleCloseAlert}>
                <StyledAlert onClose={handleCloseAlert} severity='success' variant='filled' sx={{ width: '100%' }}>
                    Nice alert snack
                </StyledAlert>
            </StyledSnackbar>
        </Stack>
    )
}
