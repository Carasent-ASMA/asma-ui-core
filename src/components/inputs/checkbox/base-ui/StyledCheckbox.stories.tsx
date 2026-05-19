import type { Meta, StoryObj } from '@storybook/react'
import { StyledCheckbox } from './StyledCheckbox'

const meta = {
    title: 'base-ui/Checkbox',
    component: StyledCheckbox,
    tags: ['autodocs'],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledCheckbox>

export default meta
type Story = StoryObj<typeof StyledCheckbox>

export const Checkbox: Story = {
    args: { ...meta.args },
    render: () => <CheckboxTablesExample />,
}

const COLUMN_NAMES = ['Enabled', 'Hovered', 'Focused', 'Disabled', 'Read only']
const ROW_NAMES = ['Green', 'Blue', 'Fretex']

const ROW_THEME_BY_NAME: Record<string, 'greenish' | 'default' | 'fretex'> = {
    Green: 'greenish',
    Blue: 'default',
    Fretex: 'fretex',
}

type ColumnProps = Partial<React.ComponentProps<typeof StyledCheckbox>> & {
    'data-focus-visible'?: string
    'data-hovered'?: string
}

const COLUMN_CHECKBOX_PROPS: Record<string, ColumnProps> = {
    Hovered: { 'data-hovered': '' },
    Focused: { 'data-focus-visible': '' },
    Disabled: { disabled: true },
    'Read only': { readOnly: true },
}

type CheckboxTableProps = {
    title: string
    checkboxProps?: Partial<React.ComponentProps<typeof StyledCheckbox>>
}

const CheckboxStateTable = ({ title, checkboxProps }: CheckboxTableProps) => {
    return (
        <table className='w-full table-fixed border-collapse text-delta-600 font-semibold text-lg'>
            <thead className='bg-delta-10 h-[96px]'>
                <tr>
                    <th className='box-border text-delta-800 text-2xl w-[200px] p-6 border border-solid border-delta-200 text-left'>
                        {title}
                    </th>
                    {COLUMN_NAMES.map((columnName) => (
                        <th key={columnName} className='box-border w-[140px] p-6 border border-solid border-delta-200'>
                            {columnName}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {ROW_NAMES.map((rowName) => (
                    <tr key={rowName} className='h-[96px]'>
                        <th scope='row' className='box-border p-6 border border-solid border-delta-200 text-left'>
                            {rowName}
                        </th>
                        {COLUMN_NAMES.map((columnName) => (
                            <td
                                key={`${rowName}-${columnName}`}
                                className='box-border border border-solid border-delta-200'
                            >
                                <div
                                    className='flex items-center justify-center'
                                    data-theme={ROW_THEME_BY_NAME[rowName]}
                                >
                                    <StyledCheckbox
                                        dataTest={`${title}-${rowName}-${columnName}`}
                                        size='medium'
                                        {...checkboxProps}
                                        {...COLUMN_CHECKBOX_PROPS[columnName]}
                                    />
                                    <span className='text-sm font-normal text-delta-800'>Label</span>
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

const CheckboxTablesExample = () => {
    return (
        <div className='flex flex-col gap-10'>
            <CheckboxStateTable title='Unchecked' />

            <CheckboxStateTable title='Checked' checkboxProps={{ checked: true }} />

            <CheckboxStateTable title='Indeterminate' checkboxProps={{ indeterminate: true }} />
        </div>
    )
}
