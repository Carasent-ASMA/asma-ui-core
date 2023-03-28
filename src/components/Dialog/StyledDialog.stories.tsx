import React from 'react'
import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { Button, Stack } from '@mui/material'
import { StyledDialog } from './StyledDialog'

export default {
    title: 'Dialog',
    component: StyledDialog,
} as ComponentMeta<typeof StyledDialog>

const Template: ComponentStory<typeof StyledDialog> = (args) => {
    return (
        <Stack direction='row' spacing={2}>
            <StyledDialog {...args}>
                <div>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros suspendisse
                    aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate. Ligula
                    sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo enim
                    mi. Lorem ipsum dolor sit amet consectetur adipiscing elit placerat, habitasse justo eros
                    suspendisse aptent eleifend dis ultrices duis, facilisis laoreet proin varius magna neque vulputate.
                    Ligula sociosqu sociis penatibus non iaculis, himenaeos volutpat cubilia netus feugiat, interdum leo
                    enim mi.
                </div>
            </StyledDialog>
        </Stack>
    )
}

export const Default = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Default.args = {
    title: 'The modal title',
    open: false,
    onClose: () => {},
    childrenActions: (
        <>
            <Button variant={'contained'}>Save</Button>
            <Button>Edit</Button>
        </>
    ),
}
