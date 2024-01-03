import { useState } from 'react'
import { StyledDatePicker } from '../../StyledDatePicker'

export const DefaultPickerExample: React.FC = () => {
    const [date, setDate] = useState<Date>()

    return (
        <StyledDatePicker
            dataTest=''
            // locale={enGB}
            placeholder='Pick a date'
            mode='single'
            selected={date}
            onSelect={(e) => {
                setDate(e)
            }}
            inputClassName='w-[130px]'
            disabledDays={{ before: new Date(Date.now()) }}
        />
    )
}
