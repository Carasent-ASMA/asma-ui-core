import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StyledSnackbar } from './StyledSnackbar'
import { IconButton, Stack } from '@mui/material'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledAlert } from '../alert/StyledAlert'
import { Icon } from '@iconify/react'
import { SnackbarProvider } from './SnackbarProvider'
import { processInfoSnackbar } from './processInfoSnackbar'
import { InfoMessages } from './components-styled/InfoMessages'

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
        <>
            <SnackbarProvider autoHideDuration={3000} />
            <Stack direction='column' spacing={2} sx={{ maxWidth: 400 }}>
                <StyledButton
                    dataTest='test'
                    onClick={() => {
                        processInfoSnackbar('Shared successfully!')
                    }}
                >
                    Show snackbar using notistack
                </StyledButton>

                <StyledButton dataTest='test' onClick={handleOpen}>
                    Show default snackbar with action
                </StyledButton>
                <StyledSnackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={openDefault}
                    onClose={handleClose}
                    message='Nice default snack'
                    action={
                        <>
                            <StyledButton dataTest='test' variant='text' onClick={handleClose} color='inherit'>
                                Close
                            </StyledButton>
                            <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
                                <Icon icon={'ic:baseline-close'} className={'text-2xl'} />
                            </IconButton>
                        </>
                    }
                />

                <StyledButton dataTest='test' onClick={handleOpenAlert}>
                    Show snackbar with alert
                </StyledButton>
                <StyledSnackbar
                    open={openAlert}
                    onClose={handleCloseAlert}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <StyledAlert onClose={handleCloseAlert} severity='success' variant='filled' sx={{ width: '100%' }}>
                        Nice alert snack
                    </StyledAlert>
                </StyledSnackbar>
                <InfoMessages />
            </Stack>
        </>
    )
}
