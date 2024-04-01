import { useState } from 'react'
import { StyledDatePicker } from '../../StyledDatePicker'
import type { DateRange } from 'react-day-picker'
import { nb } from 'date-fns/locale'
import { setMidnightTime, setZeroTime } from 'src/helpers/date.helper'
import { useIsMobileView } from 'src/hooks/useWindowWidthSize.hook'

export const RangePickerExample: React.FC = () => {
    const [rangeCompact, setRangeCompact] = useState<DateRange>()
    const isMobile = useIsMobileView()

    return (
        <StyledDatePicker
            label='Label'
            placeholder='Placeholder'
            dataTest=''
            locale={nb}
            numberOfMonths={isMobile ? 1 : 2}
            mode='range'
            selected={rangeCompact}
            onSelect={(data) => {
                const selected = {
                    from: data?.from ? setZeroTime(data.from) : undefined,
                    to: data?.to ? setMidnightTime(data.to) : undefined,
                }
                setRangeCompact(selected)
            }}
            dateFormat={'dd.MM.yyyy'}
        />
    )
}
