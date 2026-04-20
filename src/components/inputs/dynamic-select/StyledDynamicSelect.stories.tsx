import { useMemo, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { StyledDynamicSelect } from './StyledDynamicSelect'
import { StyledSwitch } from '../switch'
import { StyledButton, StyledFormControlLabel, StyledFormLabel, StyledInputField } from 'asma-ui-core'

type Option = {
    id: string
    name: string
    disabled?: boolean
}

const createOptions = (count: number): Option[] =>
    [
        { id: '1', name: 'Active' },
        { id: '2', name: 'Paused' },
        { id: '3', name: 'Pending review' },
        { id: '4', name: 'Archived', disabled: true },
        { id: '5', name: 'Needs attention' },
        {
            id: '6',
            name: 'Very long option label that should force the chip layout to behave sensibly when space is tight',
        },
        { id: '7', name: 'Draft' },
        { id: '8', name: 'Published' },
        { id: '9', name: 'Hidden', disabled: true },
        { id: '10', name: 'Scheduled' },
        { id: '11', name: 'Deleted' },
        { id: '12', name: 'Rejected' },
    ].slice(0, count)

const longLabelOptions: Option[] = [
    { id: '1', name: 'Short label' },
    { id: '2', name: 'A much longer label to verify wrapping and truncation behavior in chips' },
    { id: '3', name: 'Disabled option', disabled: true },
    { id: '4', name: 'Another very very long option label to test overflow behavior' },
    { id: '5', name: 'Final option' },
]

const meta: Meta<typeof StyledDynamicSelect> = {
    title: 'Inputs/Styled Dynamic Select',
    component: StyledDynamicSelect,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        multiple: false,
    },
}

export default meta

type StoryArgs = {
    title?: string
    multiple?: boolean
    options?: Option[]
    size?: 'small' | 'medium'
    maxTags?: number
    readOnly?: boolean
    loading?: boolean
    disabled?: boolean
    required?: boolean
    error?: boolean
    helperText?: string
    noOptionsText?: string
}

type Story = StoryObj<StoryArgs>

function SelectFrame(props: {
    title: string
    multiple?: boolean
    options: Option[]
    size?: 'small' | 'medium'
    maxTags?: number
    readOnly?: boolean
    loading?: boolean
    disabled?: boolean
    required?: boolean
    error?: boolean
    helperText?: string
    noOptionsText?: string
}) {
    const {
        title,
        multiple = false,
        options,
        size = 'medium',
        maxTags,
        readOnly = false,
        loading = false,
        disabled = false,
        required = false,
        error = false,
        helperText: initialHelperText = 'Required',
        noOptionsText: initialNoOptionsText = 'No options',
    } = props

    const [singleValue, setSingleValue] = useState<Option | null>(null)
    const [multiValue, setMultiValue] = useState<Option[] | null>([])
    const [overrideRenderLabel, setOverrideRenderLabel] = useState(false)
    const [helperText, setHelperText] = useState(initialHelperText)
    const [noOptionsText, setNoOptionsText] = useState(initialNoOptionsText)

    const renderLabel = (option: Option) => (
        <div className='flex flex-col'>
            <span className='font-semibold'>{option.name}</span>
            <span className='text-sm opacity-70'>Description</span>
        </div>
    )

    return (
        <div className='grid min-h-screen gap-6 p-6 lg:grid-cols-[1fr_320px]'>
            <section className='rounded-2xl border border-delta-200 bg-white p-4 shadow-sm'>
                <div className='mb-4'>
                    <h2 className='text-lg font-semibold text-delta-900'>{title}</h2>
                    <p className='text-sm text-delta-600'>
                        {multiple ? 'Multiple selection' : 'Single selection'} · {options.length} options
                    </p>
                </div>

                <div className='max-w-xl'>
                    {multiple ? (
                        <StyledDynamicSelect<Option>
                            dataTest='styled-dynamic-select'
                            multiple
                            options={options}
                            value={multiValue}
                            onChange={setMultiValue}
                            valueKey='id'
                            labelKey='name'
                            title={title}
                            size={size}
                            maxTags={maxTags}
                            readOnly={readOnly}
                            loading={loading}
                            disabled={disabled}
                            required={required}
                            error={error}
                            helperText={helperText}
                            noOptionsText={noOptionsText}
                            getOptionTooltip={(option) => (option.disabled ? 'Disabled' : null)}
                            renderLabel={overrideRenderLabel ? renderLabel : undefined}
                        />
                    ) : (
                        <StyledDynamicSelect<Option>
                            dataTest='styled-dynamic-select'
                            multiple={false}
                            options={options}
                            value={singleValue}
                            onChange={setSingleValue}
                            valueKey='id'
                            labelKey='name'
                            title={title}
                            size={size}
                            maxTags={maxTags}
                            readOnly={readOnly}
                            loading={loading}
                            disabled={disabled}
                            required={required}
                            error={error}
                            helperText={helperText}
                            noOptionsText={noOptionsText}
                            getOptionTooltip={(option) => (option.disabled ? 'Disabled' : null)}
                            renderLabel={overrideRenderLabel ? renderLabel : undefined}
                        />
                    )}
                </div>
            </section>

            <aside className='rounded-2xl border border-delta-200 bg-delta-50 p-4 shadow-sm'>
                <StyledFormLabel title='Extras' className='mb-3 flex items-center' />

                <div className='flex flex-col gap-3'>
                    <StyledFormControlLabel
                        label='Override render label'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='override-render-label-switch'
                                checked={overrideRenderLabel}
                                onChange={() => setOverrideRenderLabel((value) => !value)}
                            />
                        }
                    />

                    <div className='space-y-2'>
                        <StyledFormLabel title='Helper text' />
                        <StyledInputField
                            dataTest='helper-text-input'
                            value={helperText}
                            onChange={(e) => setHelperText(e.target.value)}
                            size='small'
                        />
                    </div>

                    <div className='space-y-2'>
                        <StyledFormLabel title='No options text' />
                        <StyledInputField
                            dataTest='no-options-text-input'
                            value={noOptionsText}
                            onChange={(e) => setNoOptionsText(e.target.value)}
                            size='small'
                        />
                    </div>
                </div>
            </aside>
        </div>
    )
}

function PlaygroundFrame() {
    const [multiple, setMultiple] = useState(false)
    const [readOnly, setReadOnly] = useState(false)
    const [loading, setLoading] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [required, setRequired] = useState(false)
    const [error, setError] = useState(false)
    const [size, setSize] = useState<'small' | 'medium'>('medium')
    const [overrideRenderLabel, setOverrideRenderLabel] = useState(false)
    const [noOptionsText, setNoOptionsText] = useState('No options')
    const [helperText, setHelperText] = useState<string | undefined>('Required')
    const [maxTags, setMaxTags] = useState<number | undefined>(undefined)
    const [empty, setEmpty] = useState(false)
    const [optionsVersion, setOptionsVersion] = useState(0)
    const [singleValue, setSingleValue] = useState<Option | null>(null)
    const [multiValue, setMultiValue] = useState<Option[] | null>([])
    const selectRef = useRef<HTMLInputElement>(null)

    const options = useMemo(
        () => createOptions(10).map((option) => ({ ...option, id: `${option.id}-${optionsVersion}` })),
        [optionsVersion],
    )

    const renderLabel = (option: Option) => (
        <div className='flex flex-col'>
            <span className='font-semibold'>{option.name}</span>
            <span className='text-sm opacity-70'>Description</span>
        </div>
    )

    return (
        <div className='grid min-h-screen gap-6 p-6 lg:grid-cols-[1fr_320px]'>
            <section className='rounded-2xl border border-delta-200 bg-white p-4 shadow-sm'>
                <div className='mb-4 flex items-center justify-between gap-4'>
                    <div>
                        <h2 className='text-lg font-semibold text-delta-900'>Playground</h2>
                        <p className='text-sm text-delta-600'>
                            {multiple ? 'Multiple selection' : 'Single selection'} · {empty ? 0 : options.length}{' '}
                            options
                        </p>
                    </div>
                    <StyledButton
                        dataTest='focus-select-btn'
                        variant='outlined'
                        size='small'
                        onClick={() => selectRef.current?.focus()}
                    >
                        Focus select
                    </StyledButton>
                </div>

                <div className='max-w-xl'>
                    {multiple ? (
                        <StyledDynamicSelect<Option>
                            ref={selectRef}
                            dataTest='playground-select'
                            multiple
                            options={empty ? [] : options}
                            value={multiValue}
                            onChange={setMultiValue}
                            valueKey='id'
                            labelKey='name'
                            title='Status'
                            size={size}
                            maxTags={maxTags}
                            readOnly={readOnly}
                            loading={loading}
                            disabled={disabled}
                            required={required}
                            error={error}
                            helperText={helperText}
                            noOptionsText={noOptionsText}
                            getOptionTooltip={(option) => (option.disabled ? 'Disabled' : null)}
                            renderLabel={overrideRenderLabel ? renderLabel : undefined}
                        />
                    ) : (
                        <StyledDynamicSelect<Option>
                            ref={selectRef}
                            dataTest='playground-select'
                            multiple={false}
                            options={empty ? [] : options}
                            value={singleValue}
                            onChange={setSingleValue}
                            valueKey='id'
                            labelKey='name'
                            title='Status'
                            size={size}
                            maxTags={maxTags}
                            readOnly={readOnly}
                            loading={loading}
                            disabled={disabled}
                            required={required}
                            error={error}
                            helperText={helperText}
                            noOptionsText={noOptionsText}
                            getOptionTooltip={(option) => (option.disabled ? 'Disabled' : null)}
                            renderLabel={overrideRenderLabel ? renderLabel : undefined}
                        />
                    )}
                </div>
            </section>

            <aside className='rounded-2xl border border-delta-200 bg-delta-50 p-4 shadow-sm'>
                <StyledFormLabel title='Controls' className='mb-3 flex items-center' />

                <div className='flex flex-col gap-3'>
                    <StyledFormControlLabel
                        label='Multiple'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='multiple-switch'
                                checked={multiple}
                                onChange={() => setMultiple((value) => !value)}
                            />
                        }
                    />
                    <StyledFormControlLabel
                        label='Read only'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='readonly-switch'
                                checked={readOnly}
                                onChange={() => setReadOnly((value) => !value)}
                            />
                        }
                    />
                    <StyledFormControlLabel
                        label='Loading'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='loading-switch'
                                checked={loading}
                                onChange={() => setLoading((value) => !value)}
                            />
                        }
                    />
                    <StyledFormControlLabel
                        label='Disabled'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='disabled-switch'
                                checked={disabled}
                                onChange={() => setDisabled((value) => !value)}
                            />
                        }
                    />
                    <StyledFormControlLabel
                        label='Required'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='required-switch'
                                checked={required}
                                onChange={() => setRequired((value) => !value)}
                            />
                        }
                    />
                    <StyledFormControlLabel
                        label='Error'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='error-switch'
                                checked={error}
                                onChange={() => setError((value) => !value)}
                            />
                        }
                    />
                    <StyledFormControlLabel
                        label='Empty options'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='empty-switch'
                                checked={empty}
                                onChange={() => setEmpty((value) => !value)}
                            />
                        }
                    />
                    <StyledFormControlLabel
                        label='Override render label'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='override-render-label-switch'
                                checked={overrideRenderLabel}
                                onChange={() => setOverrideRenderLabel((value) => !value)}
                            />
                        }
                    />

                    <div className='space-y-2'>
                        <StyledFormLabel title='Size' />
                        <div className='flex flex-wrap gap-2'>
                            <StyledButton
                                dataTest='small-btn'
                                variant={size === 'small' ? 'contained' : 'outlined'}
                                size='small'
                                onClick={() => setSize('small')}
                            >
                                Small
                            </StyledButton>
                            <StyledButton
                                dataTest='medium-btn'
                                variant={size === 'medium' ? 'contained' : 'outlined'}
                                size='small'
                                onClick={() => setSize('medium')}
                            >
                                Medium
                            </StyledButton>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <StyledFormLabel title='Helper text' />
                        <StyledInputField
                            dataTest='helper-text-input'
                            value={helperText ?? ''}
                            onChange={(e) => setHelperText(e.target.value)}
                            size='small'
                        />
                        <StyledFormControlLabel
                            label='Show helper text'
                            className='w-fit'
                            control={
                                <StyledSwitch
                                    dataTest='helper-text-toggle'
                                    checked={helperText !== undefined}
                                    onChange={() =>
                                        setHelperText((value) => (value === undefined ? 'Required' : undefined))
                                    }
                                />
                            }
                        />
                    </div>

                    <div className='space-y-2'>
                        <StyledFormLabel title='No options text' />
                        <StyledInputField
                            dataTest='no-options-text-input'
                            value={noOptionsText}
                            onChange={(e) => setNoOptionsText(e.target.value)}
                            size='small'
                        />
                    </div>

                    <div className='space-y-2'>
                        <StyledFormLabel title='Max tags' />
                        <StyledInputField
                            dataTest='max-tags-input'
                            type='number'
                            value={maxTags ?? ''}
                            onChange={(e) => setMaxTags(e.target.value === '' ? undefined : Number(e.target.value))}
                            size='small'
                        />
                    </div>

                    <StyledButton
                        dataTest='regenerate-options-btn'
                        variant='text'
                        size='small'
                        onClick={() => setOptionsVersion((v) => v + 1)}
                    >
                        Regenerate options
                    </StyledButton>

                    {multiple ? (
                        <StyledButton
                            dataTest='clear-multi-value-btn'
                            variant='text'
                            size='small'
                            onClick={() => setMultiValue([])}
                        >
                            Clear multi value
                        </StyledButton>
                    ) : (
                        <StyledButton
                            dataTest='clear-single-value-btn'
                            variant='text'
                            size='small'
                            onClick={() => setSingleValue(null)}
                        >
                            Clear single value
                        </StyledButton>
                    )}
                </div>
            </aside>
        </div>
    )
}

const getAutocomplete = (canvasElement: HTMLElement) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const input = canvas.getByRole('combobox')

    return { canvas, input }
}

export const SingleSelectChipGroup: Story = {
    render: () => <SelectFrame title='Status' options={createOptions(5)} />,
    play: async ({ canvas }) => {
        const chip = canvas.getByRole('button', { name: 'Paused' })

        await userEvent.click(chip)

        const radio = canvas.getByRole('radio', { name: 'Paused' })
        await expect(radio).toBeChecked()
    },
}

export const MultipleSelectChipGroup: Story = {
    render: () => <SelectFrame title='Assignees' multiple options={createOptions(5)} />,
    play: async ({ canvas }) => {
        const activeChip = canvas.getByRole('button', { name: 'Active' })
        const pausedChip = canvas.getByRole('button', { name: 'Paused' })

        await userEvent.click(activeChip)
        await userEvent.click(pausedChip)

        const activeCheckbox = canvas.getByRole('checkbox', { name: 'Active' })
        const pausedCheckbox = canvas.getByRole('checkbox', { name: 'Paused' })

        await expect(activeCheckbox).toBeChecked()
        await expect(pausedCheckbox).toBeChecked()
    },
}

export const SingleSelectAutocomplete: Story = {
    render: () => <SelectFrame title='Status' options={createOptions(12)} />,
    play: async ({ canvasElement }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await userEvent.click(input)
        await userEvent.type(input, 'Published')

        const option = await canvas.findByRole('option', { name: 'Published' })
        await userEvent.click(option)

        await expect(input).toHaveValue('Published')
    },
}

export const MultipleSelectAutocomplete: Story = {
    render: () => <SelectFrame title='Assignees' multiple options={createOptions(12)} maxTags={3} />,
    play: async ({ canvasElement }) => {
        const { canvas, input } = getAutocomplete(canvasElement)

        await userEvent.click(input)
        await userEvent.type(input, 'Active')
        await userEvent.click(await canvas.findByRole('option', { name: 'Active' }))

        await userEvent.click(input)
        await userEvent.clear(input)
        await userEvent.type(input, 'Paused')
        await userEvent.click(await canvas.findByRole('option', { name: 'Paused' }))

        await expect(canvas.getByRole('button', { name: 'Active' })).toBeInTheDocument()
        await expect(canvas.getByRole('button', { name: 'Paused' })).toBeInTheDocument()
    },
}

export const LongLabelsAndDisabledOptions: Story = {
    render: () => <SelectFrame title='Plans' options={longLabelOptions} />,
}

export const FocusDemo: Story = {
    render: () => {
        const ref = useRef<HTMLInputElement>(null)
        const [value, setValue] = useState<Option | null>(null)
        const options = useMemo(() => createOptions(8), [])

        return (
            <div className='p-6'>
                <div className='mb-4'>
                    <StyledButton
                        dataTest='focus-select-btn'
                        variant='outlined'
                        size='small'
                        onClick={() => ref.current?.focus()}
                    >
                        Focus select
                    </StyledButton>
                </div>
                <div className='max-w-xl'>
                    <StyledDynamicSelect<Option>
                        ref={ref}
                        dataTest='focus-demo'
                        title='Focus demo'
                        options={options}
                        value={value}
                        onChange={setValue}
                        multiple={false}
                        valueKey='id'
                        labelKey='name'
                    />
                </div>
            </div>
        )
    },
    play: async ({ canvas }) => {
        // const canvas = within(canvasElement)
        await userEvent.click(canvas.getByTestId('focus-select-btn'))
        await expect(canvas.getByRole('combobox')).toHaveFocus()
    },
}

export const Playground: Story = {
    render: () => <PlaygroundFrame />,
}
