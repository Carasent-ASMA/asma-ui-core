import React from 'react'
import type { Meta } from '@storybook/react'
import { StyledInputField } from 'src/components/inputs/input-field'
import { StyledSelectExample } from 'src/components/inputs/select/story/components/StyledSelectExample'
import { StyledSelectAutocompleteExample } from 'src/components/inputs/select-autocomplete/story/components/StyledSelectAutocompleteExample'
import { StyledInputFieldExample } from 'src/components/inputs/input-field/story/components/StyledInputFieldExample'

const meta = {
    title: '*/InputsView',
    component: StyledInputField,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledInputField>

export default meta

export const InputsExamples = () => {
    return (
        <div className={'flex flex-col gap-5 max-w-lg mx-auto '}>
            <StyledInputFieldExample />
            <StyledSelectExample />
            <StyledSelectAutocompleteExample />
        </div>
    )
}
