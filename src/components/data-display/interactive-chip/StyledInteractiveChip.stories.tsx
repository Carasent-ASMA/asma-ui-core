import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import { StyledInteractiveChip, type StyledInteractiveChipProps } from './StyledInteractiveChip'

const meta: Meta = {
    title: 'DataDisplay/InteractiveChip',
    component: StyledInteractiveChip,
    tags: [],
    args: { dataTest: 'interactive-chip' },
    argTypes: { readOnly: { control: 'boolean' }, type: { control: 'radio', options: ['checkbox', 'radio'] } },
} satisfies Meta<typeof StyledInteractiveChip>

export default meta
type Story = StoryObj<typeof StyledInteractiveChip>

const options = [
    { value: '1', label: 'Single option' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
] as const

const BasicChip = (args: StyledInteractiveChipProps) => {
    const [value, setValue] = useState(args.checked ?? false)

    return <StyledInteractiveChip {...args} checked={value} onClick={() => setValue(!value)} />
}

export const Checkbox_Default: Story = {
    args: { label: 'Checkbox Chip', type: 'checkbox' },
    render: (args) => <BasicChip {...args} />,
}

export const Checkbox_Hovered: Story = {
    args: { label: 'Checkbox hovered', type: 'checkbox' },
    parameters: { pseudo: { hover: true } },
    render: (args) => <BasicChip {...args} />,
    play: async ({ canvas, userEvent }) => {
        const chip = canvas.getByRole('button', { name: 'Checkbox hovered' })

        await userEvent.hover(chip)
    },
}

export const Checkbox_Focused: Story = {
    args: { label: 'Checkbox focused', type: 'checkbox' },
    render: (args) => <BasicChip {...args} />,
    play: async ({ canvas }) => {
        const chip = canvas.getByRole('button', { name: 'Checkbox focused' })
        chip.focus()

        await expect(chip).toHaveFocus()
    },
}

export const Checkbox_Readonly: Story = {
    args: { label: 'Checkbox readonly', checked: true, readOnly: true, type: 'checkbox' },
    render: (args) => <BasicChip {...args} />,
}

export const Checkbox_Multiple: Story = {
    args: { type: 'checkbox' },
    render: (args) => {
        const [selected, setSelected] = useState({ '1': false, '2': false, '3': false })

        return (
            <div className='flex items-center gap-4'>
                {options.map((o) => (
                    <StyledInteractiveChip
                        {...args}
                        label={o.label}
                        checked={selected[o.value]}
                        onClick={() =>
                            setSelected((prev) => ({
                                ...prev,
                                [o.value]: !prev[o.value],
                            }))
                        }
                    />
                ))}
            </div>
        )
    },
}

export const Radio_Default: Story = {
    args: { label: 'Default radio', type: 'radio' },
    render: (args) => <BasicChip {...args} />,
}

export const Radio_Focused: Story = {
    args: { label: 'Focused radio', type: 'radio' },
    render: (args) => <BasicChip {...args} />,
    play: async ({ canvas }) => {
        const chip = canvas.getByRole('button', { name: 'Focused radio' })
        chip.focus()

        await expect(chip).toHaveFocus()
    },
}

export const Radio_Readonly: Story = {
    args: { label: 'Radio readonly', checked: true, readOnly: true, type: 'radio' },
    render: (args) => <BasicChip {...args} />,
}

export const Radio_Multiple: Story = {
    args: { type: 'radio' },
    render: (args) => {
        const [selected, setSelected] = useState<string | null>(null)

        return (
            <div className='flex items-center gap-4'>
                {options.map((o) => (
                    <StyledInteractiveChip
                        {...args}
                        label={o.label}
                        checked={selected === o.value}
                        onClick={() => setSelected(o.value)}
                    />
                ))}
            </div>
        )
    },
}
