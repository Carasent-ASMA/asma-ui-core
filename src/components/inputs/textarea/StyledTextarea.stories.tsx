import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef, useState, type CSSProperties } from 'react'
import { expect } from 'storybook/test'
import { StyledTextarea } from './StyledTextarea'

const meta = {
    title: 'Inputs/Styled Textarea',
    component: StyledTextarea,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'Figma: no standalone Text area — inherits the [Input field](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=15561-37391) outlined styling (radius 4, Body Base 16 text, border delta-500 / hover gama-300 2px / focus gama-400 2px / error error-500), multiline.',
            },
        },
    },
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

/**
 * Gallery — the Textarea has no standalone Figma node; it inherits the Input field state matrix
 * (node 15561-37391). This replicates that matrix: State (Enabled/Hovered/Focused/Error/Disabled/
 * View-only/Not-editable) × Filled (off/on), with visible grid borders. Hover/Focus are forced via
 * `storybook-addon-pseudo-states` classes so every state renders at rest.
 */
export const Gallery: Story = {
    render: () => {
        const cell: CSSProperties = { padding: 16, border: '1px solid #bdc4cf', verticalAlign: 'top', width: 320 }
        const head: CSSProperties = {
            ...cell,
            width: 'auto',
            textAlign: 'left',
            fontWeight: 600,
            color: '#49525f',
            whiteSpace: 'nowrap',
            background: '#f0f2f4',
        }

        const ROWS: { label: string; props: Record<string, unknown> }[] = [
            { label: 'Enabled', props: { variant: 'active' } },
            { label: 'Hovered', props: { variant: 'active', className: 'pseudo-hover' } },
            { label: 'Focused', props: { variant: 'active', className: 'pseudo-focus' } },
            { label: 'Error', props: { variant: 'active', error: true, errorMessage: 'Error text' } },
            { label: 'Disabled', props: { variant: 'active', disabled: true } },
            { label: 'View only', props: { variant: 'view_only' } },
            { label: 'Not editable', props: { variant: 'not_editable' } },
        ]

        const COLS = [
            { key: 'off', label: 'Filled = off', value: '', placeholder: 'Type here...' },
            { key: 'on', label: 'Filled = on', value: 'Text value', placeholder: undefined },
        ] as const

        return (
            <div>
                <h3 style={{ marginBottom: 12 }}>Text area — State × Filled</h3>
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
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        <StyledTextarea
                                            {...(row.props as any)}
                                            id={`gallery-${row.label}-${col.key}`}
                                            label='Label'
                                            placeholder={col.placeholder}
                                            value={col.value}
                                            onChange={() => undefined}
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
