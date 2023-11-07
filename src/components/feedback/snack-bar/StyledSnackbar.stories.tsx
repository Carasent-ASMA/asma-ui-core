import type { Meta, StoryObj } from '@storybook/react'
import { StyledSnackbar } from './StyledSnackbar'
import { IconButton, Stack } from '@mui/material'
import { StyledButton } from '../../inputs/button/StyledButton'
import React from 'react'
import { StyledAlert } from '../alert/StyledAlert'
import { Icon } from '@iconify/react'
import { SnackbarProvider } from './SnackbarProvider'
import { processInfoSnackbar } from './processInfoSnackbar'

const meta = {
    title: 'Feedback/Styled Snackbar',
    component: StyledSnackbar,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledSnackbar>

export default meta
type Story = StoryObj<typeof meta>

export const SnackBar: Story = {
    args: { ...meta.args },
    render: () => <SnackbarExample />,
}

const SnackbarExample = () => {
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
                dataTest='btn-snackbar-notistack'
                onClick={() => {
                    processInfoSnackbar('Shared successfully!')
                }}
            >
                Show snackbar using notistack
            </StyledButton>
            <SnackbarProvider autoHideDuration={3000} />

            <StyledButton dataTest='btn-default-snackbar-with-actions' onClick={handleOpen}>Show default snackbar with action</StyledButton>
            <StyledSnackbar
                dataTest='default-snackbar'
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={openDefault}
                onClose={handleClose}
                message='Nice default snack'
                action={
                    <>
                        <StyledButton dataTest='btn-close' variant='text' onClick={handleClose} color='inherit'>
                            Close
                        </StyledButton>
                        <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
                            <Icon icon={'ic:baseline-close'} className={'text-2xl'} />
                        </IconButton>
                    </>
                }
            />

            <StyledButton dataTest='btn-snackbar-with-alert' onClick={handleOpenAlert}>Show snackbar with alert</StyledButton>
            <StyledSnackbar
                dataTest='alert-snackbar'
                open={openAlert}
                onClose={handleCloseAlert}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <StyledAlert data-test='nice-alert-snack' onClose={handleCloseAlert} severity='success' variant='filled' sx={{ width: '100%' }}>
                    Nice alert snack
                </StyledAlert>
            </StyledSnackbar>
        </Stack>
    )
}
