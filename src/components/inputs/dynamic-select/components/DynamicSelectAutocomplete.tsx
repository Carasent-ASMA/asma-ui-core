import { StyledCheckbox, StyledChip, StyledTooltip } from 'src'
import { StyledInputField } from '../../input-field'
import { StyledSelectAutocomplete } from '../../select-autocomplete'
import type { StyledDynamicSelectProps, DynamicSelectOption, StyledDynamicSelectComponent } from '../types'
import { LoadingIcon, PlusIconCircle, CheckIcon } from 'src/components/icons'
import { DynamicInteractiveChipGroup } from './DynamicInteractiveChipGroup'
import { forwardRef, useCallback, useState } from 'react'
import { cn } from 'src/helpers/cn'

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
            disableHelperText,
            error,
            valueKey = 'value',
            labelKey = 'label',
            renderLabel,
            getOptionTooltip,
            startAdornment,
            autocompleteProps,
            loading,
            maxTags,
            onFocus,
            onBlur,
        } = props
        const typingDisabled = options.length < 11

        const getOptionLabel = (option: TOption | string) => {
            if (typeof option === 'object') {
                return option?.[labelKey as keyof TOption]?.toString() ?? ''
            }
            return option?.toString() ?? ''
        }

        const getOptionValue = useCallback(
            (option: TOption | null) => {
                if (typeof option === 'object') return option?.[valueKey as keyof TOption]
                return option
            },
            [valueKey],
        )

        const isOptionEqualToValue = useCallback(
            // Compare by resolved value for BOTH primitives and objects. The old `typeof value ===
            // 'string' → false` short-circuit broke primitive-string options (documented as supported):
            // every check returned false, so nothing ever read as selected and re-selecting duplicated.
            // `getOptionValue` already returns the primitive as-is, so string===string works; an object
            // option vs a stray typed string still compares unequal (its valueKey never equals the string).
            (option: TOption, value: TOption | string): boolean =>
                getOptionValue(option) === getOptionValue(value as TOption),
            [getOptionValue],
        )

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

        const handleOpen = useCallback(
            (event?: React.SyntheticEvent) => {
                setOpen(true)
                autocompleteProps?.onOpen?.(event)
            },
            [autocompleteProps],
        )

        const handleClose = useCallback(
            (event?: React.SyntheticEvent, reason?: string) => {
                setOpen(false)
                autocompleteProps?.onClose?.(event, reason)
            },
            [autocompleteProps],
        )

        if (multiple && readOnly) return <DynamicInteractiveChipGroup<TOption> {...props} />

        const titleId = title ? `${dataTest}-title` : undefined

        return (
            <div className='flex w-full flex-col gap-y-1'>
                {title && (
                    <span id={titleId} className='text-base font-semibold text-delta-800'>
                        {title}
                    </span>
                )}
                <StyledSelectAutocomplete<TOption, boolean, boolean, false>
                    open={open}
                    onOpen={handleOpen}
                    onClose={handleClose}
                    disableCloseOnSelect={multiple}
                    dataTest={dataTest}
                    disabled={Boolean(disabled) || Boolean(loading)}
                    noOptionsText={noOptionsText}
                    loading={loading}
                    readOnly={readOnly}
                    value={value}
                    size={size}
                    disableClearable={required}
                    options={options}
                    fullWidth
                    classes={{
                        listbox: 'max-h-[300px]',
                    }}
                    getOptionLabel={autocompleteProps?.getOptionLabel ?? getOptionLabel}
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
                    renderValue={
                        multiple
                            ? (tagValues) => {
                                  if (!Array.isArray(tagValues)) return null
                                  const typedValues = tagValues
                                  const limit = maxTags ?? options.length
                                  const limitedTags = typedValues.slice(0, limit)
                                  const remainingCount = typedValues.length - limit
                                  // Return the chips as an ARRAY (not a wrapping <div>) so the field
                                  // treats them as its adornment list — the shell then flex-wraps and
                                  // grows to the chips' real height (incl. wrapped multi-line labels),
                                  // instead of pinning them absolutely inside a fixed 40px row.
                                  return [
                                      ...limitedTags.map((option) => (
                                          <StyledChip
                                              key={getOptionValueText(option)}
                                              dataTest={`${getOptionValueText(option)}-chip`}
                                              readOnly={readOnly}
                                              variant='outlined'
                                              label={renderLabel ? renderLabel(option) : getOptionLabel(option)}
                                              classes={{
                                                  root: 'h-fit w-fit min-h-[32px]',
                                                  label: 'block whitespace-normal',
                                              }}
                                              disabled={Boolean(disabled) || Boolean(loading)}
                                              onDelete={() => {
                                                  if (!Array.isArray(value)) return
                                                  const newValues = value.filter(
                                                      (v) => !isOptionEqualToValue(v, option),
                                                  )
                                                  onChange(newValues)
                                              }}
                                          />
                                      )),
                                      remainingCount > 0 ? (
                                          <StyledChip
                                              key='remaining-count'
                                              dataTest='remaining-count-tag-chip'
                                              label={`+${remainingCount}`}
                                              variant='outlined'
                                              onClick={handleOpen}
                                          />
                                      ) : null,
                                  ]
                              }
                            : undefined
                    }
                    popupIcon={
                        loading ? (
                            <LoadingIcon height={24} width={24} />
                        ) : multiple ? (
                            <PlusIconCircle height={24} width={24} />
                        ) : undefined
                    }
                    renderOption={(props, option, state) => {
                        const disabled = typeof option === 'object' ? !!option?.disabled : false
                        const tooltipTitle = getOptionTooltip ? getOptionTooltip(option) : null

                        if (multiple) {
                            // Reuse the selected flag the autocomplete already computed for this row
                            // instead of re-scanning `value` per option (avoids O(options × selected)).
                            const isSelected = state.selected
                            return (
                                // This <li role='option'> is a combobox descendant, not independently
                                // focusable (no tabIndex). Keyboard selection is handled centrally on the
                                // input via aria-activedescendant + Enter (see StyledSelectAutocomplete's
                                // handleKeyDown); onClick here is mouse-only.
                                // `props.role`/`props['aria-selected']` (from StyledSelectAutocomplete's
                                // OptionLiProps) are invisible to static a11y analysis inside the spread —
                                // restate them literally so `aria-disabled` is validated against `option`
                                // (which supports it, unlike the <li>'s implicit `listitem` role) and
                                // `role-has-required-aria-props` sees `aria-selected` is present.
                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                                <li
                                    {...props}
                                    role='option'
                                    aria-selected={isSelected}
                                    key={props.id}
                                    onClick={!disabled ? props.onClick : undefined}
                                    className={cn(
                                        // Figma Menus item: Body Base 16/lh24.
                                        'flex min-h-10 cursor-pointer items-center gap-x-1 bg-white px-2 text-base aria-selected:bg-gama-50 hover:bg-gama-50',
                                        disabled &&
                                            'cursor-not-allowed bg-delta-50 aria-selected:!bg-delta-50 hover:!bg-delta-50 [&_*]:cursor-not-allowed',
                                    )}
                                    aria-disabled={disabled}
                                >
                                    <StyledTooltip arrow title={tooltipTitle}>
                                        <>
                                            <StyledCheckbox
                                                disabled={disabled}
                                                dataTest={`${getOptionValueText(option)}-checkbox`}
                                                size='small'
                                                // Pure state indicator: the row `<li>` owns selection and
                                                // carries the real accessible state via `aria-selected`
                                                // (set above). `decorative` renders no <input> at all — a
                                                // real one (even inert-ed with aria-hidden/tabIndex) is
                                                // still a genuine axe `nested-interactive` violation.
                                                decorative
                                                className='min-w-[36px]'
                                                checked={isSelected}
                                            />
                                            {renderLabel ? (
                                                renderLabel(option)
                                            ) : (
                                                <span className='h-fit text-base text-delta-800'>
                                                    {getOptionLabel(option)}
                                                </span>
                                            )}
                                        </>
                                    </StyledTooltip>
                                </li>
                            )
                        }

                        const isSelected = state.selected

                        return (
                            // See the `multiple` branch above: not independently focusable, keyboard
                            // selection handled centrally via aria-activedescendant + Enter; role and
                            // aria-selected restated literally (both hidden inside the {...props} spread).
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                            <li
                                {...props}
                                role='option'
                                aria-selected={isSelected}
                                key={props.id}
                                className={cn(
                                    // Figma Menus item: Body Base 16/lh24.
                                    'flex min-h-10 cursor-pointer items-center gap-x-1 px-2 text-base aria-selected:bg-gama-50 hover:bg-gama-50',
                                    disabled &&
                                        'cursor-not-allowed bg-delta-50 aria-selected:!bg-delta-50 hover:!bg-delta-50 [&_*]:cursor-not-allowed',
                                )}
                                onClick={!disabled ? props.onClick : undefined}
                                aria-disabled={disabled}
                            >
                                <StyledTooltip arrow title={tooltipTitle}>
                                    <>
                                        <span className='w-5 min-w-5'>
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
                                            <span className='text-base text-delta-800'>
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
                            helperText={disableHelperText ? '' : (helperText ?? ' ')}
                            variant='outlined'
                            label=''
                            placeholder={placeholder}
                            readOnly={readOnly}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            onKeyDown={typingDisabled ? (e) => e.preventDefault() : undefined}
                            // Always off: this input owns its own option list, so the browser's
                            // form-history dropdown would cover it — same as `StyledSelectAutocomplete`
                            // and MUI's `useAutocomplete`. (The previous `typingDisabled ? 'off' : 'on'`
                            // conflated this with MUI `Autocomplete`'s boolean `autoComplete` prop,
                            // which means inline completion of the typed value — a different feature.)
                            autoComplete='off'
                            slotProps={{
                                ...params.slotProps,
                                input: {
                                    ...(params.slotProps?.input ?? {}),
                                    startAdornment:
                                        startAdornment ??
                                        (params.slotProps?.input as { startAdornment?: React.ReactNode } | undefined)
                                            ?.startAdornment,
                                    style: typingDisabled ? { caretColor: 'transparent' } : {},
                                },
                                htmlInput: {
                                    ...(params.slotProps?.htmlInput ?? {}),
                                    // `title` above renders as a plain <span> (not a real <label>, by
                                    // design — it sits above the field, not as a floating label) with no
                                    // programmatic connection to the input otherwise: `label=''` above
                                    // means the field's own aria-label fallback never fires either, so
                                    // without this the input has NO accessible name at all despite the
                                    // visible title (axe `label`, the single largest violation source
                                    // in this component's stories).
                                    ...(titleId ? { 'aria-labelledby': titleId } : {}),
                                    style: typingDisabled ? { caretColor: 'transparent' } : {},
                                },
                            }}
                        />
                    )}
                    {...autocompleteProps}
                />
            </div>
        )
    },
) as StyledDynamicSelectComponent
