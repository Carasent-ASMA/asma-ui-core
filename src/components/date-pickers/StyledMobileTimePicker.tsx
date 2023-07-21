import { MobileTimePicker, type MobileTimePickerProps } from '@mui/x-date-pickers'
import type { FC } from 'react'

export const StyledMobileTimePicker: FC<MobileTimePickerProps<Date>> = (props) => {
    return <MobileTimePicker {...props} />
}
