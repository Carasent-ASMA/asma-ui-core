import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'
import { StyledRadio, type StyledRadioProps } from './StyledRadio'
import { StyledRadioGroup, type StyledRadioGroupProps } from './StyledRadioGroup'

const meta = {
    title: 'base-ui/Styled Radio',
    component: StyledRadio,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Radio](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=15385-19720) — circle 19×19, touch 42×42.',
            },
        },
    },
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

/** Live: controlled radio group; clicking an option selects it and updates state. */
export const Interactive: Story = {
    render: function InteractiveRadio() {
        const [value, setValue] = useState<string | number | boolean | null>('a')
        return (
            <StyledRadioGroup name='radio-interactive' value={value} onValueChange={(v) => setValue(v)}>
                <label className='flex items-center'>
                    <StyledRadio dataTest='radio-a' value='a' />
                    Option A
                </label>
                <label className='flex items-center'>
                    <StyledRadio dataTest='radio-b' value='b' />
                    Option B
                </label>
            </StyledRadioGroup>
        )
    },
    play: async ({ canvas, userEvent }) => {
        const [a, b] = canvas.getAllByRole('radio')
        await expect(a).toBeChecked()
        await userEvent.click(b as Element)
        await expect(b).toBeChecked()
        await expect(a).not.toBeChecked()
    },
}

/**
 * Full Figma variant table (node 15385-19720): rows = State, columns = Selected (Off/On).
 * Hover forced via `pseudo-hover`; Focused forced via the `data-focus-visible` attribute (mirrors the
 * checkbox). Read-only is omitted — the radio has no `readOnly` prop.
 */
export const Gallery: Story = {
    render: () => {
        const th: React.CSSProperties = {
            padding: 16,
            border: '1px solid #bdc4cf',
            textAlign: 'left',
            fontWeight: 600,
            color: '#49525f',
            background: '#f0f2f4',
            whiteSpace: 'nowrap',
        }
        const td: React.CSSProperties = { padding: 16, border: '1px solid #bdc4cf', textAlign: 'center' }
        const STATES: { label: string; props: Partial<StyledRadioProps> }[] = [
            { label: 'Enabled', props: {} },
            { label: 'Hovered', props: { className: 'pseudo-hover' } },
            { label: 'Focused', props: { 'data-focus-visible': '' } as Partial<StyledRadioProps> },
            { label: 'Error', props: { error: true } },
            { label: 'Disabled', props: { disabled: true } },
            { label: 'Read-only', props: { readOnly: true } },
        ]
        const COLS = [
            { key: 'off', label: 'Off', checked: false },
            { key: 'on', label: 'On', checked: true },
        ] as const
        return (
            <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={th}>State \ Selected</th>
                        {COLS.map((c) => (
                            <th key={c.key} style={th}>
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {STATES.map((s) => (
                        <tr key={s.label}>
                            <th scope='row' style={th}>
                                {s.label}
                            </th>
                            {COLS.map((c) => (
                                <td key={c.key} style={td}>
                                    <StyledRadio
                                        dataTest={`gallery-${s.label}-${c.key}`}
                                        checked={c.checked}
                                        onChange={() => undefined}
                                        {...s.props}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        )
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
