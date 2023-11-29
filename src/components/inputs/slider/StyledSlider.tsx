import { Slider, type SliderProps } from '@mui/material'
import clsx from 'clsx'

export interface StyledSliderProps extends SliderProps {
    dataTest: string
}

export const StyledSlider = ({ dataTest, ...props }: StyledSliderProps) => {
    return (
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
                        'w-4 h-4',
                        'before:shadow-none',
                        props.orientation === 'vertical' ? 'ml-0 mb-1' : 'ml-1',
                        props.disabled || !props.value ? 'bg-delta-200' : 'bg-gama-600',
                    ),
                    ...props.slotProps?.thumb,
                },
                rail: {
                    className: 'bg-delta-200',
                    ...props.slotProps?.rail,
                },
                markLabel: {
                    className: clsx(
                        'text-delta-600 text-sm font-semibold ml-1',
                        props.orientation === 'vertical' && 'mb-1',
                    ),
                    ...props.slotProps?.markLabel,
                },
            }}
            sx={{
                ...props.sx,
                '& .MuiSlider-track': {
                    backgroundColor: props.disabled ? 'var(--colors-gray-200)' : 'var(--colors-gama-600)',
                    borderColor: props.disabled ? 'var(--colors-gray-200)' : 'var(--colors-gama-600)',
                },
                '& .MuiSlider-mark': {
                    backgroundColor: 'white',
                    border: '1px solid var(--colors-gray-200)',
                    borderRadius: '50%',
                    height: '8px',
                    width: '8px',

                    '&.MuiSlider-markActive': {
                        backgroundColor: !props.disabled ? 'var(--colors-gama-600)' : 'var(--colors-gray-200)',
                        border: '1px solid',
                        borderColor: !props.disabled ? 'var(--colors-gama-600)' : 'var(--colors-gray-200)',
                        opacity: 1,
                    },
                },
            }}
        />
    )
}
