import type { Meta, StoryObj } from '@storybook/react-vite'

import { StyledInputField } from '../StyledInputField'
import { expect } from 'storybook/test'

const meta: Meta<typeof StyledInputField> = {
    title: 'Inputs/InputField',
    component: StyledInputField,
    tags: ['autodocs'],
    args: {
        label: 'Label',
        value: '',
        dataTest: 'storybook-input',
    },
    argTypes: {
        allowClear: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        disabled: { control: 'boolean' },
        error: { control: 'boolean' },
        size: {
            control: 'radio',
            options: ['small', 'medium'],
        },
        variant: {
            control: 'radio',
            options: ['outlined', 'standard', 'filled'],
        },
    },
}

export default meta
type Story = StoryObj<typeof StyledInputField>

export const Default: Story = {
    args: {
        helperText: 'Helper text',
    },
}

export const Error: Story = {
    args: {
        error: true,
        helperText: 'Required field',
        value: 'Wrong value',
    },
}

export const Disabled: Story = {
    args: {
        disabled: true,
        value: 'Disabled value',
    },
}

export const ReadOnly: Story = {
    args: {
        readOnly: true,
        value: 'Read only value',
    },
}

export const WithClear: Story = {
    args: {
        allowClear: true,
        value: 'Clear me',
    },
    play: async ({ canvas, userEvent }) => {
        const clearButton = canvas.getByRole('button')
        await userEvent.click(clearButton)

        await expect(clearButton).toBeInTheDocument()
    },
}
