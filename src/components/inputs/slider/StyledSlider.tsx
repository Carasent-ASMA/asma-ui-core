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
    )
}
