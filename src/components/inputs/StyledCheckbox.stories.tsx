import type { ComponentStory, ComponentMeta } from '@storybook/react'
import { StyledFormControlLabel } from './StyledFormControlLabel'
import { Stack } from '@mui/material'
import { StyledCheckbox } from './StyledCheckbox'

export default {
    title: 'Inputs/Checkbox',
    component: StyledCheckbox,
} as ComponentMeta<typeof StyledCheckbox>

const Template: ComponentStory<typeof StyledCheckbox> = (args) => (
    <Stack direction='row' spacing={2}>
        <StyledFormControlLabel label='Unchecked' control={<StyledCheckbox {...args} />} />
        <StyledFormControlLabel label='Checked' control={<StyledCheckbox {...args} defaultChecked />} />
        <StyledFormControlLabel label='Disabled' control={<StyledCheckbox {...args} disabled />} />
        <StyledFormControlLabel label='Disabled checked' control={<StyledCheckbox {...args} disabled checked />} />
        <StyledFormControlLabel label='Disabled ripple' control={<StyledCheckbox {...args} disableRipple />} />
    </Stack>
)

export const Default = Template.bind({})
Default.args = {}
