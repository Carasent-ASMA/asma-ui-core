import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const DropDownIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='ic:baseline-arrow-drop-down'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
