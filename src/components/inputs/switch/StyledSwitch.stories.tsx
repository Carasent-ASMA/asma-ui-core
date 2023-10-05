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
    <>
        <Stack direction='row' className='flex'>
            <StyledFormControlLabel
                className='w-[150px] m-0  p-0'
                label='Unchecked'
                control={<StyledSwitch {...meta.args} />}
            />
            <StyledFormControlLabel
                className='w-[150px] m-0 p-0'
                label='Checked'
                control={<StyledSwitch {...meta.args} defaultChecked />}
            />
            <StyledFormControlLabel
                className='w-[150px] m-0  p-0'
                label='Disabled'
                control={<StyledSwitch {...meta.args} disabled />}
            />
        </Stack>
        <Stack direction='row' className='flex ml-1'>
            <StyledFormControlLabel
                className='w-[150px] m-0  p-0'
                label='Unchecked'
                control={<StyledSwitch size='small' {...meta.args} />}
            />
            <StyledFormControlLabel
                className='w-[150px] m-0  p-0'
                label='Checked'
                control={<StyledSwitch size='small' {...meta.args} defaultChecked />}
            />
            <StyledFormControlLabel
                className='w-[150px] ml-0  p-0'
                label='Disabled'
                control={<StyledSwitch size='small' {...meta.args} disabled />}
            />
        </Stack>
    </>
)
