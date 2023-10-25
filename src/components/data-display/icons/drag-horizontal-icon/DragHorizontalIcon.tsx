import type { IIcon } from '../Icons.types'
import { IconTemplate } from '../IconTemplate'

export const DragHorizontalIcon: React.FC<IIcon> = ({ width = 20, height = 20, className = '', onClick, color }) => {
    return (
        <IconTemplate
            icon='akar-icons:drag-horizontal'
            width={width}
            height={height}
            className={className}
            onClick={onClick}
            color={color}
        />
    )
}
