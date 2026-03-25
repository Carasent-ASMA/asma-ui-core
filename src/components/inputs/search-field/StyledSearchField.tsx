import { CloseIcon, SearchIcon, StyledInputField, type TextFieldProps } from 'asma-ui-core'
import type { FunctionComponent } from 'react'
import { useState, type ComponentProps } from 'react'
import { cn } from 'src/helpers/cn'

export type StyledSearchFieldProps = ComponentProps<typeof StyledInputField> & {
    label: Required<TextFieldProps['label']>
}

export const StyledSearchField = (({ value, onClear, ...props }) => {
    const [isFocused, setIsFocused] = useState<boolean>(false)

    const hasInteraction = isFocused || value

    return (
        <div className='relative w-full'>
            <StyledInputField
                size='small'
                variant='outlined'
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
                            className={cn(
                                'cursor-pointer bg-delta-50 rounded-full',
                                'flex items-center justify-center',
                                'transform-gpu transition-all duration-300 ease-in-out',
                                value ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none',
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
                width={24}
                height={24}
                className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2',
                    'transform-gpu transition-all duration-300 ease-in-out',
                    hasInteraction ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100',
                )}
                color='var(--colors-delta-700)'
            />
        </div>
    )
}) satisfies FunctionComponent<StyledSearchFieldProps>
