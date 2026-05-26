import {
    CloudDoneOutlineIcon,
    CloudOffOutlineIcon,
    LoadingIcon,
    RefreshIcon,
    SaveIcon,
    VisibilityOutlineIcon,
    WarningAmberOutlineIcon,
} from 'src/components/icons'

import { StyledButton } from '../../inputs/button'
import { StyledLabel } from './StyledLabel'

const HIGHLIGHTING_TABLE_COLUMNS = ['Highlighting labels', 'English', 'Norwegian'] as const

const ALERT_LABEL_BACKGROUND_BY_COLOR: Record<string, string> = {
    blue: 'var(--colors-info-300)',
    green: 'var(--colors-success-300)',
    yellow: 'var(--colors-warning-300)',
    orange: '#FFDAA3',
    red: 'var(--colors-red-300)',
}

const HIGHLIGHTING_TABLE_ROWS = [
    {
        title: 'Healthcare / Ad Curis',
        english: '',
        norwegian: '',
    },
    {
        title: 'Blue Alerts',
        description:
            'Definition: Informational notices that do not require immediate action but provide useful information.\nUse Cases: Reminders, general information updates.\nCaption: Blå Blue',
        english: 'blue',
        norwegian: 'blå',
    },
    {
        title: 'Green Alerts',
        description:
            'Definition: Safe status, generally used for informational notices.\nUse Cases: Routine updates or confirmations of no immediate action required.',
        english: 'green',
        norwegian: 'grønn',
    },
    {
        title: 'Yellow Alerts',
        description:
            'Definition: Caution and the need to prepare for potential action.\nUse Cases: Elevated blood pressure, moderate allergic reactions.',
        english: 'yellow',
        norwegian: 'gul',
    },
    {
        title: 'Orange Alerts',
        description:
            'Definition: Significant warnings that are not immediately life-threatening.\nUse Cases: High risk of falls, non-critical but important medical conditions.',
        english: 'orange',
        norwegian: 'oransje',
    },
    {
        title: 'Red Alerts',
        description:
            'Definition: Immediate danger requiring urgent action.\nUse Cases: Critical drug interactions, life-threatening conditions (e.g., cardiac arrest).',
        english: 'red',
        norwegian: 'rød',
    },
]

export default {
    title: 'DataDisplay/Label',
    component: StyledLabel,
}

const HighlightingLabelsTable = (): JSX.Element => {
    return (
        <table className='w-full table-fixed border-collapse text-delta-700'>
            <colgroup>
                <col className='w-[400px]' />
                <col className='w-[230px]' />
                <col className='w-[230px]' />
            </colgroup>
            <thead>
                <tr className='bg-delta-10'>
                    {HIGHLIGHTING_TABLE_COLUMNS.map((column, index) => (
                        <th
                            key={column}
                            className={`border border-solid border-delta-200 p-4 pl-6 text-left font-semibold ${
                                index === 0 ? 'text-2xl' : 'text-center text-base'
                            }`}
                        >
                            {column}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {HIGHLIGHTING_TABLE_ROWS.map((row, index) => {
                    const alertColor = ALERT_LABEL_BACKGROUND_BY_COLOR[row.english]

                    return (
                        <tr key={row.title}>
                            <td
                                className={`border border-solid border-delta-200 p-4 pl-6 align-top ${
                                    index === 0 ? 'text-lg font-semibold' : 'text-sm'
                                }`}
                            >
                                {index === 0 ? (
                                    row.title
                                ) : (
                                    <div className=''>
                                        <p className='m-0 font-semibold'>{row.title}</p>
                                        <p className='m-0 whitespace-pre-line'>{row.description}</p>
                                    </div>
                                )}
                            </td>
                            <td className='border border-solid border-delta-200 p-4 pl-6'>
                                {row.english ? (
                                    <div className='flex items-center justify-center'>
                                        <StyledLabel
                                            dataTest={`label-english-${row.english}`}
                                            className='uppercase text-black'
                                            style={{ background: alertColor }}
                                        >
                                            {row.english}
                                        </StyledLabel>
                                    </div>
                                ) : null}
                            </td>
                            <td className='border border-solid border-delta-200 p-4 pl-6'>
                                {row.norwegian ? (
                                    <div className='flex items-center justify-center'>
                                        <StyledLabel
                                            dataTest={`label-norwegian-${row.english}`}
                                            className='uppercase text-black'
                                            style={{ background: alertColor }}
                                        >
                                            {row.norwegian}
                                        </StyledLabel>
                                    </div>
                                ) : null}
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

const ALL_GENERAL_LABELS = [
    { text: 'admin', className: 'text-gama-700 bg-gama-50 border border-solid border-gama-100' },
    { text: 'NEW', className: 'text-gama-700 bg-gama-50 border border-solid border-gama-100' },
    { text: 'parent', className: 'text-gama-700 bg-gama-50 border border-solid border-gama-100' },
    { text: 'Linked', className: 'text-gama-700 bg-gama-50 border border-solid border-gama-100' },
    { text: 'archived', className: 'text-delta-800 bg-delta-100 border border-solid border-delta-200' },
    { text: 'multiple', className: 'text-delta-800 bg-delta-100 border border-solid border-delta-200' },
    { text: 'ongoing', className: 'text-white bg-error-500' },
    { text: 'Obligatorisk', className: 'text-black bg-warning-300' },
    { text: 'active', className: 'text-white bg-error-500' },
    { text: 'draft', className: 'text-gama-600 bg-gama-25 border border-solid border-gama-200' },
    { text: 'scheduled', className: 'text-white bg-gama-600' },
    { text: 'sent', className: 'text-delta-800 bg-delta-50 bg-gray-300' },
    { text: 'template', className: 'bg-warning-300 border border-solid border-warning-500' },
] as const

const AllGeneralLabelsBlock = (): JSX.Element => {
    return (
        <div className='inline-flex flex-col gap-4 rounded border border-dashed border-[#9747FF] p-4'>
            {ALL_GENERAL_LABELS.map((row) => (
                <StyledLabel
                    key={row.text}
                    dataTest={`label-general-${row.text.toLowerCase()}`}
                    className={row.className}
                >
                    {row.text}
                </StyledLabel>
            ))}
        </div>
    )
}

const LEGEND_ITEMS = [
    { color: 'bg-info-500', text: 'Blue' },
    { color: 'bg-success-500', text: 'Green' },
    { color: 'bg-warning-500', text: 'Orange' },
    { color: 'bg-error-500', text: 'Red' },
]

const LegendBlock = (): JSX.Element => (
    <div className='inline-flex flex-col gap-2 rounded border border-dashed border-[#9747FF] p-4'>
        {LEGEND_ITEMS.map((item) => (
            <div key={item.text} className='flex items-center gap-2'>
                <div className={`h-3 w-3 rounded-[2px] ${item.color}`} />
                <span className='text-sm text-delta-700'>{item.text}</span>
            </div>
        ))}
    </div>
)

const HighlightingLabelsBlock = (): JSX.Element => {
    return (
        <div className='inline-flex flex-col gap-4 rounded border border-dashed border-[#9747FF] p-4'>
            {HIGHLIGHTING_TABLE_ROWS.filter((row) => row.english).map((row) => {
                const alertColor = ALERT_LABEL_BACKGROUND_BY_COLOR[row.english]

                return (
                    <div key={row.english} className='flex items-center gap-2'>
                        <StyledLabel
                            dataTest={`label-english-${row.english}`}
                            className='uppercase text-black'
                            style={{ background: alertColor }}
                        >
                            {row.english}
                        </StyledLabel>
                        <StyledLabel
                            dataTest={`label-norwegian-${row.english}`}
                            className='uppercase text-black'
                            style={{ background: alertColor }}
                        >
                            {row.norwegian}
                        </StyledLabel>
                    </div>
                )
            })}
        </div>
    )
}

const GroupLabelsBlock = (): JSX.Element => {
    return (
        <div className='inline-flex flex-col gap-4 rounded border border-dashed border-[#9747FF] p-4'>
            <StyledLabel
                dataTest='label-reference-group'
                className='text-white'
                style={{ background: 'var(--colors-delta-700)' }}
            >
                Group
            </StyledLabel>
            <StyledLabel dataTest='label-reference-network' className='text-white' style={{ background: '#9067A6' }}>
                network
            </StyledLabel>
            <StyledLabel
                dataTest='label-reference-org'
                className='text-delta-800'
                style={{ background: 'var(--colors-info-300)' }}
            >
                org
            </StyledLabel>
            <StyledLabel dataTest='label-reference-nav' className='text-white' style={{ background: '#C30000' }}>
                NAV
            </StyledLabel>
        </div>
    )
}

const STATUS_LABELS = [
    { norwegian: 'bra', english: 'good', background: 'var(--colors-success-300)' },
    { norwegian: 'ta hensyn til', english: 'attention', background: 'var(--colors-warning-300)' },
    { norwegian: 'alvorlig', english: 'warning', background: '#FFDAA3' },
    { norwegian: 'haster', english: 'urgent', background: 'var(--colors-red-300)' },
] as const

const StatusLabelsBlock = (): JSX.Element => {
    return (
        <div className='inline-flex flex-col gap-4 rounded border border-dashed border-[#9747FF] p-4'>
            {STATUS_LABELS.map((row) => (
                <div key={row.english} className='flex items-center gap-2'>
                    <StyledLabel
                        dataTest={`label-status-norwegian-${row.english}`}
                        className='text-black'
                        style={{ background: row.background }}
                    >
                        {row.norwegian}
                    </StyledLabel>
                    <StyledLabel
                        dataTest={`label-status-english-${row.english}`}
                        className='text-black'
                        style={{ background: row.background }}
                    >
                        {row.english}
                    </StyledLabel>
                </div>
            ))}
        </div>
    )
}

type SaveStateLanguage = 'english' | 'norwegian'

interface SaveStateRow {
    id: SaveStateLanguage
    notSaved: {
        title: string
        time: string
        retryLabel: string
    }
    unsavedChanges: {
        title: string
        saveLabel: string
    }
    saving: {
        title: string
    }
    savedInDrafts: {
        title: string
        time: string
    }
    previewOnly: {
        title: string
    }
}

const SAVE_STATE_ROWS: SaveStateRow[] = [
    {
        id: 'english',
        notSaved: {
            title: 'Not saved',
            time: 'at 15:33:27',
            retryLabel: 'Retry',
        },
        unsavedChanges: {
            title: 'Unsaved changes',
            saveLabel: 'Save',
        },
        saving: {
            title: 'Saving...',
        },
        savedInDrafts: {
            title: 'Saved in drafts',
            time: 'at 15:34:01',
        },
        previewOnly: {
            title: 'Preview only',
        },
    },
    {
        id: 'norwegian',
        notSaved: {
            title: 'Ikke lagret',
            time: 'kl. 15:33:27',
            retryLabel: 'Prøv igjen',
        },
        unsavedChanges: {
            title: 'Ulagrede endringer',
            saveLabel: 'Lagre',
        },
        saving: {
            title: 'Lagrer...',
        },
        savedInDrafts: {
            title: 'Lagret i kladd',
            time: 'kl. 15:34:01',
        },
        previewOnly: {
            title: 'Forhåndsvisning',
        },
    },
]

type NotSavedItemProps = SaveStateRow['notSaved']

const NotSavedItem = ({ title, time, retryLabel }: NotSavedItemProps): JSX.Element => {
    return (
        <div className='flex items-center gap-2 text-delta-700'>
            <CloudOffOutlineIcon width={20} height={20} />
            <div className='flex flex-col'>
                <span className='text-sm whitespace-nowrap'>{title}</span>
                <span className='text-xs text-delta-500'>{time}</span>
            </div>

            <StyledButton
                size='small'
                variant='text'
                dataTest={`label-not-saved-retry-${title}`}
                startIcon={<RefreshIcon width={20} height={20} />}
            >
                {retryLabel}
            </StyledButton>
        </div>
    )
}

type UnsavedChangesItemProps = SaveStateRow['unsavedChanges']

const UnsavedChangesItem = ({ title, saveLabel }: UnsavedChangesItemProps): JSX.Element => {
    return (
        <div className='flex items-center gap-2 text-delta-700'>
            <WarningAmberOutlineIcon width={20} height={20} className='text-warning-700' />

            <span className='text-sm whitespace-nowrap'>{title}</span>

            <StyledButton
                size='small'
                variant='text'
                dataTest={`label-unsaved-changes-save-${title}`}
                startIcon={<SaveIcon width={20} height={20} />}
            >
                {saveLabel}
            </StyledButton>
        </div>
    )
}

type SavingItemProps = SaveStateRow['saving']

const SavingItem = ({ title }: SavingItemProps): JSX.Element => {
    return (
        <div className='flex items-center gap-2'>
            <LoadingIcon width={20} height={20} className='text-delta-800' />
            <span className='text-sm text-delta-500'>
                {title}
            </span>
        </div>
    )
}

type SavedInDraftsItemProps = SaveStateRow['savedInDrafts']

const SavedInDraftsItem = ({ title, time }: SavedInDraftsItemProps): JSX.Element => {
    return (
        <div className='flex items-center gap-2 text-success-700'>
            <CloudDoneOutlineIcon width={20} height={20} />
            <div className='flex flex-col'>
                <span className='whitespace-nowrap text-sm'>{title}</span>
                <span className='text-xs text-delta-500'>
                    {time}
                </span>
            </div>
        </div>
    )
}

type PreviewOnlyItemProps = SaveStateRow['previewOnly']

const PreviewOnlyItem = ({ title }: PreviewOnlyItemProps): JSX.Element => {
    return (
        <div className='flex items-center gap-2 text-delta-700'>
            <VisibilityOutlineIcon width={20} height={20} />
            <span className='text-sm'>
                {title}
            </span>
        </div>
    )
}

const SaveStateLabelBlock = (): JSX.Element => {
    return (
        <div className='inline-flex flex-col gap-4 rounded border border-dashed border-[#9747FF] p-4 w-fit'>
            {SAVE_STATE_ROWS.map((row) => {
                return (
                    <div key={row.id} className='flex items-center gap-10'>
                        <NotSavedItem {...row.notSaved} />
                        <UnsavedChangesItem {...row.unsavedChanges} />
                        <SavingItem {...row.saving} />
                        <SavedInDraftsItem {...row.savedInDrafts} />
                        <PreviewOnlyItem {...row.previewOnly} />
                    </div>
                )
            })}
        </div>
    )
}

export const Label = (): JSX.Element => (
    <div className='flex flex-col gap-8'>
        <HighlightingLabelsTable />

        <div className='flex items-start gap-10'>
            <AllGeneralLabelsBlock />
            <LegendBlock />
            <HighlightingLabelsBlock />
            <GroupLabelsBlock />
            <StatusLabelsBlock />
        </div>

        <SaveStateLabelBlock />
    </div>
)
