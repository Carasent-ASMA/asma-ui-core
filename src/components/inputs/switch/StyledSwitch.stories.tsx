import React from 'react'
import type { Meta } from '@storybook/react-vite'
import { StyledSwitch } from './StyledSwitch'
import { Stack, Typography } from '@mui/material'
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
    <Stack spacing={4}>
        <Stack spacing={2} alignItems='flex-start'>
            <Typography variant='subtitle1' color='delta.800' fontWeight={500} fontSize={24}>
                Label on the left
            </Typography>
            <StyledFormControlLabel
                labelPlacement='start'
                label='Enabled Unchecked'
                control={<StyledSwitch dataTest='unchecked-switch' {...meta.args} />}
            />
            <StyledFormControlLabel
                labelPlacement='start'
                label='Enabled Checked'
                control={<StyledSwitch dataTest='checked-switch' {...meta.args} defaultChecked />}
            />
            <StyledFormControlLabel
                labelPlacement='start'
                label='Disabled Unchecked'
                control={<StyledSwitch dataTest='disabled-switch' {...meta.args} disabled />}
            />
        </Stack>

        <Stack spacing={2}>
            <Typography variant='subtitle1' color='delta.800' fontWeight={500} fontSize={24}>
                Label on the right
            </Typography>
            <StyledFormControlLabel
                className='w-[200px]'
                labelPlacement='end'
                label='Enabled Unchecked'
                control={<StyledSwitch dataTest='unchecked-switch-2' {...meta.args} />}
            />
            <StyledFormControlLabel
                className='w-[200px]'
                labelPlacement='end'
                label='Enabled Checked'
                control={<StyledSwitch dataTest='checked-switch-2' {...meta.args} defaultChecked />}
            />
            <StyledFormControlLabel
                className='w-[200px]'
                labelPlacement='end'
                label='Disabled Unchecked'
                control={<StyledSwitch dataTest='disabled-switch-2' {...meta.args} disabled />}
            />
            <StyledFormControlLabel
                className='w-[200px]'
                labelPlacement='end'
                label='Disabled Checked'
                control={<StyledSwitch dataTest='disabled-checked-switch-2' {...meta.args} defaultChecked disabled />}
            />
        </Stack>
    </Stack>
)
