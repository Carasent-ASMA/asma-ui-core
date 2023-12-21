import { type DropdownProps } from 'react-day-picker'

export const StyledCalendarPickerSelectMonth: React.FC<DropdownProps> = (props) => {
    const { caption } = props
    console.log('StyledCalendarPickerSelectMonth ->>', props)

    return <div className='mx-2 cursor-pointer'>{caption}</div>
}
