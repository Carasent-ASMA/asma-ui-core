import { Slider, type SliderProps } from '@mui/material'
import clsx from 'clsx'

export const StyledSlider = (props: SliderProps) => {
    const sliderClasses = props.value ? '' : 'custom-disabled'

    return (
        <Slider
            {...props}
            className={clsx(sliderClasses, props.className)}
            classes={{
                thumb: clsx(
                    'w-4 h-4 ml-1 bg-gama-600',
                    'before:shadow-none',
                    props.disabled && '!bg-delta-200',
                    props.orientation === 'vertical' && 'ml-0 mb-1',
                    sliderClasses && '!bg-delta-200',
                    props.classes?.thumb,
                ),
                rail: clsx('bg-delta-200', props.classes?.rail),
                mark: clsx(
                    'bg-white border border-delta-200 rounded-full h-2 w-2',
                    sliderClasses && '!bg-delta-200 border-delta-200',
                    props.classes?.mark,
                ),
                markActive: clsx('!bg-current border-current opacity-100', props.classes?.markActive),
                markLabel: clsx(
                    'text-delta-600 text-base font-semibold ml-1',
                    props.orientation === 'vertical' && 'ml-0 mb-1',
                    props.classes?.markLabel,
                ),
                ...props.classes,
            }}
        />
    )
}
