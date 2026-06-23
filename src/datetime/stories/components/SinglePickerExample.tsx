import { addDays } from 'date-fns'
import { useState } from 'react'
import { StyledDatePicker } from 'src/datetime/components/date-picker'
import { setMidnightTime, setZeroTime } from 'src/datetime/helpers'

export const SinglePickerExample: React.FC = () => {
    const [date, setDate] = useState<Date>()

    return (
        <div className='pt-4 flex items-center gap-4'>
            <StyledDatePicker
                dataTest='StyledDatePicker'
                // locale={enGB}
                mode='single'
                selected={date}
                onSelect={(e) => {
                    setDate(e)
                }}
                onInputChange={(date: Date | undefined) => setDate(date)}
                label='Test Label '
                title='Test title '
                // disabledDays={{
                //     before: setZeroTime(addDays(new Date(Date.now()), 2)),
                //     after: setMidnightTime(addDays(new Date(Date.now()), 4)),
                // }}
                disabledDays={[new Date(2025, 11, 4), new Date(2025, 11, 6), new Date(2025, 11, 24)]}
                dateFormat='dd.MM.yyyy'
                hideDefaultHelperText
            //   disallowPast
            // disallowFuture

            // helperText='Sorry this is a helper text verry long with some strange words so sorry so its verry long veery long dad asdasdasdas das adssadas das  '
            />
            <StyledDatePicker
                dataTest='StyledDatePicker'
                // locale={enGB}
                mode='single'
                selected={date}
                onSelect={(e) => {
                    setDate(e)
                }}
                onInputChange={(date: Date | undefined) => setDate(date)}
                label='Test Label '
                disabledDays={{
                    before: setZeroTime(addDays(new Date(Date.now()), 2)),
                }}
                dateFormat='dd.MM.yyyy'
            />
            <StyledDatePicker
                dataTest='StyledDatePicker'
                // locale={enGB}
                mode='single'
                selected={date}
                onSelect={(e) => {
                    setDate(e)
                }}
                readOnly
                onInputChange={(date: Date | undefined) => setDate(date)}
                label='Test Label '
                disabledDays={{
                    before: setZeroTime(addDays(new Date(Date.now()), 2)),
                    after: setMidnightTime(addDays(new Date(Date.now()), 4)),
                }}
                dateFormat='dd.MM.yyyy'
            />
        </div>
    )
}
