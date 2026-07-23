import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import { StyledSearchField, type StyledSearchFieldProps } from '../StyledSearchField'

const meta: Meta<typeof StyledSearchField> = {
    title: 'Inputs/SearchField',
    component: StyledSearchField,
    tags: [],
    args: {
        size: 'small',
        label: 'Search',
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
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByTestId('search-field')
        const icon = canvas.getByTestId('styled-search-icon')

        // Figma rest (28496-138521): in-field icon + placeholder, no floating label.
        await expect(canvas.getByPlaceholderText('Search')).toBe(input)
        await expect(canvas.queryByText('Search', { selector: 'label' })).not.toBeInTheDocument()

        const iconRight = icon.getBoundingClientRect().right
        const placeholderLeft = input.getBoundingClientRect().left + 40
        await expect(placeholderLeft).toBeGreaterThanOrEqual(iconRight - 1)

        await userEvent.click(input)
        await expect(canvas.queryByTestId('styled-search-icon')).not.toBeInTheDocument()
        await expect(canvas.getByText('Search', { selector: 'label' })).toBeInTheDocument()

        await userEvent.tab()
        await expect(canvas.getByTestId('styled-search-icon')).toBeInTheDocument()
    },
}
