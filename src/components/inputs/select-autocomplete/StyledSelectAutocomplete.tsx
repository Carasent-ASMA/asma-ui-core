import { Autocomplete, Paper, type AutocompleteProps, type ChipTypeMap } from '@mui/material'
import { Icon } from '@iconify/react'
import clsx from 'clsx'

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
>(props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent> & { dataTest: string }) {
    return (
        <Autocomplete
            {...props}
            className={clsx('!text-sm', props.className)}
            popupIcon={
                <Icon
                    icon='material-symbols:expand-more-rounded'
                    width={24}
                    height={24}
                    className={clsx(props.className, 'select-custom-icon')}
                />
            }
            data-test={props.dataTest}
            PaperComponent={({ children }) => (
                <Paper
                    data-test={`paper-${props.dataTest}`}
                    sx={{
                        '& .MuiAutocomplete-option.Mui-focused': {
                            background: 'var(--colors-gama-300) !important',
                        },
                        '& li[aria-selected=true]': {
                            background: 'var(--colors-gama-100) !important',
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
                    marginTop: '-3.5px !important',
                },
                '& .MuiInputBase-inputSizeSmall': {
                    minHeight: '23px !important',
                },
            }}
        />
    )
}
