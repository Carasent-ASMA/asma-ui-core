import { IconTemplate } from '../IconTemplate'
import type { IIcon } from '../Icons.types'

export const FastCheckOutlineIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='material-symbols:fact-check-outline'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
