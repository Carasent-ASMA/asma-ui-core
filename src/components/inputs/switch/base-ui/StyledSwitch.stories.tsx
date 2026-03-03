import React, { type PropsWithoutRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledSwitch, type SwitchProps } from './StyledSwitch'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { expect } from 'storybook/test'

const meta = {
    title: 'base-ui/Styled Switch',
    component: StyledSwitch,
    tags: [],
    argTypes: {
        checked: { control: 'boolean' },
        defaultChecked: { control: 'boolean' },
        disabled: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        required: { control: 'boolean' },
    },
    args: {},
} satisfies Meta<typeof StyledSwitch>

export default meta
type Story = StoryObj<typeof StyledSwitch>

const SwitchWrapper = ({ label, args }: { label: string; args: PropsWithoutRef<SwitchProps> }) => {
    return <StyledFormControlLabel label={label} control={<StyledSwitch {...args} />} />
}

export const Unchecked_Default: Story = {
    args: {},
    render: (args) => <SwitchWrapper label='Default' args={args} />,
}

export const Unchecked_Hovered: Story = {
    args: {},
    parameters: {
        pseudo: { hover: true },
    },
    render: (args) => <SwitchWrapper label='Hovered' args={args} />,
}

export const Unchecked_Focused: Story = {
    args: {},
    render: (args) => <SwitchWrapper label='Focused' args={args} />,
    play: async ({ canvas }) => {
        const switchEl = canvas.getByRole('switch', { name: 'Focused' })
        switchEl.focus()

        await expect(switchEl).toHaveFocus()
    },
}

export const Unchecked_Disabled: Story = {
    args: { disabled: true },
    render: (args) => <SwitchWrapper label='Disabled' args={args} />,
    play: async ({ canvas, userEvent }) => {
        const switchEl = canvas.getByRole('switch', { name: 'Disabled' })

        await expect(switchEl).not.toBeChecked()

        await expect(() => userEvent.click(switchEl)).rejects.toThrow(/pointer-events: none/)

        await expect(switchEl).not.toBeChecked()
    },
}

export const Checked_Default: Story = {
    args: { defaultChecked: true },
    render: (args) => <SwitchWrapper label='Default' args={args} />,
}

export const Checked_Hovered: Story = {
    args: { defaultChecked: true },
    parameters: {
        pseudo: { hover: true },
    },
    render: (args) => <SwitchWrapper label='Hovered' args={args} />,
}

export const Checked_Focused: Story = {
    args: { defaultChecked: true },
    render: (args) => <SwitchWrapper label='Focused' args={args} />,
    play: async ({ canvas }) => {
        const switchEl = canvas.getByRole('switch', { name: 'Focused' })
        switchEl.focus()

        await expect(switchEl).toHaveFocus()
    },
}

export const Checked_Disabled: Story = {
    args: { defaultChecked: true, disabled: true },
    render: (args) => <SwitchWrapper label='Disabled' args={args} />,
    play: async ({ canvas, userEvent }) => {
        const switchEl = canvas.getByRole('switch', { name: 'Disabled' })

        await expect(switchEl).toBeChecked()

        await expect(() => userEvent.click(switchEl)).rejects.toThrow(/pointer-events: none/)

        await expect(switchEl).toBeChecked()
    },
}
