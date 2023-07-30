import { Slider, type SliderProps } from '@mui/material'
import clsx from 'clsx'

export const StyledSlider = (props: SliderProps) => {
    const sliderClasses = props.value ? '' : 'custom-disabled'

    return (
        <Slider
            {...props}
            className={clsx(sliderClasses, props.className)}
            classes={{
                ...props.classes,
                markActive: clsx('bg-gama-600 border-gama-600 opacity-100', props.classes?.markActive),
            }}
            slotProps={{
                ...props.slotProps,
                thumb: {
                    className: clsx(
                        'w-4 h-4',
                        'before:shadow-none',
                        props.orientation === 'vertical' ? 'ml-0 mb-1' : 'ml-1',
                        props.disabled || sliderClasses ? 'bg-delta-200' : 'bg-gama-600',
                    ),
                    ...props.slotProps?.thumb,
                },
                rail: {
                    className: 'bg-delta-200',
                    ...props.slotProps?.rail,
                },
                mark: {
                    className: 'bg-white border border-delta-200 rounded-full h-2 w-2',
                    ...props.slotProps?.mark,
                },
                markLabel: {
                    className: clsx(
                        'text-delta-600 text-base font-semibold ml-1',
                        props.orientation === 'vertical' && 'mb-1',
                    ),
                    ...props.slotProps?.markLabel,
                },
            }}
        />
    )
}
