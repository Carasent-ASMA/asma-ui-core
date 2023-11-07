import type { Meta } from '@storybook/react'
import type { StoryObj } from '@storybook/react'
import { StyledRadio } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'
import { StyledFormControlLabel } from 'asma-core-ui'
import React from 'react'

const meta = {
    title: 'Inputs/Styled Radio',
    component: StyledRadio,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledRadio>

export default meta
type Story = StoryObj<typeof StyledRadio>

export const Radio: Story = {
    args: { ...meta.args },
    render: () => <StyledRadioExample />,
}

const StyledRadioExample = () => {
    return (
        <StyledRadioGroup defaultValue="one" name="radio-buttons-group">
            <StyledFormControlLabel
                label='one'
                control={<StyledRadio value="one" />}
            />
            <StyledFormControlLabel
                label='two'
                control={<StyledRadio value="two" />}
            />
            <StyledFormControlLabel
                label='three'
                control={<StyledRadio value="three" />}
            />
        </StyledRadioGroup>
    )
}
