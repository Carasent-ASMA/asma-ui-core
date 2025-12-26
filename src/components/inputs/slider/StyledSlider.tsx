import { Slider, type SliderProps } from '@mui/material'
import { ErrorOutlineIcon } from 'asma-ui-icons'
import clsx from 'clsx'
import { StyledFormHelperText } from 'src'

export interface StyledSliderProps extends SliderProps {
    dataTest: string
    error?: boolean
    errorText?: string
    helperText?: string
}

export const StyledSlider = ({ dataTest, error, errorText, helperText, ...props }: StyledSliderProps): JSX.Element => {
    const showHelperText = (error ?? false) || (helperText ?? false)
    const helperTextToDisplay = error ? errorText ?? 'Required' : helperText

    return (
        <>
            <Slider
                {...props}
                data-test={dataTest}
                classes={{
                    ...props.classes,
                }}
                slotProps={{
                    ...props.slotProps,
                    thumb: {
                        className: clsx(
                            'h-4 w-4',
                            'before:shadow-none',
                            'after:h-8 after:w-8 after:content-[""]',
                            props.orientation === 'vertical' ? 'mb-1 ml-0' : 'ml-1',
                            props.disabled ? 'bg-delta-200' : 'bg-gama-500',
                        ),
                        ...props.slotProps?.thumb,
                    },
                    rail: {
                        className: 'bg-delta-200',
                        ...props.slotProps?.rail,
                    },
                    markLabel: {
                        className: clsx(
                            'ml-1 text-sm font-semibold text-delta-600',
                            props.orientation === 'vertical' && 'mb-1',
                        ),
                        ...props.slotProps?.markLabel,
                    },
                }}
                sx={{
                    ...props.sx,
                    '& .MuiSlider-track': {
                        backgroundColor: props.disabled ? 'var(--colors-gray-200)' : 'var(--colors-gama-500)',
                        borderColor: props.disabled ? 'var(--colors-gray-200)' : 'var(--colors-gama-500)',
                    },
                    '& .MuiSlider-mark': {
                        backgroundColor: 'white',
                        border: '1px solid var(--colors-delta-300)',
                        borderRadius: '50%',
                        height: '8px',
                        width: '8px',

                        '&.MuiSlider-markActive': {
                            backgroundColor: !props.disabled ? 'var(--colors-gama-500)' : 'var(--colors-gray-200)',
                            border: '1px solid',
                            borderColor: !props.disabled ? 'var(--colors-gama-500)' : 'var(--colors-gray-200)',
                            opacity: 1,
                        },
                    },
                }}
            />

            {showHelperText && (
                <StyledFormHelperText
                    className={clsx(
                        'm-0 flex items-center gap-1 pt-1 text-sm',
                        error ? 'text-error-500' : 'text-delta-600',
                    )}
                >
                    {error && <ErrorOutlineIcon width={20} height={20} />}
                    {helperTextToDisplay}
                </StyledFormHelperText>
            )}
        </>
    )
}
