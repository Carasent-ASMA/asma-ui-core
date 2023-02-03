import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const DotsVerticalIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='mdi:dots-vertical'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
