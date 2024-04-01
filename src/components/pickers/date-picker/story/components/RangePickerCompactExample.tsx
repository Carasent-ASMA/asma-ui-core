import { useState } from 'react'
import { StyledDatePicker } from '../../StyledDatePicker'
import type { DateRange } from 'react-day-picker'
import { nb } from 'date-fns/locale'
import { setMidnightTime, setZeroTime } from 'src/helpers/date.helper'
import { useIsMobileView } from 'src/hooks/useWindowWidthSize.hook'

export const RangePickerCompactExample: React.FC = () => {
    const [rangeCompact, setRangeCompact] = useState<DateRange>()
    const isMobile = useIsMobileView()

    return (
        <StyledDatePicker
            dataTest=''
            locale={nb}
            placeholderFrom='Fra'
            placeholderTo='Til'
            labelFrom='Fra'
            labelTo='Til'
            numberOfMonths={isMobile ? 1 : 2}
            compact={true}
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
