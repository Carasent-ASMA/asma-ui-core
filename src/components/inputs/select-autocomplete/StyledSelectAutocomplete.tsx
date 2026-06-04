import { Autocomplete, Paper, type AutocompleteProps, type ChipTypeMap, type SxProps, type Theme } from '@mui/material'
import clsx from 'clsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { StyledCheckbox } from 'src'
import { StyledChip } from '../../data-display/chip'
import { cn } from 'src/helpers/cn'
import { CloseIcon, CheckIcon, ChevronDownIcon, PlusIconCircle } from 'src/components/icons'
import style from './StyledSelectAutocomplete.module.scss'

type StyledSelectAutocompleteMultipleValue<
    T,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined,
    ChipComponent extends React.ElementType,
> = NonNullable<AutocompleteProps<T, true, DisableClearable, FreeSolo, ChipComponent>['value']>

type StyledSelectAutocompleteBaseProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined,
    ChipComponent extends React.ElementType,
> = Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>, 'multiple'> & {
    dataTest: string
    autoHeight?: boolean
    getOptionLabel?: (option: T) => string
    wrapperClassName?: string
}

type StyledSelectAutocompleteConditionalProps<Multiple extends boolean | undefined> = Multiple extends true
    ? {
          multiple: true
          allowSelectAll?: boolean
          selectAllLabel?: string
      }
    : {
          multiple?: Multiple
          allowSelectAll?: never
          selectAllLabel?: never
      }

export type StyledSelectAutocompleteProps<
    T,
    // Multiple extends boolean | undefined = false,
    Multiple extends boolean | undefined,
    // DisableClearable extends boolean | undefined = false,
    DisableClearable extends boolean | undefined,
    // FreeSolo extends boolean | undefined = false,
    FreeSolo extends boolean | undefined,
    ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> = StyledSelectAutocompleteBaseProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent> &
    StyledSelectAutocompleteConditionalProps<Multiple>

/**
 *
 * @inputRef
 * inputRef to get Node of Input Element inside
 *
 */
export function StyledSelectAutocomplete<
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
    ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
>({
    dataTest,
    autoHeight,
    getOptionLabel,
    wrapperClassName,
    multiple,
    allowSelectAll,
    selectAllLabel,
    className,
    defaultValue,
    isOptionEqualToValue,
    onChange,
    options,
    popupIcon,
    readOnly,
    renderOption,
    renderValue,
    sx,
    value,
    ...props
}: StyledSelectAutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>): JSX.Element {
    const { slots: userSlots, slotProps: userSlotProps, ...remainingProps } = props
    const [maxHeight, setMaxHeight] = useState<number | 'auto'>('auto')
    const selectRef = useRef<HTMLDivElement>(null)
    const shouldShowSelectAll = multiple === true && allowSelectAll === true && !readOnly
    const isControlled = value !== undefined

    type AutocompleteOnChange = NonNullable<
        StyledSelectAutocompleteBaseProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>['onChange']
    >
    type AutocompleteOnChangeParameters = Parameters<AutocompleteOnChange>
    type MultipleValue = StyledSelectAutocompleteMultipleValue<T, DisableClearable, FreeSolo, ChipComponent>
    type AutocompleteRenderValue = NonNullable<
        StyledSelectAutocompleteBaseProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>['renderValue']
    >

    const getMultipleValue = (candidate: unknown): MultipleValue => {
        return (Array.isArray(candidate) ? candidate : []) as MultipleValue
    }

    const [uncontrolledValue, setUncontrolledValue] = useState<MultipleValue>(() => getMultipleValue(defaultValue))

    useLayoutEffect(() => {
        if (!autoHeight) return

        const selectHeight = selectRef.current?.getBoundingClientRect().height ?? 0
        const selectTop = selectRef.current?.getBoundingClientRect().top ?? 0
        const viewportHeight = window.innerHeight
        const availableHeight = viewportHeight - selectTop - selectHeight - 40

        setMaxHeight(availableHeight > 0 ? availableHeight : 'auto')
    }, [autoHeight])

    type UserListboxSlotProps = React.HTMLAttributes<HTMLUListElement> & { sx?: SxProps<Theme> }
    const userListboxProps = userSlotProps?.listbox as UserListboxSlotProps | undefined

    const defaultGetOptionLabel = (option: T) => {
        if (typeof option === 'object' && option !== null && 'label' in option) {
            return (option as { label: string }).label
        }
        return String(option)
    }

    const isOptionDisabled = (option: T): boolean => {
        return typeof option === 'object' && option !== null && 'disabled' in option && Boolean(option.disabled)
    }

    const defaultListboxSx = {
        padding: 0,
        '& .MuiAutocomplete-option': {
            paddingLeft: multiple ? '12px !important' : '6px !important',
        },
    }

    const listboxSx: SxProps<Theme> = userListboxProps?.sx
        ? ([defaultListboxSx, userListboxProps.sx] as SxProps<Theme>)
        : defaultListboxSx

    const listboxStyle: React.CSSProperties | undefined = autoHeight
        ? { maxHeight: maxHeight === 'auto' ? 'auto' : `${maxHeight}px`, ...userListboxProps?.style }
        : userListboxProps?.style

    const currentMultipleValue = shouldShowSelectAll ? getMultipleValue(isControlled ? value : uncontrolledValue) : []
    const selectableOptions = shouldShowSelectAll ? options.filter((option) => !isOptionDisabled(option)) : options

    const isOptionSelected = (option: T, selectedOption: unknown): boolean => {
        const optionIsObject = typeof option === 'object' && option !== null
        const selectedOptionIsObject = typeof selectedOption === 'object' && selectedOption !== null

        if (optionIsObject !== selectedOptionIsObject) {
            return false
        }

        if (!optionIsObject && typeof option !== typeof selectedOption) {
            return false
        }

        if (isOptionEqualToValue) {
            return isOptionEqualToValue(option, selectedOption as T)
        }

        return option === selectedOption
    }

    const selectedOptionCount = shouldShowSelectAll
        ? selectableOptions.filter((option) =>
              currentMultipleValue.some((selectedOption) => isOptionSelected(option, selectedOption)),
          ).length
        : 0

    const allOptionsSelected =
        shouldShowSelectAll && selectableOptions.length > 0 && selectedOptionCount === selectableOptions.length

    const someOptionsSelected = shouldShowSelectAll && selectedOptionCount > 0 && !allOptionsSelected

    const handleChange: AutocompleteOnChange = (event, nextValue, reason, details) => {
        if (shouldShowSelectAll && !isControlled) {
            setUncontrolledValue(getMultipleValue(nextValue))
        }

        onChange?.(event, nextValue, reason, details)
    }
    const handleSelectAllChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const nextValue = (checked ? [...selectableOptions] : []) as MultipleValue

        handleChange(
            _event,
            nextValue as AutocompleteOnChangeParameters[1],
            checked ? 'selectOption' : 'clear',
            undefined,
        )
    }

    const defaultRenderValue: AutocompleteRenderValue = (tagValue, getItemProps) => {
        if (!Array.isArray(tagValue)) return null
        // defaultRenderValue is only wired up when multiple=true (non-freeSolo), so casting to T[] is safe
        return (tagValue as T[]).map((option, index) => {
            const itemProps = getItemProps({ index })
            const chipProps: Omit<typeof itemProps, 'key'> = itemProps
            const optionLabel = getOptionLabel?.(option) ?? defaultGetOptionLabel(option)

            return (
                <StyledChip
                    {...chipProps}
                    key={`selected-chip-${optionLabel}-${index}`}
                    dataTest={`selected-chip-${optionLabel}`}
                    label={optionLabel}
                    variant='outlined'
                />
            )
        })
    }

    return (
        <div className={cn(style['styledSelectAutocompleteWrapper'], wrapperClassName)} ref={selectRef}>
            <Autocomplete
                {...remainingProps}
                multiple={multiple as Multiple}
                defaultValue={shouldShowSelectAll ? undefined : defaultValue}
                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}
                className={clsx('!text-sm', className)}
                onChange={handleChange}
                options={options}
                renderValue={renderValue ?? (multiple ? defaultRenderValue : undefined)}
                popupIcon={
                    readOnly ? null : (popupIcon ?? multiple) ? (
                        <PlusIconCircle width={24} height={24} />
                    ) : (
                        <ChevronDownIcon width={24} height={24} className={clsx(style['select-custom-icon'])} />
                    )
                }
                readOnly={readOnly}
                data-testid={dataTest}
                value={
                    shouldShowSelectAll
                        ? (currentMultipleValue as AutocompleteProps<
                              T,
                              Multiple,
                              DisableClearable,
                              FreeSolo,
                              ChipComponent
                          >['value'])
                        : value
                }
                slots={{
                    ...userSlots,
                    paper: ({ children }) => (
                        <Paper
                            data-testid={`paper-${dataTest}`}
                            sx={{
                                padding: '0 !important',
                                marginTop: '0px !important',
                                '& .MuiAutocomplete-option.Mui-focused': {
                                    background: 'var(--colors-delta-50) !important',
                                },
                                '& li[aria-selected=true]': {
                                    background: 'var(--colors-gama-50) !important',
                                },
                                '& li[aria-selected=true].MuiAutocomplete-option.Mui-focused': {
                                    background: 'var(--colors-gama-50) !important',
                                },
                                '&:has([data-select-all-header]:hover) .MuiAutocomplete-option.Mui-focused': {
                                    background: 'transparent !important',
                                },
                                '&:has([data-select-all-header]:hover) li[aria-selected=true].MuiAutocomplete-option.Mui-focused':
                                    {
                                        background: 'var(--colors-gama-50) !important',
                                    },
                            }}
                        >
                            {shouldShowSelectAll && selectableOptions.length > 0 && (
                                <div
                                    data-select-all-header
                                    className='flex items-center gap-x-[10px] border-[1px] border-b border-solid border-delta-200 bg-delta-50 py-2 pl-3 text-xs'
                                    onMouseDown={(e) => e.preventDefault()}
                                    role='presentation'
                                >
                                    <StyledCheckbox
                                        size='small'
                                        dataTest={`${dataTest}-select-all`}
                                        checked={allOptionsSelected}
                                        indeterminate={someOptionsSelected}
                                        hideWrapper
                                        onChange={handleSelectAllChange}
                                        aria-label={selectAllLabel ?? 'Select all'}
                                    />
                                    <span className='truncate text-[10px] font-semibold uppercase text-delta-600'>
                                        {selectAllLabel ?? 'Select all'}
                                    </span>
                                </div>
                            )}
                            {children}
                        </Paper>
                    ),
                }}
                renderOption={
                    renderOption ??
                    ((props, option, { selected }) => {
                        const rest: Omit<typeof props, 'key'> = props
                        const optionKey = props.id ?? defaultGetOptionLabel(option)

                        if (multiple) {
                            return (
                                <li
                                    {...rest}
                                    key={optionKey}
                                    className={cn(
                                        props.className,
                                        'flex items-center gap-x-[10px] border-0 border-b border-solid border-delta-200',
                                    )}
                                >
                                    <StyledCheckbox
                                        dataTest={`${dataTest}-${defaultGetOptionLabel(option)}-checkbox`}
                                        checked={selected}
                                        size='small'
                                        hideWrapper
                                    />
                                    <span className='flex-1 truncate py-2 text-sm text-delta-700'>
                                        {getOptionLabel?.(option) ?? defaultGetOptionLabel(option)}
                                    </span>
                                </li>
                            )
                        }

                        return (
                            <li {...rest} key={optionKey} className={cn(props.className, 'flex items-center gap-x-1')}>
                                <span className='w-5'>
                                    {selected && (
                                        <CheckIcon width={20} height={20} style={{ color: 'var(--colors-gama-500)' }} />
                                    )}
                                </span>

                                <span className='flex-1 truncate py-2 text-sm text-delta-700'>
                                    {getOptionLabel?.(option) ?? defaultGetOptionLabel(option)}
                                </span>
                            </li>
                        )
                    })
                }
                sx={{
                    ...sx,
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--colors-gama-500) !important',
                    },
                    '& .select-custom-icon': {
                        marginTop: '-0.5px !important',
                    },
                    '& .MuiInputBase-inputSizeSmall': {
                        minHeight: '23px !important',
                    },
                }}
                slotProps={{
                    ...userSlotProps,
                    clearIndicator: {
                        disableRipple: true,
                        disableFocusRipple: true,
                        ...(userSlotProps?.clearIndicator ?? {}),
                    },
                    listbox: {
                        ...userListboxProps,
                        ...(listboxStyle ? { style: listboxStyle } : {}),
                        sx: listboxSx,
                    },
                }}
                clearIcon={
                    <span className='flex min-h-6 min-w-6 cursor-pointer items-center justify-center rounded-full bg-delta-50'>
                        <CloseIcon width={20} height={20} className='text-delta-700' />
                    </span>
                }
            />
        </div>
    )
}
