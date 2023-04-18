import type { ComponentMeta, ComponentStory } from '@storybook/react'
import { StyledSnackbar } from './StyledSnackbar'
import { IconButton, Stack } from '@mui/material'
import { StyledButton } from '../inputs'
import React from 'react'
import { StyledAlert } from './StyledAlert'
import CloseIcon from '@mui/icons-material/Close'

export default {
    title: 'Feedback/Snackbar',
    component: StyledSnackbar,
} as ComponentMeta<typeof StyledSnackbar>

const Template: ComponentStory<typeof StyledSnackbar> = () => {
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
                            <CloseIcon fontSize='small' />
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

export const Standard = Template.bind({})
Standard.args = {}
