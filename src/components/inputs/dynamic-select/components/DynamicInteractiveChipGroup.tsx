import { ErrorOutlineIcon, Skeleton, StyledButton, StyledChip, StyledInteractiveChip, StyledTooltip } from 'src'
import type { DynamicSelectOption, StyledDynamicSelectComponent, StyledDynamicSelectProps } from '../types'
import { cn } from 'src/helpers/cn'
import { useWrap } from '../helpers/useWrap'
import { forwardRef } from 'react'
import { CloseIcon } from 'src/components/icons'

export const DynamicInteractiveChipGroup = forwardRef(
    <TOption extends DynamicSelectOption>(
        props: StyledDynamicSelectProps<TOption>,
        ref: React.Ref<HTMLInputElement>,
    ) => {
        const {
            options,
            dataTest,
            value,
            readOnly,
            multiple,
            title,
            disabled,
            onChange,
            required,
            error,
            helperText,
            valueKey = 'value',
            labelKey = 'label',
            renderLabel,
            getOptionTooltip,
            loading,
            size,
            locale = 'en',
        } = props
        const { containerRef, wrapDisabled } = useWrap({ dependencyList: [options, options.length] })

        const getOptionLabel = (option: TOption) => {
            if (typeof option === 'object') {
                return option?.[labelKey as keyof TOption]?.toString() ?? ''
            }
            return option?.toString() ?? ''
        }

        const getOptionValue = (option: TOption | null) => {
            if (typeof option === 'object') return option?.[valueKey as keyof TOption]
            return option
        }

        const getOptionValueText = (option: TOption | null): string => {
            const optionValue = getOptionValue(option)

            if (optionValue == null) {
                return ''
            }

            if (typeof optionValue === 'string' || typeof optionValue === 'number' || typeof optionValue === 'boolean') {
                return String(optionValue)
            }

            return option == null ? '' : getOptionLabel(option)
        }

        const isOptionEqualToValue = (option: TOption | null, value: TOption | null): boolean => {
            return getOptionValue(option) === getOptionValue(value)
        }

        const hasValue = multiple ? Array.isArray(value) && value.length > 0 : value !== null && value !== undefined

        const handleClick = (option: TOption) => {
            if (!multiple) {
                const newValue = isOptionEqualToValue(option, value) ? null : option
                if (newValue === null) return
                onChange(newValue)
                return
            }

            const currentValues = value ?? []
            const exists = currentValues.find((v) => isOptionEqualToValue(v, option))
            const newValues = exists
                ? currentValues.filter((v) => !isOptionEqualToValue(v, option))
                : [...currentValues, option]
            onChange(newValues)
        }

        const visibleOptions = !readOnly
            ? options
            : options.filter((o) => {
                  const selected = !!(multiple
                      ? value?.find((v) => isOptionEqualToValue(v, o))
                      : isOptionEqualToValue(value, o))

                  return selected
              })

        const firstActiveIndex = visibleOptions.findIndex((o) => {
            const disabled = typeof o === 'object' ? !!o?.disabled : false
            return !disabled && !readOnly
        })

        return (
            <div data-testid={`${dataTest}-dynamic-radio-group`} className='relative flex flex-col gap-y-1'>
                {title && <span className='text-base font-semibold text-delta-800'>{title}</span>}
                {/* HACK for calculating overflow layout */}
                <div
                    aria-hidden
                    ref={containerRef}
                    className='pointer-events-none absolute left-0 top-0 flex flex-wrap gap-2 opacity-0'
                    style={{ width: '100%' }}
                >
                    {visibleOptions.map((o) => {
                        return (
                            <StyledInteractiveChip
                                key={getOptionValueText(o)}
                                className='w-fit'
                                readOnly={readOnly}
                                type={multiple ? 'checkbox' : 'radio'}
                                dataTest={`ic-${getOptionValueText(o)}-hidden`}
                                label={renderLabel ? renderLabel(o) : getOptionLabel(o)}
                            />
                        )
                    })}
                </div>

                <div className={cn('flex flex-wrap gap-2', wrapDisabled && 'flex-col gap-1')}>
                    {loading ? (
                        <div className='flex flex-wrap gap-2'>
                            <Skeleton className='h-[32px] w-[60px]' />
                            <Skeleton className='h-[32px] w-[60px]' />
                            <Skeleton className='h-[32px] w-[60px]' />
                        </div>
                    ) : visibleOptions?.length ? (
                        visibleOptions.map((o, index) => {
                            const checked = !!(multiple
                                ? value?.find((v) => isOptionEqualToValue(v, o))
                                : isOptionEqualToValue(value, o))

                            const tooltipTitle = getOptionTooltip ? getOptionTooltip(o) : null

                            if (readOnly && !checked) return null
                            const optionDisabled = typeof o === 'object' ? !!o?.disabled : false

                            const inputRef =
                                !optionDisabled && !readOnly && index === firstActiveIndex ? ref : undefined

                            return (
                                <StyledTooltip key={getOptionValueText(o)} title={tooltipTitle} arrow>
                                    <span className={cn(optionDisabled && 'cursor-not-allowed')}>
                                        {readOnly && !wrapDisabled ? (
                                            <StyledChip
                                                ref={inputRef}
                                                disabled={Boolean(disabled) || optionDisabled}
                                                classes={{
                                                    root: 'min-h-[32px] h-full',
                                                }}
                                                className='w-fit'
                                                dataTest={`ic-${getOptionValueText(o)}`}
                                                label={renderLabel ? renderLabel(o) : getOptionLabel(o)}
                                            />
                                        ) : (
                                            <StyledInteractiveChip
                                                ref={inputRef}
                                                disabled={Boolean(disabled) || optionDisabled}
                                                classes={
                                                    wrapDisabled
                                                        ? {
                                                              root: 'border-none outline-none bg-transparent w-full flex justify-start h-full min-h-[40px] shadow-none',
                                                              label: 'block whitespace-normal break-words overflow-visible',
                                                          }
                                                        : {
                                                              root: 'min-h-[32px] h-full',
                                                          }
                                                }
                                                className='w-fit'
                                                readOnly={readOnly}
                                                type={multiple ? 'checkbox' : 'radio'}
                                                dataTest={`ic-${getOptionValueText(o)}`}
                                                checked={checked}
                                                size={size}
                                                onClick={() => handleClick(o)}
                                                label={renderLabel ? renderLabel(o) : getOptionLabel(o)}
                                            />
                                        )}
                                    </span>
                                </StyledTooltip>
                            )
                        })
                    ) : (
                        <span>-</span>
                    )}
                </div>
                {!required && hasValue && !readOnly && (
                    <StyledButton
                        dataTest='clear-selection-btn'
                        variant='text'
                        startIcon={
                            size === 'medium' ? (
                                <CloseIcon height={24} width={24} className='size-6' />
                            ) : (
                                <CloseIcon height={20} width={20} className='size-5' />
                            )
                        }
                        className='w-fit'
                        size={size}
                        onClick={() => (multiple ? onChange([]) : onChange(null))}
                    >
                        {locale === 'en' ? 'Clear selection' : 'Fjern valget'}
                    </StyledButton>
                )}
                <div className={cn('flex items-center gap-1 text-sm/5 text-delta-600', error && 'text-error-500')}>
                    {error && <ErrorOutlineIcon width={20} height={20} className='min-w-5' />}
                    <span className='line-clamp-1'>{helperText ?? (error ? 'Required' : undefined)}</span>
                </div>
            </div>
        )
    },
) as StyledDynamicSelectComponent
