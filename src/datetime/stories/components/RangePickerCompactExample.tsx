import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { nb } from 'date-fns/locale'
import { StyledDatePicker } from 'src/datetime/components/date-picker'
import { setMidnightTime, setZeroTime } from 'src/datetime/helpers/date.helper'

export const RangePickerExample: React.FC = () => {
    const [rangeCompact, setRangeCompact] = useState<DateRange>()

    return (
        <div className='flex flex-col gap-6 pt-4'>
            <StyledDatePicker
                mode='range'
                dataTest='range-picker-example'
                locale={nb}
                labelFrom='Start date '
                labelTo='End date '
                selected={rangeCompact}
                onSelect={(data) => {
                    const selected = {
                        from: data?.from ? setZeroTime(data.from) : undefined,
                        to: data?.to ? setMidnightTime(data.to) : undefined,
                    }
                    setRangeCompact(selected)
                }}
                onInputChange={(data) => {
                    const selected = {
                        from: data?.from ? setZeroTime(data.from) : undefined,
                        to: data?.to ? setMidnightTime(data.to) : undefined,
                    }
                    setRangeCompact(selected)
                }}
                dateFormat={'dd.MM.yyyy'}
                helperTextFrom='* Påkrevd'
                // hideCalendar
            />
            <StyledDatePicker
                mode='range'
                dataTest='range-picker-example'
                locale={nb}
                labelFrom='Start date '
                labelTo='End date '
                selected={rangeCompact}
                onSelect={(data) => {
                    const selected = {
                        from: data?.from ? setZeroTime(data.from) : undefined,
                        to: data?.to ? setMidnightTime(data.to) : undefined,
                    }
                    setRangeCompact(selected)
                }}
                disabled
                onInputChange={(data) => {
                    const selected = {
                        from: data?.from ? setZeroTime(data.from) : undefined,
                        to: data?.to ? setMidnightTime(data.to) : undefined,
                    }
                    setRangeCompact(selected)
                }}
                dateFormat={'dd.MM.yyyy'}
                helperTextFrom='* Påkrevd'
                // hideCalendar
            />
            <StyledDatePicker
                mode='range'
                dataTest='range-picker-example'
                locale={nb}
                labelFrom='Start date '
                labelTo='End date '
                readOnly
                selected={rangeCompact}
                onSelect={(data) => {
                    const selected = {
                        from: data?.from ? setZeroTime(data.from) : undefined,
                        to: data?.to ? setMidnightTime(data.to) : undefined,
                    }
                    setRangeCompact(selected)
                }}
                onInputChange={(data) => {
                    const selected = {
                        from: data?.from ? setZeroTime(data.from) : undefined,
                        to: data?.to ? setMidnightTime(data.to) : undefined,
                    }
                    setRangeCompact(selected)
                }}
                dateFormat={'dd.MM.yyyy'}
                helperTextFrom='* Påkrevd'
                // hideCalendar
            />
        </div>
    )
}
