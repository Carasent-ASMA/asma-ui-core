import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { StyledInputField, type StyledInputFieldProps } from '../StyledInputField'
import { StyledChip } from 'src/components/data-display/chip'
import { expect } from 'storybook/test'

/**
 * Connects the (controlled) field to React state so every story is *live* — typing, clearing, and
 * the floating-label shrink all react to input. Seeded from `args.value`; the meta `render` keys this
 * on `args.value` so changing the control remounts with a fresh seed (no derived-state effect needed).
 */
const StatefulField = (args: StyledInputFieldProps): JSX.Element => {
    const [value, setValue] = useState<StyledInputFieldProps['value']>(args.value ?? '')
    return (
        <StyledInputField
            {...args}
            value={value}
            onChange={(event) => {
                setValue(event.target.value)
                args.onChange?.(event)
            }}
            onClear={() => {
                setValue('')
                args.onClear?.()
            }}
        />
    )
}

const meta: Meta<typeof StyledInputField> = {
    title: 'Inputs/InputField',
    component: StyledInputField,
    render: (args) => <StatefulField key={String(args.value)} {...args} />,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: [Input field](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=15561-37391) — standard height 40px, radius 4px.',
            },
        },
    },
    args: {
        label: 'Label',
        value: '',
        dataTest: 'storybook-input',
    },
    argTypes: {
        allowClear: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        disabled: { control: 'boolean' },
        error: { control: 'boolean' },
        size: {
            control: 'radio',
            options: ['small', 'medium'],
        },
        variant: {
            control: 'radio',
            options: ['outlined', 'standard', 'filled'],
        },
    },
}

export default meta
type Story = StoryObj<typeof StyledInputField>

export const Default: Story = {
    args: {
        helperText: 'Helper text',
    },
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('storybook-input')
        const shell = canvas.getByTestId('storybook-input-shell')

        await expect(shell.getBoundingClientRect().height).toBe(40)
        await expect(input.getBoundingClientRect().height).toBe(40)
    },
}

export const Focused: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText('Label')
        input.focus()

        const shell = canvas.getByTestId('storybook-input-shell')

        await expect(shell.getBoundingClientRect().height).toBe(40)
        await expect(input.getBoundingClientRect().height).toBe(40)
        await expect(input).toHaveFocus()
    },
}

export const Error: Story = {
    args: {
        error: true,
        helperText: 'Required field',
        value: 'Wrong value',
    },
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('storybook-input')
        const shell = canvas.getByTestId('storybook-input-shell')
        const helper = canvas.getByText('Required field').parentElement!

        await expect(shell.getBoundingClientRect().height).toBe(40)
        await expect(input.getBoundingClientRect().height).toBe(40)
        // Figma helper row: 4px below field, 24px total row height (node 15561-37857).
        await expect(getComputedStyle(helper).paddingTop).toBe('4px')
        await expect(helper.getBoundingClientRect().height).toBe(24)
        await expect(helper.getBoundingClientRect().top - shell.getBoundingClientRect().bottom).toBe(0)
        const icon = helper.querySelector('svg')!
        await expect(icon.getBoundingClientRect().top - shell.getBoundingClientRect().bottom).toBe(4)
        await expect(helper).toHaveAttribute('role', 'alert')
        await expect(input).toHaveAttribute('aria-invalid', 'true')
        await expect(input).toHaveAttribute('aria-describedby', helper.id)
    },
}

export const ReservedHelperSlot: Story = {
    args: {
        label: 'Email',
        reserveHelperText: true,
    },
    play: async ({ canvas, canvasElement }) => {
        const input = canvas.getByLabelText('Email')
        const describedById = input.getAttribute('aria-describedby')
        await expect(describedById).toBeTruthy()
        const helper = canvasElement.ownerDocument.getElementById(describedById ?? '')
        await expect(helper).toBeTruthy()
        await expect(helper!.getBoundingClientRect().height).toBe(24)
        await expect(helper).toHaveAttribute('role', 'status')
    },
}

export const ErrorWithoutMessage: Story = {
    args: {
        error: true,
        label: 'Email',
    },
    play: async ({ canvas, canvasElement }) => {
        const input = canvas.getByLabelText('Email')
        await expect(input).toHaveAttribute('aria-invalid', 'true')
        const describedById = input.getAttribute('aria-describedby')
        await expect(describedById).toBeTruthy()
        const helper = canvasElement.ownerDocument.getElementById(describedById ?? '')
        await expect(helper).toHaveAttribute('role', 'alert')
        await expect(helper).not.toHaveTextContent('Required')
        await expect(helper!.getBoundingClientRect().height).toBe(24)
    },
}

export const ReserveHelperTextFalse: Story = {
    args: {
        label: 'Email',
        reserveHelperText: false,
    },
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText('Email')
        await expect(input).not.toHaveAttribute('aria-describedby')
        await expect(canvas.queryByRole('status')).not.toBeInTheDocument()
        await expect(canvas.queryByRole('alert')).not.toBeInTheDocument()
    },
}

export const HintToErrorSwap: Story = {
    args: {
        label: 'Email',
        helperText: 'name@example.com',
        error: true,
    },
    play: async ({ canvas, canvasElement }) => {
        const input = canvas.getByLabelText('Email')
        const describedById = input.getAttribute('aria-describedby')
        await expect(describedById).toBeTruthy()
        const helper = canvasElement.ownerDocument.getElementById(describedById ?? '')
        await expect(helper).toHaveAttribute('role', 'alert')
        await expect(helper).toHaveTextContent('name@example.com')
        await expect(helper!.getBoundingClientRect().height).toBeGreaterThanOrEqual(24)
    },
}

export const Disabled: Story = {
    args: {
        disabled: true,
        value: 'Disabled value',
    },
    play: async ({ canvas }) => {
        const shell = canvas.getByTestId('storybook-input-shell')
        await expect(shell.getBoundingClientRect().height).toBe(40)
    },
}

export const NoLabel: Story = {
    args: {
        label: undefined,
        placeholder: 'Placeholder only',
    },
    play: async ({ canvas }) => {
        const shell = canvas.getByTestId('storybook-input-shell')
        const input = canvas.getByTestId('storybook-input')
        const outline = shell.querySelector('[aria-hidden]')

        await expect(shell.getBoundingClientRect().height).toBe(40)
        await expect(input.getBoundingClientRect().height).toBe(40)
        if (outline) await expect(outline.getBoundingClientRect().height).toBe(40)
    },
}

export const ReadOnly: Story = {
    args: {
        readOnly: true,
        value: 'Read only value',
    },
}

export const WithClear: Story = {
    args: {
        allowClear: true,
        value: 'Clear me',
    },
    // Live: clicking clear empties the (state-connected) value, which removes the clear button.
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByTestId('storybook-input')
        await expect(input).toHaveValue('Clear me')

        const clearButton = canvas.getByTestId('storybook-input-clear')
        await userEvent.click(clearButton)

        await expect(input).toHaveValue('')
        await expect(canvas.queryByTestId('storybook-input-clear')).not.toBeInTheDocument()
    },
}

export const Multiline: Story = {
    args: {
        className: 'w-[600px]',
        multiline: true,
        value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus fringilla ex elit, in interdum arcu accumsan ut. Praesent quis leo nibh. Integer tempus semper ante at malesuada. Cras pretium vel magna at suscipit. Mauris id nisi gravida diam posuere pulvinar quis pulvinar magna. Curabitur dapibus felis vitae ornare viverra. Fusce faucibus sollicitudin dolor.',
    },
    // Live: the textarea is editable and its value is state-connected.
    play: async ({ canvas, userEvent }) => {
        const textarea = canvas.getByTestId('storybook-input')
        await expect(textarea.tagName).toBe('TEXTAREA')
        await userEvent.type(textarea, ' Edited.')
        await expect((textarea as HTMLTextAreaElement).value.endsWith(' Edited.')).toBe(true)
    },
}

export const MultilineEmpty: Story = {
    args: {
        className: 'w-[600px]',
        label: 'Notes',
        multiline: true,
        minRows: 3,
    },
    // Live: typing into an empty multiline field works and grows the value.
    play: async ({ canvas, userEvent }) => {
        const textarea = canvas.getByTestId('storybook-input')
        await expect(textarea).toHaveValue('')
        await userEvent.type(textarea, 'Line one{Enter}Line two')
        await expect(textarea).toHaveValue('Line one\nLine two')
    },
}

export const AriaInvalid: Story = {
    args: {
        error: true,
        label: 'Email',
    },
    play: async ({ canvas }) => {
        const input = canvas.getByLabelText('Email')

        await expect(input).toHaveAttribute('aria-invalid', 'true')
    },
}

export const AriaDescribedBy: Story = {
    args: {
        label: 'Email',
        helperText: 'name@example.com',
    },
    play: async ({ canvas, canvasElement }) => {
        const input = canvas.getByLabelText('Email')

        // The `id` lives on the helper row's wrapper `<div>`; the visible text is in a nested
        // `<span>` (Figma helper-row icon layout) — `getByText('name@example.com')` matches that
        // inner `<span>`, which has no `id`, not the `id`-bearing wrapper. Resolve via the input's
        // own `aria-describedby` instead of assuming which node `getByText` returns.
        const describedById = input.getAttribute('aria-describedby')
        expect(describedById).toBeTruthy()
        const describedByEl = canvasElement.ownerDocument.getElementById(describedById ?? '')
        expect(describedByEl).toHaveTextContent('name@example.com')
    },
}

/**
 * The `<input>` must always carry an `id` — the browser keys autofill / autocomplete-history entries
 * on the field's `name`, falling back to the `id` attribute when there is no name (Chromium
 * `HTMLFormControlElement::NameForAutofill`). Most call sites pass neither, so a missing `id` silently
 * kills the browser's "previously entered value" dropdown, and the floating `<label htmlFor>` dangles.
 */
export const AutofillKeyAndLabelAssociation: Story = {
    args: {
        label: 'SMS code',
    },
    play: async ({ canvas, canvasElement }) => {
        const input = canvas.getByTestId('storybook-input')
        const generatedId = input.getAttribute('id')

        // No `name`/`id` prop → the generated id is the only autofill key the browser can use.
        await expect(generatedId).toBeTruthy()
        // The visible floating label must resolve to that same control (click-to-focus + a11y).
        const label = canvasElement.ownerDocument.querySelector(`label[for="${generatedId ?? ''}"]`)
        await expect(label).toHaveTextContent('SMS code')
    },
}

/**
 * A plain field says nothing about `autocomplete`, leaving the browser its default behaviour — that is
 * what makes its suggestion dropdown work. Components that own an option list (select-autocomplete,
 * dynamic select, date pickers) opt out by passing `autoComplete='off'` themselves.
 */
export const BrowserDefaultAutofill: Story = {
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('storybook-input')

        await expect(input).not.toHaveAttribute('autocomplete')
        // The id still lands — it is what `htmlFor` and the browser's autofill key both need.
        await expect(input.getAttribute('id')).toBeTruthy()
    },
}

/**
 * `autoComplete` and `name` are honoured from the `htmlInput` slot, not just as top-level props — that
 * slot is how `StyledSelectAutocomplete` marks its combobox `'off'`, and a bare `autoComplete,` in
 * `sharedProps` used to overwrite it with `undefined`.
 */
export const HtmlInputSlotAutoCompleteWins: Story = {
    args: {
        slotProps: { htmlInput: { autoComplete: 'off', name: 'from_slot' } },
    },
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('storybook-input')

        await expect(input).toHaveAttribute('autocomplete', 'off')
        await expect(input).toHaveAttribute('name', 'from_slot')
    },
}

/** The top-level prop still wins over the slot, so a call site can override a wrapper's choice. */
export const TopLevelAutoCompleteWins: Story = {
    args: {
        autoComplete: 'one-time-code',
        slotProps: { htmlInput: { autoComplete: 'off' } },
    },
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('storybook-input')

        await expect(input).toHaveAttribute('autocomplete', 'one-time-code')
    },
}

/** An explicit `id` reaches the real control (MUI `TextField` parity) — not just the label's `htmlFor`. */
export const ExplicitId: Story = {
    args: {
        id: 'sms-code-field',
        name: 'sms_code',
    },
    play: async ({ canvas }) => {
        const input = canvas.getByTestId('storybook-input')

        await expect(input).toHaveAttribute('id', 'sms-code-field')
        await expect(input).toHaveAttribute('name', 'sms_code')
    },
}

/** Figma _autocomplete chip-in-field pattern (Recipients section). */
export const ChipAdornmentList: Story = {
    args: {
        label: 'Recipients',
        placeholder: 'Search',
        slotProps: {
            input: {
                startAdornment: [
                    <StyledChip
                        key='user'
                        dataTest='chip-adornment-user'
                        avatar={
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-[#FF7B2E] text-[10px] font-semibold text-white'>
                                NN
                            </div>
                        }
                        label='First Name Surname'
                        onDelete={() => undefined}
                    />,
                ],
            },
        },
    },
    play: async ({ canvas }) => {
        const wrapper = canvas.getByTestId('storybook-input-adornment-list')
        const style = getComputedStyle(wrapper)
        // Figma filled autocomplete field (node 20475-29954): 16px padding (Icon-left inset + generous
        // vertical room), 8px chip gap. A single 32px chip row → 16 + 32 + 16 = 64px (vs the 40px empty
        // `py 8` state); the field grows from there as chips wrap.
        await expect(style.paddingTop).toBe('16px')
        await expect(style.paddingLeft).toBe('16px')
        await expect(style.gap).toBe('8px')
        await expect(style.minHeight).toBe('40px')
        // Grows to fit the chip row(s): one 32px row with 16px padding = 64px, more as chips wrap.
        await expect(wrapper.getBoundingClientRect().height).toBeGreaterThanOrEqual(64)
    },
}

/** Live: typing updates the state-connected value and floats the label. */
export const LiveTyping: Story = {
    args: { label: 'Type here', dataTest: 'storybook-input' },
    play: async ({ canvas, userEvent }) => {
        const input = canvas.getByTestId('storybook-input')
        await expect(input).toHaveValue('')
        await userEvent.type(input, 'Hello')
        await expect(input).toHaveValue('Hello')
    },
}

/**
 * Full Figma variant table (node 15561-37391): rows = State, columns = Filled (off/on).
 * Hovered is forced via `storybook-addon-pseudo-states` (`pseudo-hover`). Focused is React-state-driven
 * and inherently interactive — see the `Focused` story — so it is not part of this static matrix.
 */
export const Gallery: Story = {
    render: () => {
        const cell: React.CSSProperties = { padding: 16, border: '1px solid #bdc4cf', verticalAlign: 'top' }
        const head: React.CSSProperties = {
            ...cell,
            textAlign: 'left',
            fontWeight: 600,
            color: '#49525f',
            whiteSpace: 'nowrap',
            background: '#f0f2f4',
        }

        const ROWS = [
            { label: 'Enabled', props: {} },
            { label: 'Hovered', props: { className: 'pseudo-hover' } },
            { label: 'Error', props: { error: true, helperText: 'Error text' } },
            { label: 'Disabled', props: { disabled: true } },
            { label: 'Read only', props: { readOnly: true } },
        ] as const

        const COLS = [
            { key: 'off', label: 'Filled = off', value: undefined, placeholder: 'Placeholder text' },
            { key: 'on', label: 'Filled = on', value: 'Text value', placeholder: undefined },
        ] as const

        return (
            <div>
                <h3 style={{ marginBottom: 12 }}>Input field — State × Filled</h3>
                <table style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={head}>State \ Filled</th>
                            {COLS.map((c) => (
                                <th key={c.key} style={head}>
                                    {c.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ROWS.map((row) => (
                            <tr key={row.label}>
                                <th scope='row' style={head}>
                                    {row.label}
                                </th>
                                {COLS.map((col) => (
                                    <td key={col.key} style={cell}>
                                        <StyledInputField
                                            label='Label'
                                            dataTest={`gallery-${row.label}-${col.key}`}
                                            placeholder={col.placeholder}
                                            value={col.value}
                                            {...row.props}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    },
}

// export const CustomLabel: Story = {
//     args: {
//         id: 'email',
//         label: undefined,
//     },
//     render: (args) => {
//         return (
//             <>
//                 <StyledFormLabel title='Email' />
//
//                 <StyledInputField {...args} />
//             </>
//         )
//     },
//     play: async ({ canvas }) => {
//         const input = canvas.getByLabelText('Email')
//
//         await expect(input).toBeInTheDocument()
//     },
// }
