import type { Meta } from '@storybook/react-vite'
import type { StoryObj } from '@storybook/react-vite'
import { StyledRadio } from './StyledRadio'
import { StyledRadioGroup } from './StyledRadioGroup'
import { StyledFormControlLabel } from 'asma-ui-core'
import { useState } from 'react'
import type { RadioProps } from '@mui/material'
import { expect } from 'storybook/test'

const meta = {
    title: 'Inputs/Styled Radio',
    component: StyledRadio,
    tags: ['autodocs'],
    args: {},
    argTypes: { size: { control: 'radio', options: ['small', 'medium'] } },
} satisfies Meta<typeof StyledRadio>

export default meta
type Story = StoryObj<typeof StyledRadio>

const RadioWrapper = ({ label, ...args }: RadioProps & { dataTest: string; label: string }) => {
    const [selected, setSelected] = useState(args.checked ?? false)

    return (
        <StyledFormControlLabel
            label={label}
            control={<StyledRadio {...args} value={selected} onChange={(_, val) => setSelected(val)} />}
            onChange={(_, val) => setSelected(val)}
        />
    )
}

export const Unchecked_Default: Story = {
    args: { checked: false },
    render: (args) => <RadioWrapper label='Unchecked' {...args} />,
}

export const Unchecked_Focused: Story = {
    args: { checked: false },
    render: (args) => <RadioWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const radio = canvas.getByRole('radio', { name: 'Focused' })
        radio.focus()

        await expect(radio).toHaveFocus()
    },
}

export const Unchecked_Disabled: Story = {
    args: { checked: false, disabled: true },
    render: (args) => <RadioWrapper label='Disabled' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const radio = canvas.getByRole('radio', { name: 'Disabled' })

        await expect(radio).not.toBeChecked()

        await expect(() => userEvent.click(radio)).rejects.toThrow(/pointer-events: none/)

        await expect(radio).not.toBeChecked()
    },
}

export const Checked_Default: Story = {
    args: { checked: true },
    render: (args) => <RadioWrapper label='Checked' {...args} />,
}

export const Checked_Focused: Story = {
    args: { checked: true },
    render: (args) => <RadioWrapper label='Focused' {...args} />,
    play: async ({ canvas }) => {
        const radio = canvas.getByRole('radio', { name: 'Focused' })
        radio.focus()

        await expect(radio).toHaveFocus()
    },
}

export const Checked_Disabled: Story = {
    args: { checked: true, disabled: true },
    render: (args) => <RadioWrapper label='Disabled' {...args} />,
    play: async ({ canvas, userEvent }) => {
        const radio = canvas.getByRole('radio', { name: 'Disabled' })

        await expect(radio).toBeChecked()

        await expect(() => userEvent.click(radio)).rejects.toThrow(/pointer-events: none/)

        await expect(radio).toBeChecked()
    },
}

export const Group: Story = {
    render: (args) => {
        const [selected, setSelected] = useState('')
        return (
            <StyledRadioGroup dataTest='radio-group' value={selected}>
                <RadioWrapper
                    label='One'
                    {...args}
                    value={'one'}
                    onChange={(_, val) => setSelected(val ? 'one' : '')}
                />
                <RadioWrapper
                    label='Two'
                    {...args}
                    value={'two'}
                    onChange={(_, val) => setSelected(val ? 'two' : '')}
                />
                <RadioWrapper
                    label='Three'
                    {...args}
                    value={'three'}
                    onChange={(_, val) => setSelected(val ? 'three' : '')}
                />
            </StyledRadioGroup>
        )
    },
}
