import { useState } from 'react'
import { StyledDatePicker } from '../../StyledDatePicker'

export const SinglePickerExample: React.FC = () => {
    const [date, setDate] = useState<Date>()

    return (
        <div className='flex items-center gap-4'>
            <StyledDatePicker
                dataTest=''
                // locale={enGB}
                mode='single'
                selected={date}
                onSelect={(e) => setDate(e)}
                placeholder='Placeholder'
                label='Label'
                disabledDays={{ before: new Date(Date.now()) }}
                dateFormat='dd.MM.yyyy'
            />
            <StyledDatePicker
                dataTest=''
                // locale={enGB}
                mode='single'
                selected={date}
                disabled
                onSelect={(e) => setDate(e)}
                placeholder='Placeholder'
                label='Label'
                disabledDays={{ before: new Date(Date.now()) }}
                dateFormat='dd.MM.yyyy'
            />
            <StyledDatePicker
                dataTest=''
                // locale={enGB}
                mode='single'
                readOnly
                selected={date}
                onSelect={(e) => setDate(e)}
                placeholder='Placeholder'
                label='Label'
                disabledDays={{ before: new Date(Date.now()) }}
                dateFormat='dd.MM.yyyy'
            />
        </div>
    )
}
