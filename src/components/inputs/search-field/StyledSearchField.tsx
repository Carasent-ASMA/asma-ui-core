import { CloseIcon, SearchIcon, type TextFieldProps } from 'asma-ui-core'
import type { FC } from 'react'
import { useState, type ComponentProps } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledInputField } from '../input-field/StyledInputField'

export type StyledSearchFieldProps = ComponentProps<typeof StyledInputField> & {
    label: Required<TextFieldProps['label']>
}

export const StyledSearchField: FC<StyledSearchFieldProps> = ({ value, onClear, ...props }) => {
    const [isFocused, setIsFocused] = useState<boolean>(false)

    const hasInteraction = isFocused || value
    const inputPaddingLeft = isFocused ? 0 : value ? 14 : 20

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
                slotProps={{
                    htmlInput: {
                        style: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            paddingLeft: inputPaddingLeft,
                            ...(value ? { paddingRight: 40 } : {}),
                        },
                    },
                    input: {
                        className: cn(
                            'transition-[padding] duration-300',
                            isFocused ? 'pl-0' : value ? 'pl-[14px]' : 'pl-5',
                            props.readOnly && 'text-black/[0.38]',
                        ),
                        endAdornment: value ? (
                            <div
                                data-testid='styled-search-clear-icon'
                                className={cn(
                                    'cursor-pointer rounded-full bg-delta-50',
                                    'flex items-center justify-center',
                                    'transform-gpu transition-all duration-300 ease-in-out',
                                    value ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
                                    props.readOnly && '-translate-x-[6.5px]',
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
                    },
                    inputLabel: {
                        // At rest the label doubles as the placeholder; nudge it right to clear the leading
                        // search icon. Base floatingLabelClass already centers it vertically and floats it on
                        // shrink (both match v3.34.0 — verified by inputs-inputfield--default), so we override
                        // horizontal offset only.
                        className: hasInteraction ? undefined : 'ml-5',
                        style: { width: hasInteraction ? undefined : 'calc(100% - 42px)' },
                    },
                }}
                {...props}
                sx={{
                    ...(props.fullWidth ? { width: '100%' } : { width: 160 }),
                    ...(props.sx as object),
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
                    // The icon is positioned against the outer wrapper, which grows when the error helper
                    // text appears; nudge it up so it stays centered in the input box (matches v3.34.0).
                    props.error && 'top-1/3',
                )}
                color='var(--colors-delta-700)'
            />
        </div>
    )
}
