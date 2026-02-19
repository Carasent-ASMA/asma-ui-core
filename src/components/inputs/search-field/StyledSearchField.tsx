import { CloseIcon, SearchIcon, StyledInputField, type TextFieldProps } from 'asma-core-ui'
import type { FC } from 'react'
import { useState, type ComponentProps } from 'react'
import { cn } from 'src/helpers/cn'

export type StyledSearchFieldProps = ComponentProps<typeof StyledInputField> & {
    label: Required<TextFieldProps['label']>
}

export const StyledSearchField: FC<StyledSearchFieldProps> = ({ value, onClear, ...props }) => {
    const [isFocused, setIsFocused] = useState<boolean>(false)

    const hasInteraction = isFocused || value

    return (
        <div className='relative w-full'>
            <StyledInputField
                size='small'
                variant='outlined'
                value={value}
                onFocus={() => {
                    setIsFocused(true)
                }}
                onBlur={() => {
                    setIsFocused(false)
                }}
                InputProps={{
                    className: cn('transition-[padding] duration-300', hasInteraction ? 'pl-0' : 'pl-5'),
                    sx: {
                        '& input': {
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                        },
                    },
                    endAdornment: value ? (
                        <div
                            data-testid='styled-search-clear-icon'
                            className={cn(
                                'cursor-pointer rounded-full bg-delta-50',
                                'flex items-center justify-center',
                                'transform-gpu transition-all duration-300 ease-in-out',
                                value ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
                            )}
                            style={{
                                width: 24,
                                height: 24,
                                flexShrink: 0,
                            }}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onClear?.()
                            }}
                        >
                            <CloseIcon
                                width={20}
                                height={20}
                                color='var(--colors-delta-700)'
                                className='pointer-events-none'
                            />
                        </div>
                    ) : null,
                }}
                InputLabelProps={{
                    sx: {
                        transform: 'translate(34px, 9px) scale(1)',
                        width: hasInteraction ? undefined : 'calc(100% - 42px)',
                        '&.MuiInputLabel-shrink': {
                            transform: 'translate(16px, -9px) scale(0.75)',
                        },
                    },
                }}
                {...props}
                sx={{
                    ...(props.fullWidth ? { width: '100%' } : { width: 160 }),
                    ...props.sx,
                }}
            />

            <SearchIcon
                data-testid='styled-search-icon'
                width={24}
                height={24}
                className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2',
                    'transform-gpu transition-all duration-300 ease-in-out',
                    hasInteraction ? 'pointer-events-none scale-75 opacity-0' : 'scale-100 opacity-100',
                    props.error && 'top-1/3',
                )}
                color='var(--colors-delta-700)'
            />
        </div>
    )
}
