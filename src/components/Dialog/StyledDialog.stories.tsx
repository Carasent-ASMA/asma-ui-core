import React from 'react'
import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { StyledDialog } from './StyledDialog'
import { StyledDialogActions } from './StyledDialogActions'
import { StyledDialogContent } from './StyledDialogContent'
import { StyledButton } from '../inputs'
import { StyledDialogTitle } from './StyledDialogTitle'

export default {
    title: 'Dialog',
    component: StyledDialog,
} as ComponentMeta<typeof StyledDialog>

const Template: ComponentStory<typeof StyledDialog> = (args) => {
    const [open, setOpen] = React.useState(true)

    const handleCloseModal = () => {
        setOpen(false)
    }

    return (
        <React.Fragment>
            <StyledButton onClick={() => setOpen(true)} variant='contained'>
                Open
            </StyledButton>
            <StyledDialog {...args} onCloseText='Close' open={open} onClose={handleCloseModal}>
                <StyledDialogTitle>{args.title}</StyledDialogTitle>
                <StyledDialogContent>
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

export const Default = Template.bind({
    open: true,
    fullScreen: false,
})
Default.args = {
    title: 'The modal title',
    open: true,
    fullScreen: false,

    onClose: () => {},
}
