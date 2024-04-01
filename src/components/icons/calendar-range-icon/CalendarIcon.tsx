import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const CalendarRangeIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='mdi:calendar-range'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
