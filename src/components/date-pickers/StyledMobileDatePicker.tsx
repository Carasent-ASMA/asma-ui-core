import { MobileDatePicker } from '@mui/x-date-pickers'
import type { IStyledMobileDatePickerProps } from './types'

import './StyledDatePickerMobile.scss'

export const StyledMobileDatePicker: React.FC<IStyledMobileDatePickerProps> = (props) => {
    const { actions, placeholder, size, ...rest } = props

    return (
        <MobileDatePicker
            {...rest}
            slotProps={{
                ...rest.slotProps,
                dialog: {
                    className: 'StyledDatePickerMobile-dialog',
                },
                actionBar: { actions: actions ? actions : ['today'], className: 'justify-center pt-0' },
                day: {
                    classes: {
                        root: 'rounded-sm border-none w-6 h-5 m-2',
                        selected: 'bg-gama-500 text-delta-900',
                        today: 'bg-gama-600 !text-white',
                    },
                },
                leftArrowIcon: {
                    className: 'text-delta-600 w-6',
                },
                rightArrowIcon: {
                    className: 'text-delta-600 w-6',
                },
                nextIconButton: {
                    disableRipple: true,
                    className: 'px-0',
                },
                previousIconButton: {
                    disableRipple: true,
                    className: 'px-0',
                },
                textField: {
                    ...rest.slotProps?.textField,
                    placeholder,
                    size,
                },
                toolbar: {
                    className: 'px-8',
                },
            }}
        />
    )
}
