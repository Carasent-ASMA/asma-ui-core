import { CloseIcon, SearchIcon, type TextFieldProps } from 'asma-ui-core'
import type { FC } from 'react'
import { useState, type ComponentProps } from 'react'
import { cn } from 'src/helpers/cn'
import { StyledInputField } from '../input-field/StyledInputField'

export type StyledSearchFieldProps = ComponentProps<typeof StyledInputField> & {
    label: Required<TextFieldProps['label']>
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#28496-138521 (rest) · #27857-162809 (focused/filled)
 * Figma Search field: at rest the label is an in-field placeholder (Body Base 16, placeholder
 * delta-500) with Icon-left (8px + 24px icon + 8px) inside the 40px outlined field — no floating
 * label. On focus/filled the icon hides, the label floats (Small 12, gama-500), and a clear icon
 * may appear on the right.
 */
export const StyledSearchField: FC<StyledSearchFieldProps> = ({
    value,
    onClear,
    label,
    onFocus,
    onBlur,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState<boolean>(false)

    const hasInteraction = isFocused || value
    const placeholderText = typeof label === 'string' ? label : undefined

    return (
        <div className='relative w-full'>
            <StyledInputField
                size='small'
                variant='outlined'
                value={value}
                // Figma: floating label only when focused/filled; at rest the label string is the placeholder.
                label={hasInteraction ? label : undefined}
                placeholder={!hasInteraction ? placeholderText : undefined}
                onFocus={(event) => {
                    setIsFocused(true)
                    onFocus?.(event)
                }}
                onBlur={(event) => {
                    setIsFocused(false)
                    onBlur?.(event)
                }}
                slotProps={{
                    htmlInput: {
                        style: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            ...(value ? { paddingRight: 40 } : {}),
                        },
                        // When the visible label is hidden, keep an accessible name on the control.
                        'aria-label': !hasInteraction ? placeholderText : undefined,
                    },
                    input: {
                        endAdornment: value ? (
                            // Native <button>: icon-only, was a <div onClick> with no accessible name or
                            // keyboard access.
                            <button
                                type='button'
                                aria-label='Clear'
                                data-testid='styled-search-clear-icon'
                                className={cn(
                                    'cursor-pointer rounded-full border-0 bg-delta-50',
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
                            </button>
                        ) : null,
                        startAdornment: !hasInteraction ? (
                            <span data-testid='styled-search-icon' className='flex items-center'>
                                <SearchIcon
                                    width={24}
                                    height={24}
                                    color='var(--colors-delta-700)'
                                    className='pointer-events-none'
                                />
                            </span>
                        ) : undefined,
                    },
                }}
                {...props}
                sx={{
                    width: props.fullWidth ? '100%' : 'var(--dynamic-toolbar-search-width, 160px)',
                    ...(props.sx as object),
                }}
            />
        </div>
    )
}
