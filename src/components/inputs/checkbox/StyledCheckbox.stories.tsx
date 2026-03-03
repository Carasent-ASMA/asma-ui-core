import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledCheckbox } from './StyledCheckbox'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import type { CheckboxProps } from '@mui/material'
import { useState } from 'react'
import { expect } from 'storybook/test'

const meta = {
    title: 'Inputs/Checkbox',
    component: StyledCheckbox,
    tags: [],
    argTypes: { size: { control: 'radio', options: ['small', 'medium', 'large'] } },
    args: {},
} satisfies Meta<typeof StyledCheckbox>

export default meta
type Story = StoryObj<typeof StyledCheckbox>

const CheckboxWrapper = ({ label, ...args }: CheckboxProps & { dataTest: string; label: string }) => {
    const [checked, setChecked] = useState(args.checked ?? false)

    return (
        <StyledFormControlLabel
            label={label}
            control={<StyledCheckbox {...args} checked={checked} onChange={(_, val) => setChecked(val)} />}
        />
    )
}

export const Unchecked_Default: Story = {
    args: { checked: false },
    render: (args) => <CheckboxWrapper label='Unchecked' {...args} />,
}

export const Unchecked_Hover: Story = {
    render: (args) => <CheckboxWrapper label='Hover' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Hover' })

        await userEvent.hover(checkbox)
    },
}

export const Unchecked_Focused: Story = {
    render: (args) => <CheckboxWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Focused' })
        checkbox.focus()

        await expect(checkbox).toHaveFocus()
    },
}

export const Unchecked_Disabled: Story = {
    args: { disabled: true },
    render: (args) => <CheckboxWrapper label='Disabled' {...args} />,
}

export const Checked_Default: Story = {
    args: { checked: true },
    render: (args) => <CheckboxWrapper label='Checked' {...args} />,
}

export const Checked_Hover: Story = {
    args: { checked: true },
    render: (args) => <CheckboxWrapper label='Hover' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Hover' })

        await userEvent.hover(checkbox)
    },
}

export const Checked_Focused: Story = {
    args: { checked: true },
    render: (args) => <CheckboxWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Focused' })
        checkbox.focus()

        await expect(checkbox).toHaveFocus()
    },
}

export const Checked_Disabled: Story = {
    args: { checked: true, disabled: true },
    render: (args) => <CheckboxWrapper label='Disabled' {...args} />,
}

export const Indeterminate_Default: Story = {
    args: { checked: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Indeterminate' {...args} />,
}

export const Indeterminate_Hover: Story = {
    args: { checked: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Hover' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Hover' })

        await userEvent.hover(checkbox)
    },
}

export const Indeterminate_Focused: Story = {
    args: { checked: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Focused' })
        checkbox.focus()

        await expect(checkbox).toHaveFocus()
    },
}

export const Indeterminate_Disabled: Story = {
    args: { checked: true, disabled: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Disabled' {...args} />,
}
