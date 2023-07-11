import React from 'react'
import type { Meta } from '@storybook/react'
import { StyledSwitch } from './StyledSwitch'
import { Stack } from '@mui/material'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'

const meta = {
    title: 'Inputs/Styled Switch',
    component: StyledSwitch,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledSwitch>

export default meta

export const Switch = () => (
    <Stack direction='row' spacing={2}>
        <StyledFormControlLabel label='Unchecked' control={<StyledSwitch {...meta.args} />} />
        <StyledFormControlLabel label='Checked' control={<StyledSwitch {...meta.args} defaultChecked />} />
        <StyledFormControlLabel label='Disabled' control={<StyledSwitch {...meta.args} disabled />} />
    </Stack>
)
