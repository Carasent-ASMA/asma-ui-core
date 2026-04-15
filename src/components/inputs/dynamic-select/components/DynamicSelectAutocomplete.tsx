import { StyledCheckbox, StyledChip, StyledTooltip } from 'src'
import { StyledInputField } from '../../input-field'
import { StyledSelectAutocomplete } from '../../select-autocomplete'
import type { StyledDynamicSelectProps, DynamicSelectOption, StyledDynamicSelectComponent } from '../types'
import { LoadingIcon, PlusIconCircle, CheckIcon } from 'asma-ui-icons'
import { DynamicInteractiveChipGroup } from './DynamicInteractiveChipGroup'
import { forwardRef, useCallback, useState } from 'react'
import { cn } from 'src/helpers/cn'
import type { AutocompleteCloseReason } from '@mui/material'

export const DynamicSelectAutocomplete = forwardRef(
    <TOption extends DynamicSelectOption>(
        props: StyledDynamicSelectProps<TOption>,
        ref: React.Ref<HTMLInputElement>,
    ) => {
        const [open, setOpen] = useState(false)

        const {
            options,
            dataTest,
            value,
            readOnly,
            multiple,
            required,
            onChange,
            size,
            title,
            noOptionsText,
            placeholder,
            disabled,
            helperText,
            error,
            valueKey = 'value',
            labelKey = 'label',
            renderLabel,
            getOptionTooltip,
            startAdornment,
            autocompleteProps,
            loading,
            maxTags,
        } = props
        const typingDisabled = options.length < 11

        const getOptionLabel = (option: TOption | string) => {
            if (typeof option === 'object') {
                return option?.[labelKey as keyof TOption]?.toString() || ''
            }
            return option?.toString() || ''
        }

        const getOptionValue = useCallback(
            (option: TOption | null) => {
                if (typeof option === 'object') return option?.[valueKey as keyof TOption]
                return option
            },
            [valueKey],
        )

        const isOptionEqualToValue = useCallback(
            (option: TOption | null, value: TOption | null): boolean => {
                return getOptionValue(option) === getOptionValue(value)
            },
            [getOptionValue],
        )

        const handleOpen = useCallback(
            (event: React.SyntheticEvent) => {
                setOpen(true)
                autocompleteProps?.onOpen?.(event)
            },
            [autocompleteProps],
        )

        const handleClose = useCallback(
            (event: React.SyntheticEvent, reason: AutocompleteCloseReason) => {
                setOpen(false)
                autocompleteProps?.onClose?.(event, reason)
            },
            [autocompleteProps],
        )

        if (multiple && readOnly) return <DynamicInteractiveChipGroup<TOption> {...props} />

        return (
            <div className='flex w-full flex-col gap-y-1'>
                {title && <span className='text-base font-semibold text-delta-800'>{title}</span>}
                <StyledSelectAutocomplete
                    open={open}
                    onOpen={handleOpen}
                    onClose={handleClose}
                    disableCloseOnSelect={multiple}
                    dataTest={dataTest}
                    disabled={disabled || loading}
                    noOptionsText={noOptionsText}
                    loading={loading}
                    readOnly={readOnly}
                    value={value}
                    size={size}
                    disableClearable={required}
                    options={options}
                    fullWidth
                    classes={{
                        listbox: 'h-full max-h-[300px]',
                    }}
                    getOptionLabel={getOptionLabel || autocompleteProps?.getOptionLabel}
                    onChange={(_, value) => {
                        if (multiple) {
                            onChange(value as TOption[] | null)
                        } else {
                            onChange(value as TOption | null)
                        }
                    }}
                    filterSelectedOptions={false}
                    isOptionEqualToValue={autocompleteProps?.isOptionEqualToValue ?? isOptionEqualToValue}
                    autoHeight
                    multiple={multiple}
                    renderTags={(tagValues) => {
                        const limit = maxTags || options.length
                        const limitedTags = tagValues.slice(0, limit)
                        const remainingCount = tagValues.length - limit
                        return (
                            <div className='flex flex-wrap gap-2'>
                                {limitedTags.map((option) => (
                                    <StyledChip
                                        key={getOptionValue(option)?.toString()}
                                        dataTest={`${getOptionValue(option)}-chip`}
                                        readOnly={readOnly}
                                        variant='outlined'
                                        label={renderLabel ? renderLabel(option) : getOptionLabel(option) || ''}
                                        classes={{
                                            root: 'h-fit w-fit min-h-[32px]',
                                            label: 'block whitespace-normal',
                                        }}
                                        disabled={disabled || loading}
                                        onDelete={() => {
                                            if (!multiple) {
                                                onChange(null)
                                                return
                                            }

                                            const newValues = value!.filter((v) => !isOptionEqualToValue(v, option))
                                            onChange(newValues)
                                        }}
                                    />
                                ))}
                                {remainingCount > 0 && (
                                    <StyledChip
                                        dataTest='remaining-count-tag-chip'
                                        label={`+${remainingCount}`}
                                        variant='outlined'
                                        onClick={handleOpen}
                                    />
                                )}
                            </div>
                        )
                    }}
                    popupIcon={
                        loading ? (
                            <LoadingIcon height={24} width={24} />
                        ) : multiple ? (
                            <PlusIconCircle height={24} width={24} />
                        ) : undefined
                    }
                    renderOption={(props, option) => {
                        const disabled = typeof option === 'object' ? !!option?.disabled : false
                        const tooltipTitle = getOptionTooltip ? getOptionTooltip(option) : null

                        if (multiple) {
                            const isSelected = !!value?.find((l) => isOptionEqualToValue(l, option))
                            return (
                                /** biome-ignore lint/a11y/useKeyWithClickEvents: <onClick props is still passed so we need to block it for disabled options> */
                                <li
                                    {...props}
                                    key={props.id}
                                    onClick={!disabled ? props.onClick : undefined}
                                    className={cn(
                                        'flex h-full cursor-pointer gap-x-1 bg-white text-sm/5 hover:bg-gama-50',
                                        disabled && 'cursor-not-allowed bg-delta-50 hover:bg-delta-50',
                                    )}
                                    aria-disabled={disabled}
                                >
                                    <StyledTooltip arrow title={tooltipTitle}>
                                        <>
                                            <StyledCheckbox
                                                disabled={disabled}
                                                dataTest={`${getOptionValue(option)}-checkbox`}
                                                size='small'
                                                className='min-w-[36px]'
                                                checked={isSelected}
                                            />
                                            {renderLabel ? (
                                                renderLabel(option)
                                            ) : (
                                                <span className='h-fit py-[10px] text-sm text-delta-700'>
                                                    {getOptionLabel(option)}
                                                </span>
                                            )}
                                        </>
                                    </StyledTooltip>
                                </li>
                            )
                        }

                        const isSelected = isOptionEqualToValue(value, option)

                        return (
                            /** biome-ignore lint/a11y/useKeyWithClickEvents: <onClick props is still passed so we need to block it for disabled options> */
                            <li
                                {...props}
                                key={props.id}
                                className={cn(
                                    'flex h-full cursor-pointer gap-x-1 px-2 text-sm/5 hover:bg-gama-50',
                                    disabled && 'cursor-not-allowed bg-delta-50 hover:bg-delta-50',
                                )}
                                onClick={!disabled ? props.onClick : undefined}
                                aria-disabled={disabled}
                            >
                                <StyledTooltip arrow title={tooltipTitle}>
                                    <>
                                        <span className='h-full w-5 min-w-5 py-[10px]'>
                                            {isSelected && (
                                                <CheckIcon
                                                    className='size-5 min-h-5 min-w-5 text-gama-500'
                                                    height={20}
                                                    width={20}
                                                />
                                            )}
                                        </span>
                                        {renderLabel ? (
                                            renderLabel(option)
                                        ) : (
                                            <span className='py-[10px] text-sm text-delta-700'>
                                                {getOptionLabel(option)}
                                            </span>
                                        )}
                                    </>
                                </StyledTooltip>
                            </li>
                        )
                    }}
                    renderInput={(params) => (
                        <StyledInputField
                            dataTest={`${dataTest}-input-field`}
                            {...params}
                            inputRef={ref}
                            error={error}
                            helperText={helperText || ' '}
                            variant='outlined'
                            label=''
                            placeholder={placeholder}
                            readOnly={readOnly}
                            onKeyDown={typingDisabled ? (e) => e.preventDefault() : undefined}
                            autoComplete={typingDisabled ? 'off' : 'on'}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: startAdornment || params.InputProps.startAdornment,
                                style: typingDisabled ? { caretColor: 'transparent' } : {},
                            }}
                            inputProps={{
                                ...params.inputProps,
                                style: typingDisabled ? { caretColor: 'transparent' } : {},
                            }}
                        />
                    )}
                    {...autocompleteProps}
                />
            </div>
        )
    },
) as StyledDynamicSelectComponent
