import { type DropdownProps } from 'react-day-picker'

export const StyledCalendarPickerSelectYear: React.FC<DropdownProps> = (props) => {
    const { caption } = props

    console.log('StyledCalendarPickerSelectYear ->>', props)

    return <div className='mx-2 cursor-pointer'>{caption}</div>
}
