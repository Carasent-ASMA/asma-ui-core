import { type ReactNode, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StyledInteractiveChip } from './StyledInteractiveChip'

type StoryArgs = {
    label?: ReactNode
    type?: 'checkbox' | 'radio'
    checked?: boolean
    readOnly?: boolean
    size?: 'small' | 'medium'
    ariaLabel?: string
}

const meta = {
    title: 'DataDisplay/InteractiveChip',
    component: StyledInteractiveChip,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        label: { control: false },
        type: { control: 'radio', options: ['checkbox', 'radio'] },
        checked: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        size: { control: 'radio', options: ['small', 'medium'] },
        ariaLabel: { control: 'text' },
    },
} satisfies Meta<typeof StyledInteractiveChip>

export default meta

type Story = StoryObj<StoryArgs>

function SingleChipDemo({
    label = 'Chip',
    type = 'checkbox',
    checked = false,
    readOnly = false,
    size = 'small',
    ariaLabel,
}: StoryArgs) {
    const [value, setValue] = useState(checked)

    return (
        <StyledInteractiveChip
            dataTest='interactive-chip'
            label={label}
            type={type}
            checked={value}
            readOnly={readOnly}
            size={size}
            ariaLabel={ariaLabel}
            onClick={readOnly ? undefined : () => setValue((prev) => (type === 'radio' ? true : !prev))}
        />
    )
}

function CheckboxGroupDemo() {
    const items = [
        { id: '1', label: 'Active' },
        { id: '2', label: 'Paused' },
        { id: '3', label: 'Draft' },
    ] as const

    const [selected, setSelected] = useState<Record<string, boolean>>({
        '1': false,
        '2': false,
        '3': false,
    })

    return (
        <div className='flex items-center gap-4'>
            {items.map((item) => (
                <StyledInteractiveChip
                    key={item.id}
                    dataTest={`checkbox-chip-${item.id}`}
                    label={item.label}
                    ariaLabel={item.label}
                    type='checkbox'
                    checked={selected[item.id]}
                    onClick={() =>
                        setSelected((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                        }))
                    }
                />
            ))}
        </div>
    )
}

function RadioGroupDemo() {
    const items = [
        { id: '1', label: 'Active' },
        { id: '2', label: 'Paused' },
        { id: '3', label: 'Draft' },
    ] as const

    const [selected, setSelected] = useState<string | null>(null)

    return (
        <div className='flex items-center gap-4'>
            {items.map((item) => (
                <StyledInteractiveChip
                    key={item.id}
                    dataTest={`radio-chip-${item.id}`}
                    label={item.label}
                    ariaLabel={item.label}
                    type='radio'
                    checked={selected === item.id}
                    onClick={() => setSelected(item.id)}
                />
            ))}
        </div>
    )
}

export const Checkbox_Default: Story = {
    args: {
        label: 'Checkbox Chip',
        type: 'checkbox',
        checked: false,
        ariaLabel: 'Checkbox Chip',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const chip = canvas.getByRole('button', { name: 'Checkbox Chip' })

        await userEvent.click(chip)

        expect(canvas.getByRole('checkbox', { name: 'Checkbox Chip' })).toBeChecked()
    },
}

export const Checkbox_Focused: Story = {
    args: {
        label: 'Checkbox focused',
        type: 'checkbox',
        checked: false,
        ariaLabel: 'Checkbox focused',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const chip = canvas.getByRole('button', { name: 'Checkbox focused' })

        chip.focus()

        await expect(chip).toHaveFocus()
    },
}

export const Checkbox_Readonly: Story = {
    args: {
        label: 'Checkbox readonly',
        type: 'checkbox',
        checked: true,
        readOnly: true,
        ariaLabel: 'Checkbox readonly',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        expect(canvas.getByRole('checkbox', { name: 'Checkbox readonly' })).toBeChecked()
    },
}

export const Checkbox_WithReactNodeLabel: Story = {
    args: {
        label: (
            <span className='flex items-center gap-2'>
                <span aria-hidden>⭐</span>
                <span>Complex label</span>
            </span>
        ),
        type: 'checkbox',
        checked: false,
        ariaLabel: 'Complex label chip',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const chip = canvas.getByRole('button', { name: 'Complex label chip' })

        await userEvent.click(chip)

        expect(canvas.getByRole('checkbox', { name: 'Complex label chip' })).toBeChecked()
    },
}

export const Checkbox_Multiple: Story = {
    render: () => <CheckboxGroupDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)

        await userEvent.click(canvas.getByRole('button', { name: 'Paused' }))

        expect(canvas.getByRole('checkbox', { name: 'Paused' })).toBeChecked()
        expect(canvas.getByRole('checkbox', { name: 'Active' })).not.toBeChecked()
    },
}

export const Radio_Default: Story = {
    args: {
        label: 'Default radio',
        type: 'radio',
        checked: false,
        ariaLabel: 'Default radio',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const chip = canvas.getByRole('button', { name: 'Default radio' })

        await userEvent.click(chip)

        expect(canvas.getByRole('radio', { name: 'Default radio' })).toBeChecked()
    },
}

export const Radio_Focused: Story = {
    args: {
        label: 'Focused radio',
        type: 'radio',
        checked: false,
        ariaLabel: 'Focused radio',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const chip = canvas.getByRole('button', { name: 'Focused radio' })

        chip.focus()

        await expect(chip).toHaveFocus()
    },
}

export const Radio_Readonly: Story = {
    args: {
        label: 'Radio readonly',
        type: 'radio',
        checked: true,
        readOnly: true,
        ariaLabel: 'Radio readonly',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        expect(canvas.getByRole('radio', { name: 'Radio readonly' })).toBeChecked()
    },
}

export const Radio_Multiple: Story = {
    render: () => <RadioGroupDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)

        await userEvent.click(canvas.getByRole('button', { name: 'Paused' }))

        expect(canvas.getByRole('radio', { name: 'Paused' })).toBeChecked()
        expect(canvas.getByRole('radio', { name: 'Active' })).not.toBeChecked()
        expect(canvas.getByRole('radio', { name: 'Draft' })).not.toBeChecked()
    },
}

export const Radio_WithReactNodeLabel: Story = {
    args: {
        label: (
            <span className='flex items-center gap-2'>
                <span aria-hidden>●</span>
                <span>Complex radio label</span>
            </span>
        ),
        type: 'radio',
        checked: false,
        ariaLabel: 'Complex radio chip',
    },
    render: (args) => <SingleChipDemo {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const chip = canvas.getByRole('button', { name: 'Complex radio chip' })

        await userEvent.click(chip)

        expect(canvas.getByRole('radio', { name: 'Complex radio chip' })).toBeChecked()
    },
}
