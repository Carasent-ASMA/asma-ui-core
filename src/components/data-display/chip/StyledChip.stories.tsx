import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { StyledChip } from './StyledChip'

const meta: Meta = {
    title: 'DataDisplay/Chip',
    component: StyledChip,
    tags: [],
    args: { dataTest: 'chip', label: 'Default label', variant: 'filled' },
    argTypes: {
        disabled: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        variant: {
            control: 'radio',
            options: ['filled', 'outlined'],
        },
    },
} satisfies Meta<typeof StyledChip>

export default meta
type Story = StoryObj<typeof StyledChip>

export const Default: Story = {
    args: {},
}

export const Outlined: Story = {
    args: { label: 'Outlined', variant: 'outlined' },
}

export const Clickable: Story = {
    args: {
        label: 'Clickable',
        onClick: fn(),
    },
}

export const Deletable: Story = {
    args: { label: 'Deletable', onDelete: fn() },
}

// NOTE: hover state does not work yet
export const Hovered: Story = {
    args: { label: 'Hovered', onClick: fn() },
    parameters: { pseudo: { hover: true } },
    play: async ({ canvas, userEvent }) => {
        const chip = canvas.getByRole('button', { name: 'Hovered' })

        // const user = userEvent.setup({ document: canvasElement.ownerDocument })
        //
        // await user.hover(chip)

        await userEvent.hover(chip)
    },
}

export const Focused: Story = {
    args: { label: 'Focused', onClick: fn() },
    play: async ({ canvas }) => {
        const chip = canvas.getByRole('button', { name: 'Focused' })
        chip.focus()

        await expect(chip).toHaveFocus()
    },
}

export const Disabled: Story = {
    args: { label: 'Disabled', disabled: true },
}

export const ReadOnly: Story = {
    args: { label: 'ReadOnly', readOnly: true },
}
