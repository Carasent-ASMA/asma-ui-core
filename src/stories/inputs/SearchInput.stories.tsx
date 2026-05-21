import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState as useStateReact } from 'react'
import { StyledSearchField, type StyledSearchFieldProps } from 'src/components/inputs/search-field/StyledSearchField'
import { expect, fn } from 'storybook/test'

const meta = {
    title: 'SearchField',
    component: StyledSearchField,
    args: {
        fullWidth: false,
        onChange: fn(),
        onClear: fn(),
    },
} satisfies Meta<typeof StyledSearchField>

export default meta
type Story = StoryObj<typeof StyledSearchField>

const ControlledRender = (args: StyledSearchFieldProps) => {
    const [value, setValue] = useStateReact<string>((args.value as string) ?? '')
    return (
        <div style={{ width: args.fullWidth ? '100%' : 320 }}>
            <StyledSearchField
                {...args}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = e?.target?.value ?? ''
                    setValue(v)
                    args.onChange?.(e)
                }}
                onClear={() => {
                    setValue('')
                    args.onClear?.()
                }}
            />
        </div>
    )
}

export const Interactive: Story = {
    args: {
        label: 'Search',
        value: '',
    },
    render: (args) => <ControlledRender {...args} />,
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByLabelText(/search/i)
        await expect(input).toBeInTheDocument()

        await userEvent.type(input, 'hello')
        await expect(input).toHaveValue('hello')

        const clearBtn = canvas.getByTestId('styled-search-clear-icon')
        await expect(clearBtn).toBeTruthy()

        await userEvent.click(clearBtn)
        await expect(input).toHaveValue('')
    },
}

export const FocusAndKeyboard: Story = {
    args: { label: 'Search', value: '' },
    render: (args) => <ControlledRender {...args} />,
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByLabelText(/search/i)

        input.focus()
        await expect(input).toHaveFocus()

        // const searchIcon = canvas.getByTestId('styled-search-icon')
        // const style = window.getComputedStyle(searchIcon)
        // await expect(parseFloat(style.opacity)).toBeLessThan(1)

        await userEvent.type(input, 'abc')
        await expect(input).toHaveValue('abc')
        await expect(input).toHaveFocus()
    },
}

export const LongTextOverflow: Story = {
    args: {
        label: 'Search',
        value: 'A very long text that should overflow the input and be truncated with ellipsis',
        fullWidth: false,
    },
    render: (args) => <ControlledRender {...args} />,
    play: async ({ canvas }) => {
        const input = canvas.getByDisplayValue('very long', { exact: false })
        await expect(input).toBeInTheDocument()

        const computed = window.getComputedStyle(input)
        expect(computed.textOverflow).toBe('ellipsis')
    },
}

export const ErrorState: Story = {
    args: { label: 'Search', value: '', error: true, helperText: 'Required field' },
    render: (args) => <ControlledRender {...args} />,
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText(/search/i)

        await expect(input).toHaveAttribute('aria-invalid', 'true')
        await expect(canvas.getByText(/required field/i)).toBeInTheDocument()
    },
}

export const Prefilled: Story = {
    args: {
        label: 'Search',
        value: 'prefilled value',
    },
}

export const ReadOnly: Story = {
    args: {
        label: 'Search',
        value: 'value',
        readOnly: true,
    },
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByLabelText(/search/i)
        const clearBtn = canvas.getByTestId(/styled-search-clear-icon/i)

        input.focus()
        await expect(input).not.toHaveFocus()

        await expect(input).toHaveValue('value')
        await userEvent.click(clearBtn)
        await expect(input).toHaveValue('value')
    },
}

export const Disabled: Story = {
    args: {
        label: 'Search',
        value: '',
        disabled: true,
    },
}

// NOTE: this triggers accessibility warnings
// export const EmptyNoLabel: Story = {
//     args: {
//         label: '',
//         value: '',
//     },
// }
