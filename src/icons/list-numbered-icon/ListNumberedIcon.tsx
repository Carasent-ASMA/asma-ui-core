import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const ListNumberedIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='ic:baseline-format-list-numbered'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
