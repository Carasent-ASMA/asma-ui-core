import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { StyledDialog } from './StyledDialog'
import { StyledDialogActions } from './StyledDialogActions'
import { StyledDialogContent } from './StyledDialogContent'
import { StyledButton } from '../../inputs/button/StyledButton'
import { StyledDialogTitle } from './StyledDialogTitle'

const meta = {
    title: 'Feedback/Styled Dialog',
    component: StyledDialog,
    tags: ['autodocs'],
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
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Dialog: Story = {
    args: { ...meta.args },
    render: () => <DialogExample />,
}

export const DialogExample = () => {
    const [open, setOpen] = useState(true)

    const handleCloseModal = () => {
        setOpen(false)
    }
    return (
        <React.Fragment>
            <StyledButton onClick={() => setOpen(true)} variant='contained'>
                Open
            </StyledButton>
            <StyledDialog {...meta.args} onCloseText='Close' open={open} onClose={handleCloseModal}>
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
                    <StyledButton variant='contained' onClick={handleCloseModal}>
                        Save
                    </StyledButton>
                    <StyledButton variant='outlined' onClick={handleCloseModal}>
                        Abort
                    </StyledButton>
                </StyledDialogActions>
            </StyledDialog>
        </React.Fragment>
    )
}
