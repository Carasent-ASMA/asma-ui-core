import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StyledSearchField, type StyledSearchFieldProps } from '../StyledSearchField'

const meta: Meta<typeof StyledSearchField> = {
    title: 'Inputs/SearchField',
    component: StyledSearchField,
    tags: [],
    args: {
        size: 'small',
        label: 'Søk',
    },
}

export default meta
type Story = StoryObj<typeof StyledSearchField>

const Controlled = (args: StyledSearchFieldProps) => {
    const [value, setValue] = useState('')
    return (
        <div style={{ width: 260 }}>
            <StyledSearchField
                {...args}
                dataTest='search-field'
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onClear={() => setValue('')}
            />
        </div>
    )
}

export const Default: Story = {
    render: (args) => <Controlled {...args} />,
}
