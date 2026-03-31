import type { Meta } from '@storybook/react'
import type { StoryObj } from '@storybook/react'
import { StyledRadio } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'
import { StyledFormControlLabel } from 'asma-ui-core'
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
        <div className='flex flex-col gap-4'>
            <StyledRadioGroup dataTest='radio-group' defaultValue='one' name='radio-buttons-group'>
                <span>Standard group</span>
                <StyledRadio dataTest='one' value='one' />
                <StyledFormControlLabel label='two' control={<StyledRadio dataTest='two' value='two' />} />
                <StyledFormControlLabel label='two' disabled control={<StyledRadio dataTest='two' value='two' />} />
                <StyledFormControlLabel label='three' control={<StyledRadio dataTest='three' value='three' />} />
                <StyledFormControlLabel
                    label='four'
                    control={<StyledRadio dataTest='four' size='small' value='four' />}
                />
            </StyledRadioGroup>

            <StyledRadioGroup
                dataTest='radio-group-helpertext'
                name='radio-buttons-helpertext'
                className='flex flex-col'
                helperText='Some custom helperText'
            >
                <span className='text-base font-semibold text-delta-800'>Radio buttons*</span>
                <StyledFormControlLabel
                    label='Gain proficiency in implementing age-appropriate educational activities and lesson plans.'
                    control={<StyledRadio dataTest='two' value='two' size='small' />}
                />
                <StyledFormControlLabel
                    label='Successfully lead classroom activities, including circle time, storytime, and arts'
                    control={<StyledRadio dataTest='three' value='three' size='small' />}
                />
                <StyledFormControlLabel
                    label='Participate in parent-teacher conferences and communicate effectively with families about student progress and development.'
                    control={<StyledRadio dataTest='four' size='small' value='four' />}
                />
            </StyledRadioGroup>

            <StyledRadioGroup
                dataTest='radio-group-error'
                name='radio-buttons-error'
                className='flex flex-col'
                error
                errorText='Required'
            >
                <span className='text-base font-semibold text-delta-800'>Radio buttons*</span>
                <StyledFormControlLabel
                    label='Gain proficiency in implementing age-appropriate educational activities and lesson plans.'
                    control={<StyledRadio dataTest='two' value='two' size='small' />}
                />
                <StyledFormControlLabel
                    label='Successfully lead classroom activities, including circle time, storytime, and arts'
                    control={<StyledRadio dataTest='three' value='three' size='small' />}
                />
                <StyledFormControlLabel
                    label='Participate in parent-teacher conferences and communicate effectively with families about student progress and development.'
                    control={<StyledRadio dataTest='four' size='small' value='four' />}
                />
            </StyledRadioGroup>
        </div>
    )
}
