import { ErrorOutlineIcon, Skeleton, StyledChip, StyledInteractiveChip, StyledTooltip } from 'src'
import type { DynamicSelectOption, StyledDynamicSelectComponent, StyledDynamicSelectProps } from '../types'
import { cn } from 'src/helpers/cn'
import { useWrap } from '../helpers/useWrap'
import { forwardRef } from 'react'

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
            error,
            helperText,
            valueKey = 'value',
            labelKey = 'label',
            renderLabel,
            getOptionTooltip,
            loading,
            size,
        } = props
        const { containerRef, wrapDisabled } = useWrap({ dependencyList: [options, options.length] })

        const getOptionLabel = (option: TOption) => {
            if (typeof option === 'object') {
                return option?.[labelKey as keyof TOption]?.toString() || ''
            }
            return option?.toString() || ''
        }

        const getOptionValue = (option: TOption | null) => {
            if (typeof option === 'object') return option?.[valueKey as keyof TOption]
            return option
        }

        const isOptionEqualToValue = (option: TOption | null, value: TOption | null): boolean => {
            return getOptionValue(option) === getOptionValue(value)
        }

        const handleClick = (option: TOption) => {
            if (!multiple) {
                const newValue = isOptionEqualToValue(option, value) ? null : option
                onChange(newValue)
                return
            }

            const currentValues = (value as TOption[] | null) || []
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
            <div data-test={`${dataTest}-dynamic-radio-group`} className='flex flex-col gap-y-1 relative'>
                {title && <span className='text-delta-800 text-base font-semibold'>{title}</span>}
                {/* HACK for calculating overflow layout */}
                <div
                    ref={containerRef}
                    className='absolute top-0 left-0 opacity-0 pointer-events-none flex flex-wrap gap-2 text-sm'
                    style={{ width: '100%' }}
                >
                    {visibleOptions.map((o) => {
                        const optionValue = getOptionValue(o)

                        return (
                            <StyledInteractiveChip
                                key={String(optionValue)}
                                className='w-fit'
                                readOnly={readOnly}
                                type={multiple ? 'checkbox' : 'radio'}
                                dataTest={`ic-${String(optionValue)}-hidden`}
                                label={renderLabel ? renderLabel(o) : getOptionLabel(o)}
                            />
                        )
                    })}
                </div>

                <div className={cn('flex gap-2 flex-wrap', wrapDisabled && 'flex-col gap-1')}>
                    {loading ? (
                        <div className='flex flex-wrap gap-2'>
                            <Skeleton className='w-[60px] h-[32px]' />
                            <Skeleton className='w-[60px] h-[32px]' />
                            <Skeleton className='w-[60px] h-[32px]' />
                        </div>
                    ) : visibleOptions?.length ? (
                        visibleOptions.map((o, index) => {
                            const optionValue = getOptionValue(o)

                            const checked = !!(multiple
                                ? value?.find((v) => isOptionEqualToValue(v, o))
                                : isOptionEqualToValue(value, o))

                            const tooltipTitle = getOptionTooltip ? getOptionTooltip(o) : null

                            if (readOnly && !checked) return null
                            const optionDisabled = typeof o === 'object' ? !!o?.disabled : false

                            const inputRef =
                                !optionDisabled && !readOnly && index === firstActiveIndex ? ref : undefined

                            return (
                                <StyledTooltip key={String(optionValue)} title={tooltipTitle} arrow>
                                    <span className={cn(optionDisabled && 'cursor-not-allowed')}>
                                        {readOnly && !wrapDisabled ? (
                                            <StyledChip
                                                ref={inputRef}
                                                disabled={disabled || optionDisabled}
                                                classes={{
                                                    root: 'min-h-[32px] h-full',
                                                }}
                                                className='w-fit text-sm'
                                                dataTest={`ic-${String(optionValue)}`}
                                                label={renderLabel ? renderLabel(o) : getOptionLabel(o)}
                                            />
                                        ) : (
                                            <StyledInteractiveChip
                                                ref={inputRef}
                                                disabled={disabled || optionDisabled}
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
                                                className='w-fit text-sm'
                                                readOnly={readOnly}
                                                type={multiple ? 'checkbox' : 'radio'}
                                                dataTest={`ic-${String(optionValue)}`}
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
                {!readOnly && (
                    <div className={cn('text-sm/5 text-delta-600 flex items-center gap-1', error && 'text-error-500')}>
                        {error && <ErrorOutlineIcon width={20} height={20} className='min-w-5' />}
                        <span className='line-clamp-1'>{helperText || (error && !helperText && 'Required')}</span>
                    </div>
                )}
            </div>
        )
    },
) as StyledDynamicSelectComponent
