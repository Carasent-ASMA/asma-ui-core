import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { expect, within } from 'storybook/test'
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
                labelId='select'
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
            <StyledSelect {...args} disabled value='1'>
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

export const EmptyOptions: Story = {
    render: (args) => (
        <StyledFormControl>
            <StyledSelect {...args} value=''></StyledSelect>
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
                        <StyledSelect {...args} value='1'>
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
