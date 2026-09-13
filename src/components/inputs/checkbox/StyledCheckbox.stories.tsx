import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { expect } from 'storybook/test'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { StyledCheckbox } from './base-ui/StyledCheckbox'

const meta = {
    title: 'Inputs/Checkbox',
    component: StyledCheckbox,
    tags: [],
    argTypes: { size: { control: 'radio', options: ['small', 'medium', 'large'] } },
    args: {},
} satisfies Meta<typeof StyledCheckbox>

export default meta
type Story = StoryObj<typeof StyledCheckbox>

const CheckboxWrapper = ({
    label,
    ...args
}: ComponentProps<typeof StyledCheckbox> & { label: string }) => {
    const [checked, setChecked] = useState(args.checked ?? false)

    return (
        <StyledFormControlLabel
            label={label}
            control={<StyledCheckbox {...args} checked={checked} onChange={(_, val) => setChecked(val)} />}
        />
    )
}

export const Unchecked_Default: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: false },
    render: (args) => <CheckboxWrapper label='Unchecked' {...args} />,
}

export const Unchecked_Hover: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    render: (args) => <CheckboxWrapper label='Hover' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Hover' })
        await userEvent.hover(checkbox)
    },
}

export const Unchecked_Focused: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    render: (args) => <CheckboxWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Focused' })
        checkbox.focus()
        await expect(checkbox).toHaveFocus()
    },
}

export const Unchecked_Disabled: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { disabled: true },
    render: (args) => <CheckboxWrapper label='Disabled' {...args} />,
}

export const Checked_Default: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true },
    render: (args) => <CheckboxWrapper label='Checked' {...args} />,
}

export const Checked_Hover: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true },
    render: (args) => <CheckboxWrapper label='Hover' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Hover' })
        await userEvent.hover(checkbox)
    },
}

export const Checked_Focused: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true },
    render: (args) => <CheckboxWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Focused' })
        checkbox.focus()
        await expect(checkbox).toHaveFocus()
    },
}

export const Checked_Disabled: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true, disabled: true },
    render: (args) => <CheckboxWrapper label='Disabled' {...args} />,
}

export const Indeterminate_Default: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Indeterminate' {...args} />,
}

export const Indeterminate_Hover: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Hover' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Hover' })
        await userEvent.hover(checkbox)
    },
}

export const Indeterminate_Focused: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const checkbox = canvas.getByRole('checkbox', { name: 'Focused' })
        checkbox.focus()
        await expect(checkbox).toHaveFocus()
    },
}

export const Indeterminate_Disabled: Story = {
    // axe: label (form element has no associated label). ASMA-8136 allowlist - see docs/a11y-allowlist.md
    parameters: { a11y: { test: 'todo' } },
    args: { checked: true, disabled: true, indeterminate: true },
    render: (args) => <CheckboxWrapper label='Disabled' {...args} />,
}
