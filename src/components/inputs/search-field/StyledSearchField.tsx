import { CloseIcon, SearchIcon, StyledInputField } from 'asma-core-ui'
import { useState, type FC, type ComponentProps } from 'react'
import { cn } from 'src/helpers/cn'

export const StyledSearchField: FC<ComponentProps<typeof StyledInputField>> = ({ value, onClear, ...props }) => {
    const [isFocused, setIsFocused] = useState<boolean>(false)

    const hasInteraction = isFocused || value

    return (
        <div className={'relative w-fit'}>
            <StyledInputField
                size={'small'}
                variant={'outlined'}
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                InputProps={{
                    className: cn(
                        'transition-[padding] duration-300',
                        hasInteraction ? 'pl-0' : 'pl-5',
                        value ? 'pr-5' : 'pr-0',
                    ),
                    sx: {
                        '& input': {
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                        },
                    },
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
                    width: 160,
                    ...props.sx,
                }}
            />

            <SearchIcon
                width={24}
                height={24}
                className={cn(
                    'absolute top-2 left-2',
                    'transform-gpu transition-all duration-300 ease-in-out',
                    hasInteraction ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100',
                )}
                color={'var(--colors-delta-700)'}
            />

            <div
                className={cn(
                    'absolute right-2 top-2 cursor-pointer bg-delta-50 rounded-full outline outline-1 outline-delta-100',
                    'flex items-center justify-center',
                    'transform-gpu transition-all duration-300 ease-in-out',
                    value ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none',
                )}
                onMouseDown={onClear}
            >
                <CloseIcon width={24} height={24} color={'var(--colors-delta-700)'} />
            </div>
        </div>
    )
}
