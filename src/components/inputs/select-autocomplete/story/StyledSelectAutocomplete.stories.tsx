import type { StoryObj, Meta } from '@storybook/react'
import { StyledSelectAutocomplete } from '../StyledSelectAutocomplete'
import { StyledSelectAutocompleteExample } from './components/StyledSelectAutocompleteExample'
import { Stack } from '@mui/material'

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
        <Stack direction='column' spacing={2}>
            <StyledSelectAutocompleteExample />
        </Stack>
    )
}
