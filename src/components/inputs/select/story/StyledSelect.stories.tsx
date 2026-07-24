import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { expect, waitFor, within } from 'storybook/test'
import { StyledSelect, type StyledSelectProps } from '../StyledSelect'
import { StyledSelectItem } from '../StyledSelectItem'

const options = [
    { title: 'Van Henry', id: '1' },
    { title: 'April Tucker', id: '2' },
    { title: 'Ralph Hubbard', id: '3' },
]

const meta: Meta<typeof StyledSelect> = {
    title: 'Inputs/Select',
    component: StyledSelect,
    tags: [],
    argTypes: {
        size: {
            control: 'radio',
            options: ['small', 'medium'],
        },
    },
    args: {
        size: 'small',
    },
}

export default meta
type Story = StoryObj<typeof StyledSelect>

const Controlled = (args: StyledSelectProps) => {
    const [value, setValue] = useState('1')

    return (
        <StyledFormControl>
            <StyledSelect
                {...args}
                dataTest='select'
                // `labelId` claims an external label to point `aria-labelledby` at — this story
                // renders none, so that reference resolved to nothing (axe `button-name`); `name`
                // exercises the same fallback chain against a name that genuinely exists instead.
                name='Select a person'
                value={value}
                onChange={(e, child) => {
                    setValue(e.target.value as string)
                    args.onChange?.(e, child)
                }}
            >
                {options.map((o) => (
                    <StyledSelectItem key={o.id} value={o.id}>
                        {o.title}
                    </StyledSelectItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    )
}

/**
 * Trigger state gallery (field node 15561-37391): rows = State, columns = Value (Empty/Filled).
 * Hover forced via the root `group` + `pseudo-hover`. Focused/Open are React-driven and interactive —
 * see SelectOption / AriaLifecycle.
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
        const td: React.CSSProperties = { padding: 16, border: '1px solid #bdc4cf', verticalAlign: 'top' }
        const STATES: { label: string; props: Partial<StyledSelectProps> }[] = [
            { label: 'Default', props: {} },
            { label: 'Hovered', props: { className: 'pseudo-hover' } },
            { label: 'Error', props: { error: true, errorText: 'Error text' } },
            { label: 'Disabled', props: { disabled: true } },
        ]
        const COLS = [
            { key: 'empty', label: 'Empty', value: '' },
            { key: 'filled', label: 'Filled', value: '1' },
        ] as const
        return (
            <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={th}>State \ Value</th>
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
                                    <div style={{ width: 220 }}>
                                        <StyledFormControl>
                                            <StyledSelect
                                                dataTest={`gallery-${s.label}-${c.key}`}
                                                name={`${s.label} ${c.label}`}
                                                value={c.value}
                                                placeholder='Select'
                                                fullWidth
                                                {...s.props}
                                            >
                                                {options.map((o) => (
                                                    <StyledSelectItem key={o.id} value={o.id}>
                                                        {o.title}
                                                    </StyledSelectItem>
                                                ))}
                                            </StyledSelect>
                                        </StyledFormControl>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    },
}

export const SelectOption: Story = {
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)
        const trigger = canvas.getByRole('combobox')

        await userEvent.click(trigger)

        const option = await canvas.findByRole('option', { name: 'April Tucker' })
        await userEvent.click(option)

        await expect(trigger).toHaveTextContent('April Tucker')
    },
}

export const KeyboardNavigation: Story = {
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)
        const trigger = canvas.getByRole('combobox')

        trigger.focus()
        await expect(trigger).toHaveFocus()

        await userEvent.keyboard('{ArrowDown}')

        const listbox = await canvas.findByRole('listbox')
        await expect(listbox).toBeInTheDocument()

        // Opening moves focus to the first option via `requestAnimationFrame` (StyledSelect's
        // `handleTriggerKeyDown`) — a real async step `findByRole` above doesn't wait for (it only
        // waits for the listbox to exist in the DOM). Without this wait, a further `{ArrowDown}` sent
        // before the RAF fires still lands on the trigger (re-opening a no-op, and losing a navigation
        // step) instead of the listbox — flaky depending on RAF timing under test load.
        await waitFor(() => expect(canvasElement.ownerDocument.activeElement).toHaveAttribute('role', 'option'))

        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{ArrowDown}')

        await userEvent.keyboard('{Enter}')

        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()

        await expect(trigger).toHaveTextContent('Ralph Hubbard')
    },
}

export const ClearBehavior: Story = {
    args: { allowClear: true },
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)
        const trigger = canvas.getByRole('combobox')

        await expect(trigger).toHaveTextContent('Van Henry')

        const clearButton = canvas.getByTestId('select-clear-button')

        await userEvent.click(clearButton)

        await expect(trigger).not.toHaveTextContent('Van Henry')

        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    },
}

export const DisabledBehavior: Story = {
    render: (args) => (
        <StyledFormControl>
            <StyledSelect {...args} dataTest='select-disabled' name='Select disabled' disabled value='1'>
                {options.map((o) => (
                    <StyledSelectItem key={o.id} value={o.id}>
                        {o.title}
                    </StyledSelectItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    ),
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)
        const trigger = canvas.getByRole('combobox')

        await userEvent.click(trigger)

        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    },
}

export const AriaLifecycle: Story = {
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        await expect(trigger).toHaveAttribute('aria-expanded', 'false')

        await userEvent.click(trigger)

        await expect(trigger).toHaveAttribute('aria-expanded', 'true')

        const listbox = await canvas.findByRole('listbox')
        await expect(listbox).toBeInTheDocument()

        await userEvent.keyboard('{Escape}')

        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    },
}

export const FocusReturnAfterSelect: Story = {
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        trigger.focus()
        await expect(trigger).toHaveFocus()

        await userEvent.keyboard('{ArrowDown}')

        // Same RAF-timing wait as KeyboardNavigation — see its comment.
        await waitFor(() => expect(canvasElement.ownerDocument.activeElement).toHaveAttribute('role', 'option'))

        await userEvent.keyboard('{ArrowDown}')
        await userEvent.keyboard('{Enter}')

        // Focus should return to trigger
        await expect(trigger).toHaveFocus()
    },
}

export const EscapeCloses: Story = {
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        await userEvent.click(trigger)

        await canvas.findByRole('listbox')

        await userEvent.keyboard('{Escape}')

        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    },
}

export const SelectingSameValue: Story = {
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        await expect(trigger).toHaveTextContent('Van Henry')

        await userEvent.click(trigger)

        const sameOption = await canvas.findByRole('option', {
            name: 'Van Henry',
        })

        await userEvent.click(sameOption)

        await expect(trigger).toHaveTextContent('Van Henry')

        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    },
}

export const MultipleSelectBehavior: Story = {
    render: (args) => (
        <StyledFormControl>
            <StyledSelect {...args} multiple value={['1']}>
                {options.map((o) => (
                    <StyledSelectItem key={o.id} value={o.id}>
                        {o.title}
                    </StyledSelectItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    ),
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        await userEvent.click(trigger)

        const option = await canvas.findByRole('option', {
            name: 'April Tucker',
        })

        await userEvent.click(option)

        // Should remain open in multi mode
        await expect(canvas.getByRole('listbox')).toBeInTheDocument()
    },
}

export const EmptyOptions: Story = {
    render: (args) => (
        <StyledFormControl>
            <StyledSelect {...args} dataTest='select-empty' name='Select empty' value=''></StyledSelect>
        </StyledFormControl>
    ),
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        await userEvent.click(trigger)

        const listbox = await canvas.findByRole('listbox')
        await expect(listbox).toBeInTheDocument()

        await expect(canvas.queryByRole('option')).not.toBeInTheDocument()
    },
}

export const InvalidExternalValue: Story = {
    render: (args) => <Controlled {...args} value='999' />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        // Should not crash
        await expect(trigger).toBeInTheDocument()

        // Should not show random text
        await expect(trigger).not.toHaveTextContent('999')
    },
}

export const DynamicOptionsChange: Story = {
    render: (args) => {
        const Dynamic = () => {
            const [items, setItems] = useState(options)

            return (
                <>
                    <button data-testid='update-options' onClick={() => setItems([{ id: '10', title: 'New User' }])}>
                        Update
                    </button>

                    <StyledFormControl>
                        <StyledSelect {...args} dataTest='select-dynamic' name='Select dynamic' value='1'>
                            {items.map((o) => (
                                <StyledSelectItem key={o.id} value={o.id}>
                                    {o.title}
                                </StyledSelectItem>
                            ))}
                        </StyledSelect>
                    </StyledFormControl>
                </>
            )
        }

        return <Dynamic />
    },
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        await userEvent.click(canvas.getByTestId('update-options'))

        const trigger = canvas.getByRole('combobox')

        // Should not crash even if value no longer exists
        await expect(trigger).toBeInTheDocument()
    },
}

export const RapidOpenClose: Story = {
    render: (args) => <Controlled {...args} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')

        await userEvent.click(trigger)
        await userEvent.keyboard('{Escape}')
        await userEvent.click(trigger)
        await userEvent.keyboard('{Escape}')
        await userEvent.click(trigger)

        const listbox = await canvas.findByRole('listbox')
        await expect(listbox).toBeInTheDocument()
    },
}

/**
 * Read-only trigger must not open the listbox. The trigger is `pointer-events-none` (so a click can't
 * reach it) AND `useClick` is disabled, and the keyboard opener (ArrowDown) bails on `readOnly`.
 */
export const ReadOnlyDoesNotOpen: Story = {
    render: (args) => <Controlled {...args} readOnly />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')
        trigger.focus()
        await userEvent.keyboard('{ArrowDown}')

        await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()
    },
}

/**
 * Figma parity: both the trigger value and every option are Body Base 16px (Menus item node
 * 16073-19226 / Input field 15561-37391) — at every `size`, including `small` (a no-op for text).
 */
export const OptionAndValueAre16px: Story = {
    render: (args) => <Controlled {...args} size='small' />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)

        const trigger = canvas.getByRole('combobox')
        await expect(getComputedStyle(trigger).fontSize).toBe('16px')

        await userEvent.click(trigger)
        const option = await canvas.findByRole('option', { name: 'Van Henry' })
        await expect(getComputedStyle(option).fontSize).toBe('16px')
    },
}

// Multiple-select is covered by StyledSelectAutocomplete — the single-select StyledSelect no longer
// showcases a `multiple` story here (the prop remains for MUI API parity).

// FIXME: this one is finicky because of the document selector, maybe will just remove it
// export const PortalCleanup: Story = {
//     render: (args) => <Controlled {...args} />,
//     play: async ({ canvasElement, userEvent }) => {
//         const canvas = within(canvasElement.ownerDocument.body)
//
//         const trigger = canvas.getByRole('combobox')
//
//         await userEvent.click(trigger)
//         await canvas.findByRole('listbox')
//
//         await userEvent.keyboard('{Escape}')
//
//         // Ensure no orphaned listboxes remain in document
//         const allListboxes = document.querySelectorAll('[role="listbox"]')
//         console.log(allListboxes)
//         // const listbox = canvas.getAllByRole('listbox')
//         await expect(allListboxes.length).toBe(0)
//         // await expect(listbox.length).toBe(0)
//     },
// }
