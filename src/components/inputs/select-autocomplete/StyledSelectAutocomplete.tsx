import { Icon } from '@iconify/react'
import { Autocomplete, Paper, type AutocompleteProps, type ChipTypeMap } from '@mui/material'
import clsx from 'clsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'src/helpers/cn'
import style from './StyledSelectAutocomplete.module.scss'

export type StyledSelectAutocompleteProps<
    T,
    // Multiple extends boolean | undefined = false,
    Multiple extends boolean | undefined,
    // DisableClearable extends boolean | undefined = false,
    DisableClearable extends boolean | undefined,
    // FreeSolo extends boolean | undefined = false,
    FreeSolo extends boolean | undefined,
    ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> = AutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent> & {
    dataTest: string
    autoHeight?: boolean
    getOptionLabel?: (option: T) => string
    wrapperClassName?: string
}

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
    ...props
}: StyledSelectAutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>): JSX.Element {
    const [maxHeight, setMaxHeight] = useState<number | 'auto'>('auto')
    const selectRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        if (!autoHeight) return

        const selectHeight = selectRef.current?.getBoundingClientRect().height ?? 0
        const selectTop = selectRef.current?.getBoundingClientRect().top ?? 0
        const viewportHeight = window.innerHeight
        const availableHeight = viewportHeight - selectTop - selectHeight - 40

        setMaxHeight(availableHeight > 0 ? availableHeight : 'auto')
    }, [autoHeight])

    const listboxProps = autoHeight
        ? {
              style: {
                  maxHeight: maxHeight === 'auto' ? 'auto' : `${maxHeight}px`,
              },
              ...props.ListboxProps,
          }
        : props.ListboxProps

    const defaultGetOptionLabel = (option: T) => {
        if (typeof option === 'object' && option !== null && 'label' in option) {
            return (option as { label: string }).label
        }
        return String(option)
    }

    return (
        <div className={cn(style['styledSelectAutocompleteWrapper'], wrapperClassName)} ref={selectRef}>
            <Autocomplete
                {...props}
                getOptionLabel={getOptionLabel}
                ListboxProps={{
                    ...listboxProps,
                    sx: {
                        '& .MuiAutocomplete-option': {
                            paddingLeft: '6px !important',
                        },
                    },
                }}
                className={clsx('!text-sm', props.className)}
                popupIcon={
                    props.readOnly
                        ? null
                        : props.popupIcon || (
                              <Icon
                                  icon='material-symbols:expand-more-rounded'
                                  width={24}
                                  height={24}
                                  className={clsx(style['select-custom-icon'])}
                              />
                          )
                }
                data-testid={dataTest}
                PaperComponent={({ children }) => (
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
                        }}
                    >
                        {children}
                    </Paper>
                )}
                renderOption={
                    props?.renderOption ??
                    ((props, option, { selected }) => (
                        <li {...props}>
                            <span
                                style={{
                                    width: '24px',
                                    height: '22px',
                                    paddingRight: '4px',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    display: 'flex',
                                }}
                            >
                                {selected && (
                                    <Icon
                                        icon='mdi:tick'
                                        width={20}
                                        height={20}
                                        style={{ color: 'var(--colors-gama-500)' }}
                                    />
                                )}
                            </span>

                            <span className='flex-1 truncate text-sm'>
                                {getOptionLabel?.(option) ?? defaultGetOptionLabel(option)}
                            </span>
                        </li>
                    ))
                }
                sx={{
                    ...props.sx,
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
            />
        </div>
    )
}
