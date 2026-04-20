import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import { StyledRadio, type StyledRadioProps } from './StyledRadio'
import { StyledRadioGroup, type StyledRadioGroupProps } from './StyledRadioGroup'

const meta = {
    title: 'base-ui/Styled Radio',
    component: StyledRadio,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledRadio>

export default meta
type Story = StoryObj<typeof StyledRadio>

const RadioWrapper = ({
    label,
    groupArgs,
    radioArgs,
}: {
    label: string
    groupArgs: Omit<StyledRadioGroupProps, 'children'>
    radioArgs: Omit<StyledRadioProps, 'ref'>
}) => {
    const [selected, setSelected] = useState<string | number | boolean | null>(groupArgs.defaultValue ?? null)

    return (
        <StyledRadioGroup
            {...groupArgs}
            value={selected}
            onValueChange={(value) => {
                setSelected(value as string | number | boolean | null)
            }}
        >
            {/* <StyledFormControlLabel label={label} control={<StyledRadio {...radioArgs} />} /> */}
            <label className='flex items-center'>
                <StyledRadio {...radioArgs} />
                {label}
            </label>
        </StyledRadioGroup>
    )
}

export const Unchecked_Default: Story = {
    args: { value: true },
    render: (args) => <RadioWrapper label='Unchecked' groupArgs={{ name: 'unchecked-default' }} radioArgs={args} />,
}

export const Unchecked_Focused: Story = {
    args: { value: true },
    render: (args) => <RadioWrapper label='Focused' groupArgs={{ name: 'unchecked-focused' }} radioArgs={args} />,
    play: async ({ canvas }) => {
        const radio = canvas.getByRole('radio', { name: 'Focused' })
        radio.focus()

        await expect(radio).toHaveFocus()
    },
}

export const Unchecked_Disabled: Story = {
    args: { value: true, disabled: true },
    render: (args) => <RadioWrapper label='Disabled' groupArgs={{ name: 'unchecked-disabled' }} radioArgs={args} />,
    play: async ({ canvas, userEvent }) => {
        const radio = canvas.getByRole('radio', { name: 'Disabled' })

        await expect(radio).not.toBeChecked()

        await expect(() => userEvent.click(radio)).rejects.toThrow(/pointer-events: none/)

        await expect(radio).not.toBeChecked()
    },
}

export const Checked_Default: Story = {
    args: { value: true },
    render: (args) => (
        <RadioWrapper label='Checked' groupArgs={{ name: 'checked-default', defaultValue: true }} radioArgs={args} />
    ),
}

export const Checked_Focused: Story = {
    args: { value: true },
    render: (args) => (
        <RadioWrapper label='Focused' groupArgs={{ name: 'checked-focused', defaultValue: true }} radioArgs={args} />
    ),
    play: async ({ canvas }) => {
        const radio = canvas.getByRole('radio', { name: 'Focused' })
        radio.focus()

        await expect(radio).toHaveFocus()
    },
}

export const Checked_Disabled: Story = {
    args: { value: true, disabled: true },
    render: (args) => (
        <RadioWrapper label='Disabled' groupArgs={{ name: 'checked-disabled', defaultValue: true }} radioArgs={args} />
    ),
    play: async ({ canvas, userEvent }) => {
        const radio = canvas.getByRole('radio', { name: 'Disabled' })

        await expect(radio).toBeChecked()

        await expect(() => userEvent.click(radio)).rejects.toThrow(/pointer-events: none/)

        await expect(radio).toBeChecked()
    },
}

export const Group: Story = {
    args: { size: 'small' },
    render: (args) => {
        return (
            <>
                <div id='group-example-label' className='text-delta-800 text-base font-semibold'>
                    Line length is how many characters are on a single line of text. For shorter lines of text, the
                    ideal length is 20 to 40 characters?
                </div>

                <StyledRadioGroup
                    aria-labelledby='group-example-label'
                    name='radio-group'
                    helperText='Custom helper text for radio group'
                >
                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Nursing assistant' />
                        Nursing assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Medical assistant' />
                        Medical assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Tech assistant' />
                        Tech assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Tax assistant' />
                        Tax assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Diet assistant' />
                        Diet assistant
                    </label>
                </StyledRadioGroup>
            </>
        )
    },
}

export const ErrorText: Story = {
    args: { size: 'small' },
    render: (args) => {
        return (
            <>
                <div id='group-example-label' className='text-delta-800 text-base font-semibold'>
                    Line length is how many characters are on a single line of text. For shorter lines of text, the
                    ideal length is 20 to 40 characters?
                </div>

                <StyledRadioGroup
                    aria-labelledby='group-example-label'
                    name='radio-group'
                    error
                    errorText='Custom error text here'
                >
                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Nursing assistant' />
                        Nursing assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Medical assistant' />
                        Medical assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Tech assistant' />
                        Tech assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Tax assistant' />
                        Tax assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Diet assistant' />
                        Diet assistant
                    </label>
                </StyledRadioGroup>
            </>
        )
    },
}

export const DefaultErrorText: Story = {
    args: { error: true, size: 'small' },
    render: (args) => {
        return (
            <>
                <div id='group-example-label' className='text-delta-800 text-base font-semibold'>
                    Line length is how many characters are on a single line of text. For shorter lines of text, the
                    ideal length is 20 to 40 characters?
                </div>

                <StyledRadioGroup aria-labelledby='group-example-label' name='radio-group' error>
                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Nursing assistant' />
                        Nursing assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Medical assistant' />
                        Medical assistant
                    </label>

                    <label className='flex items-center'>
                        <StyledRadio {...args} value='Tech assistant' />
                        Tech assistant
                    </label>
                </StyledRadioGroup>
            </>
        )
    },
}
