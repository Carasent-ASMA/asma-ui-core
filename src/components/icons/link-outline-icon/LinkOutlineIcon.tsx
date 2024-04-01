import { IconTemplate } from '../IconTemplate'
import type { IIcon } from '../Icons.types'

export const LinkOutlineIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='ic:outline-link'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
