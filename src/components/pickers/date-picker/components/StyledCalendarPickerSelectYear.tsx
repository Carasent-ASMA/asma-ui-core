import { useNavigation, type DropdownProps, useDayPicker } from 'react-day-picker'
import { StyledFormControl } from 'src/components/miscellaneous/StyledFormControl'
import { StyledSelect, StyledSelectItem } from '../../../inputs/select'
import { setYear } from 'date-fns'

export const StyledCalendarPickerSelectYear: React.FC<DropdownProps> = (props) => {
    const { caption, children } = props
    const { goToMonth } = useNavigation()
    const { month } = useDayPicker()
    const monthsList = children as { key: number; props: { value: number; children: string } }[]

    const selectedOptions = monthsList?.map((month) => ({ id: month.props.value, label: month.props.children }))

    return (
        <StyledFormControl className='w-[70px] ml-[5px]'>
            <StyledSelect
                dataTest='StyledCalendarPickerSelectYear'
                size='small'
                variant='standard'
                value={caption}
                onChange={(e) => {
                    const selectedValue = e.target.value
                    const id = selectedOptions.find((opt) => opt.label === selectedValue)?.id
                    month && !isNaN(Number(id)) && goToMonth(setYear(month, Number(id)))
                }}
                MenuProps={{ className: '[&_ul]:overflow-auto [&_ul]:max-h-[250px]' }}
            >
                {selectedOptions?.map((month) => (
                    <StyledSelectItem key={month.id} value={month.label}>
                        {month.label}
                    </StyledSelectItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    )
}
