import { Autocomplete, Paper, type AutocompleteProps, type ChipTypeMap } from '@mui/material'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import style from './StyledSelectAutocomplete.module.scss'
import { cn } from 'src/helpers/cn'

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
}: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent> & {
    dataTest: string
    autoHeight?: boolean
    getOptionLabel?: (option: T) => string
    wrapperClassName?: string
}) {
    const [maxHeight, setMaxHeight] = useState<number | 'auto'>('auto')
    const selectRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const selectHeight = selectRef.current?.getBoundingClientRect().height ?? 0
        const selectTop = selectRef.current?.getBoundingClientRect().top ?? 0
        const viewportHeight = window.innerHeight
        const availableHeight = viewportHeight - selectTop - selectHeight - 40
        autoHeight && setMaxHeight(availableHeight > 0 ? availableHeight : 'auto')
    }, [autoHeight])

    const listboxProps = autoHeight
        ? {
              style: {
                  maxHeight: maxHeight === 'auto' ? 'auto' : `${maxHeight}px`,
              },
          }
        : {}

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
                    props.popupIcon || (
                        <Icon
                            icon='material-symbols:expand-more-rounded'
                            width={24}
                            height={24}
                            className={clsx(style['select-custom-icon'])}
                        />
                    )
                }
                data-test={dataTest}
                PaperComponent={({ children }) => (
                    <Paper
                        data-test={`paper-${dataTest}`}
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
                    props?.renderOption ||
                    ((props, option, { selected }) => (
                        <li {...props}>
                            <span
                                style={{
                                    width: '26px',
                                    height: '24px',
                                    paddingRight: '4px',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    display: 'flex',
                                }}
                            >
                                {selected && (
                                    <Icon
                                        icon='mdi:tick'
                                        width={24}
                                        height={24}
                                        style={{ color: 'var(--colors-gama-500)' }}
                                    />
                                )}
                            </span>

                            <span className='flex-1'>{getOptionLabel?.(option) || defaultGetOptionLabel(option)}</span>
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
