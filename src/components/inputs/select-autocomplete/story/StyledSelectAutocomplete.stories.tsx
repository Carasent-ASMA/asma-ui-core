import type { StoryObj, Meta } from '@storybook/react'
import { StyledSelectAutocomplete } from '../StyledSelectAutocomplete'
import { StyledStack } from '../../../miscellaneous/StyledStack'
import { StyledSelectAutocompleteExample } from './components/StyledSelectAutocompleteExample'

const meta = {
    title: 'Inputs/Styled Select Autocomplete',
    component: StyledSelectAutocomplete,
    argTypes: {},
} satisfies Meta<typeof StyledSelectAutocomplete>

export default meta
type Story = StoryObj<typeof StyledSelectAutocomplete>

export const SelectAutocomplete: Story = {
    render: () => <SelectAutocompleteExample />,
}

const SelectAutocompleteExample = () => {
    return (
        <StyledStack direction='column' spacing={2}>
            <StyledSelectAutocompleteExample />
        </StyledStack>
    )
}
