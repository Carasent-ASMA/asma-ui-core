import React from 'react'
import type { Meta } from '@storybook/react'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledSelectExample } from 'src/components/inputs/select/story/components/StyledSelectExample'
import { StyledSelectAutocompleteExample } from 'src/components/inputs/select-autocomplete/story/components/StyledSelectAutocompleteExample'
import { StyledInputFieldExample } from 'src/components/inputs/input-field/story/components/StyledInputFieldExample'

const meta = {
    title: '*/Form Inputs',
    component: StyledInputField,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledInputField>

export default meta

export const FormInputs = () => {
    return (
        <div>
            <h2>Not filled</h2>
            <h5>Enabled</h5>
            <div className={'flex flex-col gap-5 max-w-lg '}>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    label='Not filled - only label'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    placeholder='Not filled - only placeholder'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    label='Not filled - label and placeholder'
                    placeholder='Not filled - label and placeholder'
                />
                <h5>Error</h5>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' error />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    error
                    placeholder='Not filled, only placeholder'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    error
                    label='Not filled'
                    placeholder='Not filled'
                />
                <h5>Disabled</h5>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' disabled />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    disabled
                    placeholder='Not filled'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    disabled
                    label='Not filled'
                    placeholder='Not filled'
                />
                <h5>Readonly</h5>
                <StyledInputField autoComplete='off' size='small' dataTest='not-filled' readOnly />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    readOnly
                    placeholder='Not filled'
                />
                <StyledInputField
                    autoComplete='off'
                    size='small'
                    dataTest='not-filled'
                    readOnly
                    label='Not filled'
                    placeholder='Not filled'
                />
            </div>
        </div>
    )
}
