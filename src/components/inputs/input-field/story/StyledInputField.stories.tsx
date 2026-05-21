import type { Meta, StoryObj } from '@storybook/react-vite'

import { StyledInputField } from '../StyledInputField'
import { expect } from 'storybook/test'
import { StyledFormLabel } from 'src/components/data-display/form-label'

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

export const Focused: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText('Label')
        input.focus()

        await expect(input).toHaveFocus()
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

export const Multiline: Story = {
    args: {
        className: 'w-[600px]',
        multiline: true,
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus fringilla ex elit, in interdum arcu accumsan ut. Praesent quis leo nibh. Integer tempus semper ante at malesuada. Cras pretium vel magna at suscipit. Mauris id nisi gravida diam posuere pulvinar quis pulvinar magna. Curabitur dapibus felis vitae ornare viverra. Fusce faucibus sollicitudin dolor.',
    },
}

export const AriaInvalid: Story = {
    args: {
        error: true,
        label: 'Email',
    },
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText('Email')

        await expect(input).toHaveAttribute('aria-invalid', 'true')
    },
}

export const AriaDescribedBy: Story = {
    args: {
        label: 'Email',
        helperText: 'name@example.com',
    },
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText('Email')
        const helper = canvas.getByText('name@example.com')

        await expect(input).toHaveAttribute('aria-describedby', helper.id)
    },
}

// export const CustomLabel: Story = {
//     args: {
//         id: 'email',
//         label: undefined,
//     },
//     render: (args) => {
//         return (
//             <>
//                 <StyledFormLabel title='Email' />
//
//                 <StyledInputField {...args} />
//             </>
//         )
//     },
//     play: async ({ canvas }) => {
//         const input = canvas.getByLabelText('Email')
//
//         await expect(input).toBeInTheDocument()
//     },
// }
