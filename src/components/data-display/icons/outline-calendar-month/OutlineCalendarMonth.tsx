import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const OutlineCalendarMonth: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='ic:outline-calendar-month'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
