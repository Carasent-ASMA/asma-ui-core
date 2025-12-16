import type { Meta } from '@storybook/react-vite'
import type { StoryObj } from '@storybook/react-vite'
import { StyledRadio } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'
import { StyledFormControlLabel } from 'asma-core-ui'
import React from 'react'

const meta = {
    title: 'base-ui/Styled Radio',
    component: StyledRadio,
    tags: [],
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
        <StyledRadioGroup dataTest='radio-group' defaultValue='one' name='radio-buttons-group'>
            <StyledRadio dataTest='one' value='one' />
            <StyledFormControlLabel label='two' control={<StyledRadio dataTest='two' value='two' />} />
            <StyledFormControlLabel label='two' disabled control={<StyledRadio dataTest='two' value='two' />} />
            <StyledFormControlLabel label='three' control={<StyledRadio dataTest='three' value='three' />} />
            <StyledFormControlLabel label='four' control={<StyledRadio dataTest='four' size='small' value='four' />} />
        </StyledRadioGroup>
    )
}
