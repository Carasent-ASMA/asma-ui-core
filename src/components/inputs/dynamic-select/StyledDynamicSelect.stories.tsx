import { useRef, useState } from 'react'
import type { Meta } from '@storybook/react'
import { StyledDynamicSelect } from './StyledDynamicSelect'
import { StyledSwitch } from '../switch'
import { StyledButton, StyledFormControlLabel, StyledFormLabel, StyledInputField, StyledInteractiveChip } from 'src'

const meta: Meta = {
    title: 'Inputs/Styled Dynamic Select',
    component: StyledDynamicSelect,
} satisfies Meta<typeof StyledDynamicSelect>

export default meta

type Option = { id: string; name: string; disabled: boolean }

const randomLabel = (index: number) => {
    const base = `Option ${index + 1}`

    const variants = [
        base,
        `${base} with medium length label`,
        base,
        `${base} – extremely long label designed to test horizontal overflow behavior in chip components and extremely long label designed to test horizontal overflow behavior in chip components`,
        base,
    ]

    return variants[Math.floor(Math.random() * variants.length)] || 'random label'
}

const generateOptions = (count: number): Option[] =>
    Array.from({ length: count }, (_, i) => ({
        id: `${i + 1}`,
        name: randomLabel(i),
        disabled: Math.random() < 0.5,
    }))

type IVariant = {
    multiple: boolean
    count: number
}
export const InteractiveSelectStory: React.FC = () => {
    const [readOnly, setReadOnly] = useState(false)
    const [loading, setLoading] = useState(false)
    const [empty, setEmpty] = useState(false)
    const [disabled, setDisabled] = useState(false)
    const [options, setOptions] = useState(generateOptions(30))
    const [error, setError] = useState(false)
    const [helperText, setHelperText] = useState<string | undefined>('Required')
    const [size, setSize] = useState<'small' | 'medium'>('medium')
    const [overrideRenderLabel, setOverrideRenderLabel] = useState(false)
    const [noOptionsText, setNoOptionsText] = useState('No options')
    const [required, setRequired] = useState(false)
    const [maxTags, setMaxTags] = useState<number | undefined>()

    const selectRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const setSelectRef = (key: string) => (ref: HTMLInputElement | null) => {
        selectRefs.current[key] = ref
    }

    const renderLabel = (option: Option): React.ReactNode => (
        <div className='flex flex-col'>
            <div className='flex items-center gap-x-1 text-sm'>
                <span className='text-delta-800 font-semibold'>{option.name}</span>
                <span className='text-delta-500'>Description</span>
            </div>
            <div className='flex items-center gap-x-1 text-sm'>
                <span className='text-delta-800 font-semibold'>{option.name}</span>
                <span className='text-delta-500'>Description</span>
            </div>
            <div className='flex items-center gap-x-1 text-sm'>
                <span className='text-delta-800 font-semibold'>{option.name}</span>
                <span className='text-delta-500'>Description</span>
            </div>
        </div>
    )

    const [singleValue, setSingleValue] = useState<Option | null>(null)
    const [multiValue, setMultiValue] = useState<Option[] | null>([])

    const variants: IVariant[] = [
        { multiple: false, count: 5 },
        { multiple: false, count: 10 },
        { multiple: false, count: 20 },
        { multiple: true, count: 5 },
        { multiple: true, count: 10 },
        { multiple: true, count: 20 },
    ]

    return (
        <div className='p-4 flex gap-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 divide divide-x divide-y divide-black w-full'>
                {variants.map(({ multiple, count }) => {
                    const key = `${multiple}-${count}`
                    const title = `${multiple ? 'Multiple' : 'Single'} Select (${count} options)`
                    const _options = options.slice(0, count)

                    return (
                        <div key={key} className='p-4'>
                            {multiple ? (
                                <StyledDynamicSelect
                                    ref={setSelectRef(key)}
                                    dataTest={key}
                                    noOptionsText={noOptionsText}
                                    multiple={true}
                                    options={!empty ? _options : []}
                                    value={multiValue}
                                    onChange={setMultiValue}
                                    readOnly={readOnly}
                                    loading={loading}
                                    title={title}
                                    size={size}
                                    disabled={disabled}
                                    error={error}
                                    required={required}
                                    helperText={helperText}
                                    valueKey='id'
                                    labelKey='name'
                                    getOptionTooltip={(o) => (o.disabled ? 'Disabled' : null)}
                                    renderLabel={overrideRenderLabel ? renderLabel : undefined}
                                    maxTags={maxTags}
                                />
                            ) : (
                                <StyledDynamicSelect
                                    ref={setSelectRef(key)}
                                    disableHelperText={false}
                                    dataTest={key}
                                    multiple={false}
                                    options={!empty ? _options : []}
                                    value={singleValue}
                                    size={size}
                                    onChange={setSingleValue}
                                    readOnly={readOnly}
                                    noOptionsText={noOptionsText}
                                    loading={loading}
                                    title={title}
                                    disabled={disabled}
                                    required={required}
                                    error={error}
                                    helperText={helperText}
                                    valueKey='id'
                                    labelKey='name'
                                    getOptionTooltip={(o) => (o.disabled ? 'Disabled' : null)}
                                    renderLabel={overrideRenderLabel ? renderLabel : undefined}
                                    maxTags={maxTags}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
            <div className='bg-delta-50 shadow flex flex-col min-w-[300px] max-w-[300px] p-4'>
                <StyledFormLabel title='Controls' className='flex items-center w-full' />
                <div className='flex flex-col gap-y-2'>
                    <StyledButton
                        dataTest='regenerate-options'
                        onClick={() => {
                            setOptions(generateOptions(30))
                            setSingleValue(null)
                            setMultiValue([])
                        }}
                        className='w-fit'
                        variant='text'
                    >
                        Regenerate options
                    </StyledButton>

                    <StyledFormControlLabel
                        label='Toggle readOnly'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='readonly-switch'
                                checked={readOnly}
                                onChange={() => setReadOnly(!readOnly)}
                            />
                        }
                    />

                    <div>
                        <StyledFormLabel title='No options text' />
                        <StyledInputField
                            dataTest='no-options-text-input'
                            value={noOptionsText}
                            onChange={(e) => setNoOptionsText(e.target.value)}
                            size='small'
                        />
                        <StyledFormControlLabel
                            label='Toggle empty'
                            className='w-fit'
                            control={
                                <StyledSwitch
                                    dataTest='empty-switch'
                                    checked={empty}
                                    onChange={() => setEmpty(!empty)}
                                />
                            }
                        />
                    </div>

                    <StyledFormControlLabel
                        label='Toggle loading'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='loading-switch'
                                checked={loading}
                                onChange={() => setLoading(!loading)}
                            />
                        }
                    />

                    <StyledFormControlLabel
                        label='Toggle disabled'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='disabled-switch'
                                checked={disabled}
                                onChange={() => setDisabled(!disabled)}
                            />
                        }
                    />

                    <StyledFormControlLabel
                        label='Toggle required'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='required-switch'
                                checked={required}
                                onChange={() => setRequired(!required)}
                            />
                        }
                    />

                    <div className='flex gap-2'>
                        <StyledFormControlLabel
                            label='Toggle max tags'
                            className='w-fit'
                            control={
                                <StyledSwitch
                                    dataTest='max-tags-switch'
                                    checked={maxTags !== undefined}
                                    onChange={() => setMaxTags((maxTags) => (maxTags !== undefined ? undefined : 5))}
                                />
                            }
                        />
                        <StyledInputField
                            dataTest='max-tags-input'
                            value={maxTags}
                            onChange={(e) => {
                                setMaxTags(+e.target.value)
                            }}
                            type='number'
                            size='small'
                        />
                    </div>

                    <StyledFormControlLabel
                        label='Toggle override render label'
                        className='w-fit'
                        control={
                            <StyledSwitch
                                dataTest='override-render-label-switch'
                                checked={overrideRenderLabel}
                                onChange={() => setOverrideRenderLabel(!overrideRenderLabel)}
                            />
                        }
                    />

                    <div>
                        <StyledFormLabel title='Helper text' />
                        <div>
                            <StyledInputField
                                dataTest='helper-text-input'
                                value={helperText}
                                onChange={(e) => {
                                    setHelperText(e.target.value)
                                }}
                                size='small'
                            />
                            <StyledFormControlLabel
                                label='Toggle helper text'
                                className='w-fit'
                                control={
                                    <StyledSwitch
                                        dataTest='disabled-switch'
                                        checked={helperText !== undefined}
                                        onChange={() =>
                                            setHelperText(() => (helperText === undefined ? '' : undefined))
                                        }
                                    />
                                }
                            />
                        </div>
                        <StyledFormControlLabel
                            label='Toggle error'
                            className='w-fit'
                            control={
                                <StyledSwitch
                                    dataTest='error-switch'
                                    checked={error}
                                    onChange={() => setError(!error)}
                                />
                            }
                        />
                    </div>

                    <div className='flex flex-col'>
                        <StyledFormLabel title='Focus' />
                        <div className='flex flex-col gap-y-2'>
                            {variants.map(({ multiple, count }) => {
                                const key = `${multiple}-${count}`

                                return (
                                    <StyledButton
                                        dataTest={key}
                                        key={key}
                                        size='small'
                                        variant='outlined'
                                        onClick={() => {
                                            selectRefs.current[key]?.focus()
                                        }}
                                    >
                                        Focus {multiple ? 'Multiple' : 'Single'} ({count})
                                    </StyledButton>
                                )
                            })}
                        </div>
                    </div>

                    <div className='flex flex-col'>
                        <StyledFormLabel title='Size' />
                        <div className='flex flex-wrap gap-2'>
                            <StyledInteractiveChip
                                type='radio'
                                dataTest='small-radio'
                                onClick={() => setSize('small')}
                                checked={size === 'small'}
                                label='Small'
                            />
                            <StyledInteractiveChip
                                type='radio'
                                dataTest='medium-radio'
                                onClick={() => setSize('medium')}
                                checked={size === 'medium'}
                                label='Medium'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
