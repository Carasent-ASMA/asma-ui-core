import { useState } from 'react'
import { StyledDatePicker } from '../../StyledDatePicker'

export const SinglePickerExample: React.FC = () => {
    const [date, setDate] = useState<Date>()

    return (
        <StyledDatePicker
            dataTest=''
            // locale={enGB}
            mode='single'
            selected={date}
            onSelect={(e) => {
                setDate(e)
            }}
            placeholder='Placeholder'
            label='Label'
            disabledDays={{ before: new Date(Date.now()) }}
            dateFormat='dd.MM.yyyy'
        />
    )
}
