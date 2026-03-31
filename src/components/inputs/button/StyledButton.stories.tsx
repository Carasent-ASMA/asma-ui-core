import { Icon } from '@iconify/react'
import { Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ChevronDownIcon } from 'asma-ui-icons'
import { expect } from 'storybook/test'
import { StyledButton } from './StyledButton'

const meta: Meta<typeof StyledButton> = {
    title: 'Inputs/Styled Button',
    component: StyledButton,
    tags: ['autodocs'],
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
        <Stack direction='row' spacing={2} alignItems='center'>
            <StyledButton
                {...args}
                variant='contained'
                startIcon={<Icon icon='mdi:filter-variant' width={20} height={20} />}
            >
                With start
            </StyledButton>

            <StyledButton {...args} variant='contained' endIcon={<ChevronDownIcon width={20} height={20} />}>
                With end
            </StyledButton>

            <StyledButton
                {...args}
                variant='contained'
                startIcon={<Icon icon='mdi:filter-variant' width={20} height={20} />}
            >
                <span style={{ display: 'inline-block', maxWidth: 80 }}>Very long label that should truncate</span>
            </StyledButton>
        </Stack>
    ),
}

export const Sizes: Story = {
    render: (args) => (
        <Stack direction='row' spacing={2} alignItems='center'>
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
        startIcon: <ChevronDownIcon />,
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

export const Gallery: Story = {
    render: (args) => {
        const variants = ['contained', 'outlined', 'text', 'textGray', 'textWhite'] as const
        const sizes = ['small', 'medium', 'large'] as const
        const states = [
            { label: 'default', props: {} },
            { label: 'error', props: { error: true } },
            { label: 'disabled', props: { disabled: true } },
        ]

        return (
            <Stack spacing={4}>
                {states.map((state) => (
                    <div key={state.label}>
                        <h3 style={{ marginBottom: 8 }}>{state.label}</h3>
                        <Stack spacing={3}>
                            {sizes.map((size) => (
                                <Stack key={size} direction='row' spacing={2} alignItems='center'>
                                    {variants.map((variant) => (
                                        <StyledButton
                                            key={`${state.label}-${size}-${variant}`}
                                            {...args}
                                            {...state.props}
                                            size={size}
                                            variant={variant}
                                            startIcon={<Icon icon='mdi:filter-variant' width={18} height={18} />}
                                            endIcon={<ChevronDownIcon width={18} height={18} />}
                                        >
                                            {variant}
                                        </StyledButton>
                                    ))}
                                </Stack>
                            ))}
                        </Stack>
                    </div>
                ))}
            </Stack>
        )
    },
}
