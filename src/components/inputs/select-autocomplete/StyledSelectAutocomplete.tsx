import { Autocomplete, Paper, type AutocompleteProps, type ChipTypeMap } from '@mui/material'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import style from './StyledSelectAutocomplete.module.scss'

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
    ...props
}: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent> & {
    dataTest: string
    autoHeight?: boolean
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

    return (
        <div className={style['styledSelectAutocompleteWrapper']} ref={selectRef}>
            <Autocomplete
                {...props}
                ListboxProps={listboxProps}
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
                            marginBottom: '24px !important',
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
