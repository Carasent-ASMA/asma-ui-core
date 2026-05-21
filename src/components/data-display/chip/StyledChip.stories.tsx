import type { Meta } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { StyledChip } from './StyledChip'
import { StyledInteractiveChip } from '../interactive-chip'
import { DotsVerticalIcon, ChevronDownIcon } from '../../icons'

const meta: Meta = {
    title: 'DataDisplay/Chip',
    component: StyledChip,
    tags: [],
    args: { dataTest: 'chip', label: 'Default label', variant: 'filled' },
    argTypes: {
        disabled: { control: 'boolean' },
        readOnly: { control: 'boolean' },
        variant: {
            control: 'radio',
            options: ['filled', 'outlined'],
        },
    },
} satisfies Meta<typeof StyledChip>

export default meta

const COLUMN_NAMES = ['Enabled', 'Hovered', 'Focused', 'Read only']
const ROW_NAMES = ['Standard', 'User tag', 'Group tag', 'Checkbox', 'Radio']

type ChipStateProps = Partial<React.ComponentProps<typeof StyledChip>> & {
    'data-focus'?: string
    'data-hovered'?: string
    checked?: boolean
}

const COLUMN_CHIP_PROPS: Record<string, ChipStateProps> = {
    Hovered: { 'data-hovered': '' },
    Focused: { 'data-focus': '' },
    'Read only': {
        readOnly: true,
    },
}

interface CellChipsConfig {
    chips: ChipStateProps[]
}

interface RowConfig extends ChipStateProps {
    type?: 'checkbox' | 'radio'
    cells?: Record<string, CellChipsConfig>
}

const Avatar = () => {
    return (
        <div className='min-w-6 min-h-6 w-6 h-6 text-white uppercase rounded-full flex items-center justify-center text-[10px] font-semibold bg-[#FF7B2E]'>
            NN
        </div>
    )
}

const GroupTitle = () => {
    return (
        <>
            <span className='flex h-[16px] items-center rounded bg-delta-700 px-[6px] text-[10px] font-semibold text-white uppercase'>
                Group
            </span>
            <span className='flex w-full min-w-0 items-center justify-center gap-x-1 text-delta-800'>
                <span className='min-w-0 truncate text-sm font-semibold'>Group name</span>
                <span>(0/8)</span>
            </span>
        </>
    )
}

const GroupTagLabel = ({ withChevron = true }: { withChevron?: boolean }) => {
    return (
        <div className='flex w-full items-center gap-1'>
            {withChevron ? (
                <span className='flex items-center text-delta-700'>
                    <ChevronDownIcon width={24} height={24} />
                </span>
            ) : null}
            <GroupTitle />
        </div>
    )
}

const CELL_CHIPS_CONFIG: Record<string, RowConfig> = {
    Standard: {
        label: 'Category',
        onDelete: fn(),
        cells: {
            Enabled: {
                chips: [
                    {},
                    {
                        label: (
                            <div className='flex items-center gap-1 text-sm text-delta-800'>
                                <span>Category</span>
                                <DotsVerticalIcon width={20} height={20} className='text-delta-700' />
                            </div>
                        ),
                        onDelete: undefined,
                        classes: {
                            label: 'pr-1',
                        },
                    },
                ],
            },
            'Read only': {
                chips: [
                    {},
                    {},
                    {
                        disabled: true,
                    },
                ],
            },
        },
    },

    'User tag': {
        label: (
            <div className='flex items-center gap-x-1 text-delta-800'>
                <Avatar />
                <span className='truncate text-sm'>First Name Surname</span>•<span className='text-xs'> 12612</span>
            </div>
        ),
        onDelete: fn(),
        classes: {
            label: 'pl-1',
        },
    },

    'Group tag': {
        label: <GroupTagLabel />,
        onDelete: fn(),
        classes: {
            label: 'pl-1',
        },
        cells: {
            'Read only': {
                chips: [
                    {
                        label: <GroupTagLabel withChevron={false} />,
                        classes: {
                            label: '',
                        },
                    },
                ],
            },
        },
    },

    Checkbox: {
        label: 'Quick filter',
        type: 'checkbox',
        cells: {
            Enabled: {
                chips: [{ checked: false }, { checked: true }],
            },
            Hovered: {
                chips: [{ checked: false }, { checked: true }],
            },
            Focused: {
                chips: [{ checked: false }, { checked: true }],
            },
            'Read only': {
                chips: [{ checked: false }, { checked: true }],
            },
        },
    },

    Radio: {
        label: 'Single option',
        type: 'radio',
        cells: {
            Enabled: {
                chips: [{ checked: false }, { checked: true }],
            },
            Hovered: {
                chips: [{ checked: false }, { checked: true }],
            },
            Focused: {
                chips: [{ checked: false }, { checked: true }],
            },
            'Read only': {
                chips: [{ checked: false }, { checked: true }],
            },
        },
    },
}

const ChipStateTable = () => {
    return (
        <table className='w-full table-fixed border-collapse text-delta-600'>
            <thead className='bg-delta-10 h-[138px]'>
                <tr>
                    <th className='box-border text-delta-800 text-2xl w-[200px] p-6 border border-solid border-delta-200 text-left'>
                        Tag / Chip
                    </th>
                    {COLUMN_NAMES.map((columnName) => (
                        <th
                            key={columnName}
                            className='box-border w-[280px] font-semibold text-lg p-6 border border-solid border-delta-200'
                        >
                            {columnName}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {ROW_NAMES.map((rowName) => (
                    <tr key={rowName} className='h-[138px]'>
                        <th
                            scope='row'
                            className='box-border p-6 font-semibold text-lg border border-solid border-delta-200 text-left'
                        >
                            {rowName}
                        </th>
                        {COLUMN_NAMES.map((columnName) => {
                            const rowConfig = CELL_CHIPS_CONFIG[rowName]
                            const cellConfig = rowConfig?.cells?.[columnName]
                            const chipsToRender = cellConfig ? cellConfig.chips : [{}]

                            const isInteractiveRow = Boolean(rowConfig?.type)

                            return (
                                <td
                                    key={`${rowName}-${columnName}`}
                                    className='box-border border border-solid border-delta-200'
                                >
                                    <div
                                        className={`flex items-center justify-center ${isInteractiveRow ? 'flex-col gap-6' : 'gap-2'}`}
                                    >
                                        {chipsToRender.map((chipVariant, index) =>
                                            isInteractiveRow ? (
                                                <StyledInteractiveChip
                                                    key={index}
                                                    dataTest={`chip-table-${rowName}-${columnName}-${index}`}
                                                    {...rowConfig}
                                                    {...COLUMN_CHIP_PROPS[columnName]}
                                                    {...chipVariant}
                                                />
                                            ) : (
                                                <StyledChip
                                                    key={index}
                                                    dataTest={`chip-table-${rowName}-${columnName}-${index}`}
                                                    {...rowConfig}
                                                    {...COLUMN_CHIP_PROPS[columnName]}
                                                    {...chipVariant}
                                                />
                                            ),
                                        )}
                                    </div>
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export const Chip = () => {
    return <ChipStateTable />
}
