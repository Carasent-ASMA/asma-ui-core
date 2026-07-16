import { Stack } from 'src/components/mui-compat'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ChevronDownIcon, FilterIcon } from 'src/components/icons'
import { expect } from 'storybook/test'
import { StyledButton, type StyledButtonProps } from './StyledButton'

const meta: Meta<typeof StyledButton> = {
    title: 'Inputs/Styled Button',
    component: StyledButton,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Button](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=13431-18852) — radius 4px, default height 40px.',
            },
        },
    },
    argTypes: {
        error: { control: 'boolean' },
        size: {
            control: 'radio',
            options: ['small', 'medium', 'large'],
        },
        variant: {
            control: 'select',
            options: ['contained', 'outlined', 'text', 'textGray', 'textWhite'],
        },
    },
    args: { children: 'Button label' },
}

export default meta
type Story = StoryObj<typeof StyledButton>

export const Default: Story = {
    args: {
        variant: 'contained',
    },
}

export const Variants: Story = {
    render: (args) => (
        <Stack direction='row' spacing={2}>
            <StyledButton {...args} variant='contained'>
                Contained
            </StyledButton>
            <StyledButton {...args} variant='outlined'>
                Outlined
            </StyledButton>
            <StyledButton {...args} variant='text'>
                Text
            </StyledButton>
            <StyledButton {...args} variant='textGray'>
                Text Gray
            </StyledButton>
            <StyledButton {...args} variant='textWhite'>
                Text White
            </StyledButton>
        </Stack>
    ),
}

export const WithIcons: Story = {
    render: (args) => (
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
            <StyledButton {...args} variant='contained' startIcon={<FilterIcon width={20} height={20} />}>
                With start
            </StyledButton>

            <StyledButton {...args} variant='contained' endIcon={<ChevronDownIcon width={20} height={20} />}>
                With end
            </StyledButton>

            <StyledButton {...args} variant='contained' startIcon={<FilterIcon width={20} height={20} />}>
                <span style={{ display: 'inline-block', maxWidth: 80 }}>Very long label that should truncate</span>
            </StyledButton>
        </Stack>
    ),
}

export const Sizes: Story = {
    render: (args) => (
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
            <StyledButton {...args} size='small'>
                Small
            </StyledButton>
            <StyledButton {...args} size='medium'>
                Medium
            </StyledButton>
            <StyledButton {...args} size='large'>
                Large
            </StyledButton>
        </Stack>
    ),
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvas, userEvent }) => {
        const button = canvas.getByRole('button', { name: /button label/i })
        await expect(button).toBeDisabled()

        await userEvent.click(button)
        await expect(button).toBeDisabled()
        await expect(button).not.toHaveFocus()
    },
}

export const Error: Story = {
    args: { error: true },
    play: async ({ canvas }) => {
        const button = canvas.getByRole('button', { name: /button label/i })
        await expect(button).toBeInTheDocument()

        const computed = window.getComputedStyle(button)
        await expect(computed.backgroundColor).toBe('rgb(225, 7, 0)')
    },
}

export const InteractiveClick: Story = {
    render: (args) => {
        const ClickWrapper: React.FC<typeof args> = (localArgs) => {
            const [count, setCount] = useState(0)
            return (
                <div>
                    <StyledButton {...localArgs} onClick={() => setCount((c) => c + 1)}>
                        Click me
                    </StyledButton>
                    <div data-testid='clicked-count'>clicked: {count}</div>
                </div>
            )
        }
        return <ClickWrapper {...args} />
    },

    play: async ({ canvas, userEvent }) => {
        const button = canvas.getByRole('button', { name: /click me/i })
        const counter = canvas.getByTestId('clicked-count')
        await expect(counter).toHaveTextContent('clicked: 0')

        await userEvent.click(button)
        await expect(counter).toHaveTextContent('clicked: 1')

        await userEvent.click(button)
        await expect(counter).toHaveTextContent('clicked: 2')
    },
}

export const KeyboardActivation: Story = {
    render: (args) => {
        const Wrapper: React.FC<typeof args> = (localArgs) => {
            const [pressed, setPressed] = useState(false)
            return (
                <div>
                    <StyledButton {...localArgs} onClick={() => setPressed(true)}>
                        Activate
                    </StyledButton>
                    <div data-testid='activated'>{pressed ? 'activated' : 'idle'}</div>
                </div>
            )
        }
        return <Wrapper {...args} />
    },
    play: async ({ canvas, userEvent }) => {
        const button = canvas.getByRole('button', { name: /activate/i })
        const activated = canvas.getByTestId('activated')

        button.focus()
        await expect(button).toHaveFocus()
        await userEvent.keyboard('{Enter}')
        await userEvent.keyboard(' ')
        await expect(activated).toHaveTextContent('activated')
    },
}

export const IconOnlyAccessibility: Story = {
    args: {
        children: undefined,
        startIcon: <ChevronDownIcon width={24} height={24} />,
        'aria-label': 'Open menu',
    },
    play: async ({ canvas }) => {
        const btn = canvas.getByRole('button', { name: /open menu/i })
        await expect(btn).toBeInTheDocument()
    },
}

export const FocusVisible: Story = {
    args: { children: 'Focus me' },
    play: async ({ canvas, userEvent }) => {
        const btn = canvas.getByRole('button', { name: /focus me/i })

        await userEvent.tab()
        await expect(btn).toHaveFocus()
    },
}

/**
 * Full Figma variant matrix (node 13431-18852) rendered as a table:
 * rows = Figma **Type** (+ **Danger**), columns = Figma **State**, one table per **Size**.
 * Interaction states (Hovered/Focused/Pressed) are forced statically via
 * `storybook-addon-pseudo-states` element classes (`pseudo-hover` / `pseudo-focus` / `pseudo-active`);
 * Disabled uses the native `disabled` attribute. `textWhite` is excluded — it has no Figma counterpart.
 */
export const Gallery: Story = {
    render: () => {
        // Figma "State" property -> how we force it statically
        const STATES = [
            { key: 'enabled', label: 'Enabled', className: '', disabled: false },
            { key: 'hovered', label: 'Hovered', className: 'pseudo-hover', disabled: false },
            { key: 'focused', label: 'Focused', className: 'pseudo-focus', disabled: false },
            { key: 'pressed', label: 'Pressed', className: 'pseudo-active', disabled: false },
            { key: 'disabled', label: 'Disabled', className: '', disabled: true },
        ] as const

        // Figma "Type" (+ "Danger") -> React variant/error. Quaternary has no Danger variant (matches error:never).
        const ROWS = [
            { figma: 'Primary (Contained)', variant: 'contained', danger: false },
            { figma: 'Secondary (Outlined)', variant: 'outlined', danger: false },
            { figma: 'Tertiary', variant: 'text', danger: false },
            { figma: 'Quaternary', variant: 'textGray', danger: false },
            { figma: 'Primary · Danger', variant: 'contained', danger: true },
            { figma: 'Secondary · Danger', variant: 'outlined', danger: true },
            { figma: 'Tertiary · Danger', variant: 'text', danger: true },
        ] as const

        const SIZES = [
            { size: 'medium', label: 'Medium — h40 / text 16' },
            { size: 'small', label: 'Small — h32 / text 14' },
        ] as const

        const cellStyle: React.CSSProperties = { padding: 12, border: '1px solid #bdc4cf', verticalAlign: 'middle' }
        const headStyle: React.CSSProperties = { ...cellStyle, textAlign: 'left', fontWeight: 600, color: '#49525f', whiteSpace: 'nowrap', background: '#f0f2f4' }

        return (
            <Stack spacing={5}>
                {SIZES.map(({ size, label }) => (
                    <div key={size}>
                        <h3 style={{ marginBottom: 12 }}>{label}</h3>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={headStyle}>Type \ State</th>
                                    {STATES.map((s) => (
                                        <th key={s.key} style={headStyle}>
                                            {s.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ROWS.map((row) => (
                                    <tr key={row.figma}>
                                        <th scope='row' style={headStyle}>
                                            {row.figma}
                                        </th>
                                        {STATES.map((s) => {
                                            const props = {
                                                size,
                                                variant: row.variant,
                                                disabled: s.disabled,
                                                className: s.className,
                                                dataTest: `gallery-${size}-${row.variant}-${row.danger ? 'danger' : 'off'}-${s.key}`,
                                                children: 'Button',
                                                ...(row.danger ? { error: true } : {}),
                                            } as StyledButtonProps
                                            return (
                                                <td key={s.key} style={cellStyle}>
                                                    <StyledButton {...props} />
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </Stack>
        )
    },
}
