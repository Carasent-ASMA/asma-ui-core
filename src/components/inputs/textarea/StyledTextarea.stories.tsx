import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { expect } from 'storybook/test'
import { StyledTextarea } from './StyledTextarea'

const meta = {
    title: 'Inputs/Styled Textarea',
    component: StyledTextarea,
    tags: ['autodocs'],
    args: {
        containerClassName: 'max-w-[600px]',
        id: 'textarea',
        label: 'Label',
        description: 'Description message',
        placeholder: 'Type here...',
        variant: 'active',
    },
    argTypes: {
        variant: {
            control: 'select',
            options: ['active', 'view_only', 'not_editable'],
        },
    },
} satisfies Meta<typeof StyledTextarea>

export default meta
type Story = StoryObj<typeof StyledTextarea>

//NOTE: to fix the any type for the args the component needs a refactor for its type definition
// which then makes it so that you have to refactor the code, so I skipped it for now

export const Active: Story = {
    render: (args: any) => {
        const [value, setValue] = useState('')

        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
}

export const WithCounter: Story = {
    args: {
        counter: true,
        counterLimit: 160,
        maxLength: 500,
    },
    render: (args: any) => {
        const [value, setValue] = useState('')

        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
}

export const Error: Story = {
    render: (args: any) => {
        const [value, setValue] = useState('')

        const minChars = 5
        const maxChars = 50

        const hasError = value.length < minChars || value.length > maxChars

        const errorMessage =
            value.length < minChars
                ? `Minimum ${minChars} characters required`
                : `Maximum ${maxChars} characters exceeded`

        return (
            <StyledTextarea
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                error={hasError}
                errorMessage={hasError ? errorMessage : undefined}
                maxLength={maxChars}
            />
        )
    },
}

export const Disabled: Story = {
    args: {
        disabled: true,
        value: 'Disabled content',
    },
}

export const ViewOnly: Story = {
    args: {
        variant: 'view_only',
        value: 'This content is view only. It cannot be edited.',
    },
}

export const NotEditable: Story = {
    args: {
        variant: 'not_editable',
        value: 'This content is not editable but styled differently.',
    },
}

export const AutoResize: Story = {
    args: {
        minRows: 2,
        maxRows: 6,
    },
    render: (args: any) => {
        const [value, setValue] = useState('Start typing multiple lines...\n\n')

        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
}

export const WithExternalRef: Story = {
    render: (args: any) => {
        const ref = useRef<HTMLTextAreaElement>(null)
        const [value, setValue] = useState('')

        return (
            <div className='flex flex-col gap-2'>
                <StyledTextarea
                    {...args}
                    refLink={ref}
                    value={value}
                    counter
                    counterLimit={120}
                    onChange={(e) => setValue(e.target.value)}
                />
                <div className='text-sm'>Current height: {ref.current?.style.height}</div>
            </div>
        )
    },
}

export const FocusInteraction: Story = {
    render: (args: any) => {
        const [value, setValue] = useState('')
        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
    play: async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole('textbox')

        await userEvent.click(textarea)

        await expect(textarea).toHaveFocus()
    },
}

export const MaxRowsOverflow: Story = {
    args: {
        minRows: 2,
        maxRows: 4,
    },
    render: (args: any) => {
        const [value, setValue] = useState(Array(20).fill('Long content line').join('\n'))

        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
}

export const LongSingleLine: Story = {
    render: (args: any) => {
        const [value, setValue] = useState(
            'Looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong',
        )

        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
}

export const CounterLimitMismatch: Story = {
    args: {
        counter: true,
        counterLimit: 50,
        maxLength: 200,
    },
    render: (args: any) => {
        const [value, setValue] = useState('')

        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
}

export const NoLabel: Story = {
    args: {
        id: undefined,
        label: '',
        description: 'Only description provided',
    },
    render: (args: any) => {
        const [value, setValue] = useState('')
        return <StyledTextarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />
    },
}

export const LargeContentStress: Story = {
    render: (args) => {
        const [value] = useState(Array(200).fill('Lorem ipsum dolor sit amet').join('\n'))

        return <StyledTextarea {...args} value={value} />
    },
}
