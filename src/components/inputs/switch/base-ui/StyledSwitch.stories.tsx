import React, { type PropsWithoutRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { StyledSwitch, type SwitchProps } from './StyledSwitch'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import { expect } from 'storybook/test'

const meta = {
    title: 'base-ui/Styled Switch',
    component: StyledSwitch,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Switch / _BASE_Switch](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=9197-92635) — track 38×22, touch 54×32.',
            },
        },
    },
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

/** Live: controlled switch whose state drives the label; clicking toggles it. */
export const Interactive: Story = {
    render: function InteractiveSwitch(args) {
        const [checked, setChecked] = React.useState(false)
        return (
            <StyledFormControlLabel
                label={checked ? 'On' : 'Off'}
                control={
                    <StyledSwitch
                        {...args}
                        dataTest='switch-interactive'
                        checked={checked}
                        onChange={(_, next) => setChecked(next)}
                    />
                }
            />
        )
    },
    play: async ({ canvas, userEvent }) => {
        const el = canvas.getByRole('switch')
        await expect(el).toHaveAttribute('aria-checked', 'false')
        await userEvent.click(el)
        await expect(el).toHaveAttribute('aria-checked', 'true')
        await userEvent.click(el)
        await expect(el).toHaveAttribute('aria-checked', 'false')
    },
}

/**
 * Full Figma variant table (node 9197-92635): rows = State, columns = Selected (Off/On).
 * Hover/Focus are CSS-driven, so `storybook-addon-pseudo-states` forces them via `pseudo-hover` /
 * `pseudo-focus-visible` element classes.
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
        const STATES: { label: string; props: Partial<SwitchProps> }[] = [
            { label: 'Enabled', props: {} },
            { label: 'Hovered', props: { className: 'pseudo-hover' } },
            { label: 'Focused', props: { className: 'pseudo-focus-visible' } },
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
                                    <StyledSwitch
                                        dataTest={`gallery-${s.label}-${c.key}`}
                                        defaultChecked={c.checked}
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

/** Figma composite Switch with left label + error ring. */
export const CompositeLeftLabelError: Story = {
    render: () => (
        <StyledFormControlLabel
            label='Groups view'
            labelPlacement='start'
            control={<StyledSwitch dataTest='switch-groups-error' error defaultChecked />}
        />
    ),
    play: async ({ canvas }) => {
        const switchEl = canvas.getByRole('switch')
        await expect(switchEl).toHaveAttribute('data-error')
    },
}
