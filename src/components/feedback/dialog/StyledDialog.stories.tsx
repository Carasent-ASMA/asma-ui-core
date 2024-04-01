import React, { useState } from 'react'
import type { Meta } from '@storybook/react'

import { StyledDialog } from './StyledDialog'
import { StyledDialogActions } from './StyledDialogActions'
import { StyledDialogContent } from './StyledDialogContent'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledDialogTitle } from './StyledDialogTitle'

const meta = {
    title: 'Feedback/Dialog',
    component: StyledDialog,
    tags: [],
    argTypes: {},
    args: {
        title: 'The modal title',
        open: true,
        fullScreen: false,

        onClose: () => {
            /*  */
        },
    },
} satisfies Meta<typeof StyledDialog>

export default meta

export const Dialog = () => {
    const [open, setOpen] = useState(true)

    const handleCloseModal = () => {
        setOpen(false)
    }
    return (
        <React.Fragment>
            <StyledButton dataTest='test' onClick={() => setOpen(true)} variant='contained'>
                Open
            </StyledButton>
            <StyledDialog
                {...meta.args}
                onCloseText='Close'
                open={open}
                dataTest='test'
                onClose={handleCloseModal}
                dialogTitle='Dialog Title'
            >
                <StyledDialogTitle className='text-center'>{meta.args.title}</StyledDialogTitle>
                <StyledDialogContent className='text-gama-700'>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros suspendisse
                    aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate. Ligula
                    sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo enim
                    mi. Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros
                    suspendisse aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate.
                    Ligula sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo
                    enim mi.
                    <br />
                    <br />
                    Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros suspendisse
                    aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate. Ligula
                    sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo enim
                    mi. Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros
                    suspendisse aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate.
                    Ligula sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo
                    enim mi.
                    <br />
                    <br />
                    Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros suspendisse
                    aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate. Ligula
                    sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo enim
                    mi. Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros
                    suspendisse aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate.
                    Ligula sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo
                    enim mi.
                    <br />
                    Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros suspendisse
                    aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate. Ligula
                    sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo enim
                    mi. Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros
                    suspendisse aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate.
                    Ligula sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo
                    enim mi.
                </StyledDialogContent>
                <StyledDialogActions>
                    <StyledButton dataTest='test' variant='contained' onClick={handleCloseModal}>
                        Save
                    </StyledButton>
                    <StyledButton dataTest='test' variant='outlined' onClick={handleCloseModal}>
                        Abort
                    </StyledButton>
                </StyledDialogActions>
            </StyledDialog>
        </React.Fragment>
    )
}
