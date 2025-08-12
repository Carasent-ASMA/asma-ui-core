import React from 'react'
import type { Meta } from '@storybook/react'
import { StyledSwitch } from './StyledSwitch'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'

const meta = {
    title: 'base-ui/Styled Switch',
    component: StyledSwitch,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledSwitch>

export default meta

export const Switch = () => (
    <div className='max-w-[500px] h-full flex flex-col gap-2'>
        <StyledFormControlLabel
            labelPlacement='start'
            label='Enabled Unchecked'
            control={<StyledSwitch dataTest='unchecked-switch' />}
        />
        <StyledFormControlLabel
            labelPlacement='start'
            label='Enabled Checked'
            control={<StyledSwitch dataTest='checked-switch' defaultChecked />}
        />
        <StyledFormControlLabel
            labelPlacement='start'
            label='Disabled Unchecked'
            control={<StyledSwitch dataTest='disabled-switch' disabled />}
        />
         <StyledFormControlLabel
            labelPlacement='start'
            label='Disabled Checked'
            control={<StyledSwitch dataTest='disabled-checked-switch-1' defaultChecked disabled />}
        />
        <StyledFormControlLabel
            className='w-[200px]'
            labelPlacement='end'
            label='Enabled Unchecked'
            control={<StyledSwitch dataTest='unchecked-switch-2' />}
        />
        <StyledFormControlLabel
            className='w-[200px]'
            labelPlacement='end'
            label='Enabled Checked'
            control={<StyledSwitch dataTest='checked-switch-2' defaultChecked />}
        />
        <StyledFormControlLabel
            className='w-[200px]'
            labelPlacement='end'
            label='Disabled Unchecked'
            control={<StyledSwitch dataTest='disabled-switch-2' disabled />}
        />
        <StyledFormControlLabel
            className='w-[200px]'
            labelPlacement='end'
            label='Disabled Checked'
            control={<StyledSwitch dataTest='disabled-checked-switch-2' defaultChecked disabled />}
        />
    </div>
)
